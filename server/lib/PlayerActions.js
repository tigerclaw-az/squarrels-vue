const _ = require('lodash');
const pull = require('lodash/pull');
const sampleSize = require('lodash/sampleSize');
const mongoose = require('mongoose');

const config = require('../config/config');
const logger = config.logger('PlayerActions');

const player = require('../routes/modules/player');
const game = require('../routes/modules/game');

const playerModel = mongoose.model('Player');

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

class PlayerActions {
	constructor(wss, ws, sid) {
		this.wss = wss;
		this.ws = ws;
		this.sid = sid;

		this.hoardPlayer = null;
		this.namespace = 'wsPlayers';
		this.playerSession = {
			sessionId: sid,
		};
	}

	send(data, options = { all: true }) {
		logger.debug(data, options);

		const wsData = {
			namespace: this.namespace,
			...data,
		};

		if (options.all) {
			return this.wss.broadcast(wsData, this.sid);
		}

		return this.ws.send(JSON.stringify(wsData));
	}

	getMyCards() {
		playerModel
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
					logger.info('getMyCards -> ', list[0]);

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

	ambush(data) {
		logger.debug(data);

		const stealCards = players => {
			let cards = [];
			let playerToUpdate = {};

			players.forEach(pl => {
				const card = sampleSize(pl.cardsInHand)[0];
				let opponent = {};

				if (!pl.isActive) {
					logger.debug('card -> ', card);

					// Only update if the player has at least 1 card
					if (card) {
						pull(pl.cardsInHand, card);
						cards.push(card);

						opponent = {
							cardsInHand: pl.cardsInHand,
						};

						// FIXME: Handle update completed & error
						player
							.update(pl.id, opponent, this.sid)
							.then(() => {})
							.catch(() => {});
					}
				} else {
					cards = _.union(cards, pl.cardsInHand);
					playerToUpdate = pl;
					logger.debug(
						'playerToUpdate -> ',
						playerToUpdate
					);
				}
			});

			const plData = {
				cardsInHand: cards,
			};

			return player.update(playerToUpdate.id, plData, this.sid);
		};

		player
			.getState({ gameId: data.gameId })
			.then(stealCards)
			.then(() => {
				return game.resetActionCard(data.gameId, this.sid);
			})
			.catch(err => {
				logger.error(err);
			});
	}

	hoard(data) {
		logger.debug(data);

		delete data.player.cardsInHand;

		if (!this.hoardPlayer) {
			this.hoardPlayer = this.playerSession;

			// 	FIXME: HACK!!
			setTimeout(() => {
				this.send({
					action: `actioncard_${data.action}`,
					nuts: data.player,
				});
				this.hoardPlayer = null;

				// game.resetActionCard();
			}, 250);
		} else {
			this.send({
				action: 'showMessage',
				nuts: 'NO HOARD FOR YOU!',
			}, { all: false });
		}
	}

	quarrel(data) {
		logger.debug(data);

		const nuts = {
			playerId: data.player || null,
		};

		if (data.hasOwnProperty('card')) {
			nuts.card = data.card;
		}

		this.send({ action: `actioncard_${data.action}`, nuts });
	}

	whirlwind(data) {
		logger.debug(data);

		player
			.getState({ gameId: data.gameId })
			.then(players => {
				let cardIds = [];
				let startPlayer = 0;
				const updatePromises = [];

				const dealCards = () => {
					const playersOrder = _.union(
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

						player.cardsInHand.push(id);
					});

					playersOrder.forEach(pl => {
						const playerData = {
							cardsInHand: pl.cardsInHand,
						};

						logger.debug('playerData -> ', playerData);

						player.update(
							pl.id,
							playerData,
							this.sid
						);
					});

					setTimeout(() => {
						game.resetActionCard(data.gameId, this.sid)
							.catch(err => {
								logger.error(`ERROR: Unable to reset action card -> ${err}`);
							});
					}, 1500);
				};

				logger.debug('players -> ', players);

				players.forEach((pl, index) => {
					const plCards = pl.cardsInHand.slice(); // Copy array

					cardIds = _.union(cardIds, plCards);

					// Remove cards from player's hand
					pl.cardsInHand = [];
					updatePromises.push(
						player.update(
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
