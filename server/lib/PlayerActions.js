const _ = require('lodash');
const pull = require('lodash/pull');
const sampleSize = require('lodash/sampleSize');
const mongoose = require('mongoose');

const config = require('../config/config');
const logger = config.logger('lib:PlayerActions');

const { partition, isEmpty, union } = require('lodash');
const WSSActions = require('./WSSActions');

// Custom iterator to iterate through players in specific order
const playerIt = pl => {
	let index = 0;

	return {
		next: () => {
			if (index >= pl.length) {
				index = 0;
			}

			return pl[index++];
		},
	};
};

class PlayerActions extends WSSActions {
	constructor(wss, ws, sid) {
		super(wss, ws, sid);

		this.player = require('../routes/modules/player');

		this.namespace = 'wsPlayers';

		this.hoardPlayer = null;
		this.playerSession = {
			sessionId: sid,
		};
	}

	getMyCards() {
		this.player.model
			.find(this.playerSession)
			.select('+sessionId +cardsInHand')
			.populate({
				path: 'cardsInHand',
				model: 'Card',
				options: { sort: '-amount' },
			})
			.exec()
			.then(list => {
				if (list[0]) {
					const wsData = {
						action: 'getMyCards',
						nuts: list[0],
					};

					this.send(wsData, { all: false });
				}
			})
			.catch(err => {
				logger.error(err);
			});
	}

	async drawCard(data) {
		logger.debug(data);

		try {
			await this.player.update(data.playerId, { hasDrawnCard: true }, this.sid);
		} catch (err) {
			logger.error(err);
			this.send({ error: err });
		}
	}

	/** Action Card **/

	ambush(data) {
		logger.debug(data);

		const stealCards = players => {
			const playersSplit = partition(players, pl => pl.isActive);
			const opponentsUpdated = [];
			let cards = [];

			logger.debug('stealCards -> ', playersSplit);

			const playerToUpdate = playersSplit[0][0];
			const opponents = playersSplit[1];

			opponents.forEach(pl => {
				logger.debug('opponent -> ', pl);

				// Only update if the player has at least 1 card
				if (!isEmpty(pl.cardsInHand)) {
					const card = sampleSize(pl.cardsInHand)[0];

					pull(pl.cardsInHand, card);
					cards.push(card);

					// FIXME: Handle update completed & error
					opponentsUpdated.push(this.player.update(pl.id, { cardsInHand: pl.cardsInHand }, this.sid));
				}
			});

			return Promise.all(opponentsUpdated)
				.then(() => {
					logger.debug('give cards to player -> ', playerToUpdate);

					cards = union(cards, playerToUpdate.cardsInHand);
					logger.debug('cards -> ', cards);

					return player
						.update(
							playerToUpdate.id,
							{ cardsInHand: cards },
							this.sid
						)
						.then(() => {
							return game.resetActionCard(data.gameId, this.sid);
						});
				})
				.catch(err => {
					logger.error(err);
				});
		};

		return player
			.findPlayersWithCards({ gameId: data.gameId })
			.then(docs => {
				logger.debug('playersWithCards -> ', docs);

				stealCards(docs)
					.then(() => {
						return game.resetActionCard(data.gameId, this.sid);
					})
					.catch(err => {
						throw new Error(err);
					});
			});
	}

	async hoard(data) {
		logger.debug(data);

		if (!this.hoardPlayer) {
			const { player, deckId } = data;

			// delete player.cardsInHand;
			this.hoardPlayer = this.playerSession;

			this.send({
				action: `actioncard_${data.action}`,
				nuts: player,
			});

			const hoardCards = (await this.deck.getDecksWithCards(deckId)).cards;

			logger.debug(hoardCards);

			const newCards = union(player.cardsInHand.map(card => card.id), hoardCards.map(card => card.id));

			this.player.update(
				player.id,
				{
					cardsInHand: newCards,
					addCards: true,
				},
				this.sid,
			);

			this.deck.update(
				deckId,
				{ cards: [] },
				this.sid,
			);

			setTimeout(() => {
				this.hoardPlayer = null;
			}, 1000);
		} else {
			this.send({
				action: 'showMessage',
				nuts: 'NO HOARD FOR YOU!',
			}, { all: false });
		}
	}

	/**
	 * Handle a player selecting card for Quarrel action
	 *
	 * @param {object} data 'player' & 'card'
	 * @returns {void}
	 */
	quarrel(data) {
		logger.info(data);

		const nuts = {
			playerId: data.player || null,
		};

		if (Object.prototype.hasOwnProperty.call(data, 'card')) {
			nuts.card = data.card;
		}

		this.send({ action: `actioncard_${data.action}`, nuts });
	}

	whirlwind(data) {
		logger.debug(data);

		const gameId = data.gameId;

		player
			.findPlayersWithCards({ gameId })
			.then(players => {
				let cardIds = [];
				let startPlayer = 0;

				const dealCards = () => {
					const playersOrder = union(
						players.slice(startPlayer),
						players.slice(0, startPlayer)
					);

					logger.debug('cardIds (before) -> ', cardIds);

					cardIds = _(cardIds)
						.flatten()
						.shuffle()
						.value();

					logger.debug('cardIds (after) -> ', cardIds);

					const pIt = playerIt(playersOrder);

					cardIds.forEach(id => {
						const player = pIt.next();

						this.player.cardsInHand.push(id);
					});

					const playersUpdated = [];

					playersOrder.forEach(pl => {
						const playerData = {
							cardsInHand: pl.cardsInHand,
						};

						logger.debug('playerData -> ', playerData);

						playersUpdated.push(
							this.player.update(
								pl.id,
								playerData,
								this.sid
							)
						);
					});

					// setTimeout(() => {
					return Promise.all(playersUpdated)
						.then(() => {
							return game.resetActionCard(gameId, this.sid)
								.catch(err => {
									logger.error(`ERROR: Unable to reset action card -> ${err}`);
								});
						})
						.catch(err => {
							logger.error(err);
						});
					// }, 1500);
				};

				logger.debug('players -> ', players);

				const updatePromises = [];

				players.forEach((pl, index) => {
					const plCards = pl.cardsInHand.slice(); // Copy array

					cardIds = union(cardIds, plCards);

					// Remove cards from player's hand
					pl.cardsInHand = [];

					updatePromises.push(
						this.player.update(
							pl.id,
							{ cardsInHand: [] },
							this.sid
						)
					);

					if (pl.isActive) {
						startPlayer = index;
					}
				});

				Promise.all(updatePromises).then(() => {
					setTimeout(dealCards, 1000);
				});
			});
	}
}

module.exports = PlayerActions;
