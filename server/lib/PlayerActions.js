const _ = require('lodash');
const pull = require('lodash/pull');
const sampleSize = require('lodash/sampleSize');

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

					return this.player
						.update(
							playerToUpdate.id,
							{ cardsInHand: cards },
							this.sid
						)
						.then(() => {
							return this.game.resetActionCard(data.gameId, this.sid);
						});
				})
				.catch(err => {
					logger.error(err);
				});
		};

		return this.player
			.findPlayersWithCards({ gameId: data.gameId })
			.then(docs => {
				logger.debug('playersWithCards -> ', docs);

				stealCards(docs)
					.then(() => {
						return this.game.resetActionCard(data.gameId, this.sid);
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

	async whirlwind(data) {
		logger.debug(data);

		const gameId = data.gameId;
		const players = await this.player.findPlayersWithCards({ gameId });
		const playersOrder = [...players];
		const activePlayerIndex = players.findIndex(pl => pl.isActive);
		const activePlayer = players[activePlayerIndex];

		logger.debug('players -> ', players);
		logger.debug('activePlayer -> ', activePlayer);

		// Move active player from current order so they receive cards first
		playersOrder.splice(activePlayerIndex, 1);
		playersOrder.splice(0, 0, activePlayer);

		const dealCards = cardIds => {
			logger.debug('playersOrder -> ', playersOrder);
			logger.debug('dealCards -> ', cardIds);

			const pIt = playerIt(playersOrder);

			return cardIds.reduce(async(promise, id) => {
				await promise;

				const player = pIt.next();

				try {
					return this.player.update(
						player.id,
						{
							addCards: true,
							cardsInHand: [id],
						},
						this.sid,
					);
				} catch (e) {
					logger.error(e);
					throw new Error(e);
				}
			}, Promise.resolve());
		};

		try {
			// Remove cards from ALL players, then shuffle cards and deal each card back to all players
			Promise.all(players.map(async pl => {
				await this.player.update(
					pl.id,
					{ cardsInHand: [] },
					this.sid
				);

				return pl.cardsInHand;
			})).then(cards => {
				logger.debug('cardIds (before) -> ', cards);

				const cardIds = _(cards)
					.flatten()
					.shuffle()
					.value();

				logger.debug('cardIds (after) -> ', cardIds);

				setTimeout(() => {
					dealCards(cardIds)
						.then(() => {
							return this.game.resetActionCard(gameId, this.sid);
						})
						.catch(err => {
							logger.error(`ERROR: Unable to reset action card -> ${err}`);
							throw new Error(err);
						});
				}, 1000);
			});
		} catch (e) {
			logger.error(e);
		}
	}
}

module.exports = PlayerActions;
