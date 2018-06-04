module.exports = function(server, sessionParser) {
	const _ = require('lodash');
	const config = require('./config/config');
	const logger = config.logger('websocket');
	const gameMod = require('./routes/modules/game');
	const playerMod = require('./routes/modules/player');
	const Q = require('q');
	const WebSocket = require('ws');
	const Player = require('./models/PlayerModel').model;

	// Create new WebSocket server instance
	const wss = new WebSocket.Server({
		verifyClient: function(info, done) {
			logger.debug('Parsing session from reequest...');
			sessionParser(info.req, {}, () => {
				done(info.req.sessionID);
			});
		},
		server,
	});

	let hoardPlayer = null,
		CLIENTS = {};

	const resetActionCard = (id, sid) => {
		// Remove the 'actionCard' from the game, which will trigger a
		// message back to each client that the actionCard was removed
		gameMod
			.update(id, { actionCard: null }, sid)
			.then(() => {})
			.catch(() => {});
	};

	wss.broadcast = (data, sid, all = true) => {
		logger.debug('broadcast() -> ', data, sid, all);

		wss.clients.forEach(client => {
			if (client.readyState === WebSocket.OPEN) {
				if (all || client !== CLIENTS[sid]) {
					client.send(JSON.stringify(data));
				}
			}
		});
	};

	wss.on('connection', (ws, req) => {
		const sid = req.sessionID;

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

		const onMessage = message => {
			let data = JSON.parse(message),
				query = {
					sessionId: sid,
				};

			// Process WebSocket message
			logger.debug('Message received: ', data);
			logger.debug(`websocket:onmessage:${data.action} -> `, query);

			const actions = {
				ambush: () => {
					const stealCards = players => {
						let cards = [],
							plData = {},
							playerToUpdate = {};

						_.forEach(players, pl => {
							let card = _.sampleSize(pl.cardsInHand)[0];

							if (!pl.isActive) {
								logger.debug('card -> ', card);

								// Only update if the player has at least 1 card
								if (card) {
									_.pull(pl.cardsInHand, card);
									cards.push(card);

									plData = {
										cardsInHand: pl.cardsInHand,
									};

									playerMod
										.update(pl.id, plData, sid)
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

						plData = {
							cardsInHand: cards,
						};

						playerMod
							.update(playerToUpdate.id, plData, sid)
							.then(() => {})
							.catch(() => {});
					};

					playerMod
						.get()
						.then(stealCards)
						.catch(err => {
							logger.error(err);
						});

					resetActionCard(data.gameId, sid);
				},

				communism: () => {
					// prettier-ignore
					playerMod
						.get()
						.then(players => {
							let wsObj = {
								action: data.action,
								type: 'game',
								nuts: players,
							};

							ws.send(JSON.stringify(wsObj));
						});
				},

				hoard: () => {
					let wsObj = {};

					delete data.playerHoard.cardsInHand;

					if (!hoardPlayer) {
						hoardPlayer = query;

						// 	FIXME: HACK!!
						setTimeout(() => {
							wsObj = {
								namespace: 'wsPlayers',
								action: `actioncard_${data.action}`,
								nuts: data.playerHoard,
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
					let wsObj = {
						action: data.action,
						id: data.player || null,
						type: 'players',
					};

					if (data.hasOwnProperty('card')) {
						wsObj.card = data.card;
					}

					wss.broadcast(wsObj, sid);
				},

				whirlwind: () => {
					playerMod.get().then(players => {
						let cardIds = [],
							startPlayer = 0,
							updatePromises = [];

						_.forEach(players, (pl, index) => {
							let plCards = pl.cardsInHand.slice(); // Copy array

							logger.debug('plCards -> ', plCards);

							cardIds = _.union(cardIds, plCards);

							// Remove cards from player's hand
							pl.cardsInHand = [];
							updatePromises.push(
								playerMod.update(
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
							let dealCards = () => {
								let playersOrder = _.union(
									players.slice(startPlayer),
									players.slice(0, startPlayer)
								);

								cardIds = _(cardIds)
									.flatten()
									.shuffle()
									.value();

								logger.debug('cards -> ', cardIds);
								logger.debug('playersOrder1 -> ', playersOrder);

								let pIt = playerIt(playersOrder);

								_.forEach(cardIds, cardId => {
									let player = pIt.next();

									logger.debug('card -> ', cardId);

									player.cardsInHand.push(cardId);
								});

								logger.debug('playersOrder2 -> ', playersOrder);

								_.forEach(playersOrder, player => {
									let playerData = {
										cardsInHand: player.cardsInHand,
									};

									logger.debug('playerData -> ', playerData);

									playerMod.update(
										player.id,
										playerData,
										sid
									);
								});

								resetActionCard(data.gameId, sid);
							};

							setTimeout(dealCards, 3000);
						});
					});
				},
			};

			switch (data.action) {
				case 'ambush':
					actions.ambush();

					break;

				case 'communism':
					actions.communism();

					break;

				case 'hoard':
					actions.hoard();

					break;

				case 'quarrel':
					actions.quarrel();

					break;

				case 'whirlwind':
					actions.whirlwind();

					break;

				case 'getMyCards':
					Player.find(query)
						.select('+sessionId +cardsInHand')
						.exec()
						.then(list => {
							const wsObj = {
								namespace: 'wsPlayers',
								action: 'getMyCards',
								nuts: list[0],
							};

							ws.send(JSON.stringify(wsObj));
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

		logger.info('Connection accepted:', sid);
		logger.info('Clients Connected: %s', wss.clients.size);

		// Save sessionID against the map of clients so we can reference later
		CLIENTS[sid] = ws;

		// ws.send(JSON.stringify({ action: 'connect', type: 'global' }));

		// This is the most important callback for us, we'll handle
		// all messages from users here.
		ws.on('message', onMessage);

		ws.on('error', err => {
			logger.error(err);
		});

		ws.on('close', connection => {
			// close user connection
			logger.warn('Connection Closed:', connection);
			hoardPlayer = null;
		});
	});

	global.wss = wss;

	return wss;
};
