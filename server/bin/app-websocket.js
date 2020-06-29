const _ = require('lodash');
const config = require('../config/config');
const logger = config.logger('websocket');
const mongoose = require('mongoose');
const Q = require('q');

const WebsocketServer = require('../lib/websocketServer');
const gameMod = require('../routes/modules/game');
const player = require('../routes/modules/player');
const playerModel = mongoose.model('Player');

let hoardPlayer = null;

const resetActionCard = (id, sid) => {
	// Remove the 'actionCard' from the game, which will trigger a
	// message back to each client that the actionCard was removed
	gameMod
		.update(id, { actionCard: null }, sid)
		.then(() => {})
		.catch(() => {});
};

module.exports = function(server) {
	const appWSS = new WebsocketServer(server);
	const wss = appWSS.wss;

	const onConnection = (ws, req) => {
		logger.info('connection state -> ', ws.readyState);

		const sid = req.sessionID;

		const onMessage = message => {
			const data = JSON.parse(message);
			const query = {
				sessionId: sid,
			};

			// Process WebSocket message
			logger.debug('Message received: ', data);
			logger.debug(`websocket:onmessage:${data.action} -> `, query);

			// NEEDS ACCESS to 'wss' and 'ws'
			const actions = {
				ambush: () => {
					const stealCards = players => {
						let cards = [];
						let playerToUpdate = {};

						_.forEach(players, pl => {
							const card = _.sampleSize(pl.cardsInHand)[0];
							let opponent = {};

							if (!pl.isActive) {
								logger.debug('card -> ', card);

								// Only update if the player has at least 1 card
								if (card) {
									_.pull(pl.cardsInHand, card);
									cards.push(card);

									opponent = {
										cardsInHand: pl.cardsInHand,
									};

									player
										.update(pl.id, opponent, sid)
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

						return player.update(playerToUpdate.id, plData, sid);
					};

					player
						.getState({ gameId: data.gameId })
						.then(stealCards)
						.then(() => {
							resetActionCard(data.gameId, sid);
						})
						.catch(err => {
							logger.error(err);
						});
				},

				hoard: () => {
					let wsObj = {};

					delete data.player.cardsInHand;

					if (!hoardPlayer) {
						hoardPlayer = query;

						// 	FIXME: HACK!!
						setTimeout(() => {
							wsObj = {
								namespace: 'wsPlayers',
								action: `actioncard_${data.action}`,
								nuts: data.player,
							};

							wss.broadcast(wsObj, sid);
							hoardPlayer = null;

							// resetActionCard();
						}, 250);
					} else {
						wsObj = {
							namespace: 'wsPlayers',
							action: 'showMessage',
							nuts: 'NO HOARD FOR YOU!',
						};

						ws.send(JSON.stringify(wsObj));
					}
				},

				quarrel: () => {
					const wsObj = {
						action: `actioncard_${data.action}`,
						playerId: data.player || null,
						namespace: 'wsPlayers',
					};

					if (data.hasOwnProperty('card')) {
						wsObj.card = data.card;
					}

					wss.broadcast(wsObj, sid);
				},

				whirlwind: () => {
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

								_.forEach(cardIds, cardId => {
									const player = pIt.next();

									player.cardsInHand.push(cardId);
								});

								_.forEach(playersOrder, player => {
									const playerData = {
										cardsInHand: player.cardsInHand,
									};

									logger.debug('playerData -> ', playerData);

									player.update(
										player.id,
										playerData,
										sid
									);
								});

								setTimeout(() => {
									resetActionCard(data.gameId, sid);
								}, 1500);
							};

							logger.debug('players -> ', players);

							_.forEach(players, (pl, index) => {
								const plCards = pl.cardsInHand.slice(); // Copy array

								cardIds = _.union(cardIds, plCards);

								// Remove cards from player's hand
								pl.cardsInHand = [];
								updatePromises.push(
									player.update(
										pl.id,
										{ cardsInHand: [] },
										sid
									)
								);

								if (pl.isActive) {
									startPlayer = index;
								}
							});

							Q.all(updatePromises).then(() => {
								setTimeout(dealCards, 1500);
							});
						});
				},
			};

			switch (data.action) {
				case 'ambush':
				case 'communism':
				case 'hoard':
				case 'quarrel':
				case 'whirlwind':
					actions[data.action]();
					break;

				case 'getMyCards':
					playerModel
						.find(query)
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

								const wsObj = {
									namespace: 'wsPlayers',
									action: 'getMyCards',
									nuts: list[0],
								};

								ws.send(JSON.stringify(wsObj));
							}
						})
						.catch(err => {
							logger.error(err);
						});

					break;

				default:
					wss.broadcast(data);

					break;
			}
		};

		appWSS.connected(ws, sid);

		// This is the most important callback for us, we'll handle
		// all messages from users here.
		ws.on('message', onMessage);
	};

	wss.on('connection', onConnection);

	global.wss = wss;

	return wss;
};
