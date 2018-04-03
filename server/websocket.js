module.exports = function(server) {
	var	_ = require('lodash'),
		cookie = require('cookie'),
		cookieParser = require('cookie-parser'),
		config = require('./config/config'),
		logger = config.logger('websocket'),
		gameMod = require('./routes/modules/game'),
		playerMod = require('./routes/modules/player'),
		Q = require('q'),
		WebSocket = require('ws');

	const Player = require('./models/PlayerModel').model;

	let wss = new WebSocket.Server({
			verifyClient: function(info, done) {
				// logger.log('verifyClient() -> ', info.req.session, info.req.headers);

				if (info.req.headers.cookie || info.req.session) {
					done(info.req);
				}
			},
			server
		}),
		hoardPlayer = null,
		CLIENTS = {};

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

	wss.on('connection', function connection(ws, req) {
		let parseCookie = cookie.parse(req.headers.cookie)['connect.sid'],
			sid = cookieParser.signedCookie(parseCookie, '$eCuRiTy'),
			playerIt = (pl) => {
				let index = 0;

				return {
					next: () => {
						if (index >= pl.length) {
							index = 0;
						}

						return pl[index++];
					}
				};
			},
			resetActionCard = (id) => {
				// Remove the 'actionCard' from the game, which will trigger a
				// message back to each client that the actionCard was removed
				gameMod
					.update(id, { actionCard: null }, sid)
					.then(() => {})
					.catch(() => {});
			};

		logger.info('Connection accepted:', sid);
		logger.info('Clients Connected: %s', wss.clients.size);

		// Save sessionID against the map of clients so we can reference later
		CLIENTS[sid] = ws;

		ws.send(JSON.stringify({ action: 'connect', type: 'global' }));

		// This is the most important callback for us, we'll handle
		// all messages from users here.
		ws.on('message', (message) => {
			var data = JSON.parse(message),
				query = {
					sessionId: sid
				},
				wsData = data;

			// Process WebSocket message
			logger.debug('Message received: ', data);
			logger.debug(`websocket:onmessage:${data.action} -> `, query);

			switch (data.action) {
				case 'ambush':
					playerMod
						.get()
						.then(players => {
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
											cardsInHand: pl.cardsInHand
										};

										playerMod
											.update(pl.id, plData, sid)
											.then(() => {})
											.catch(() => {});
									}
								} else {
									cards = _.union(cards, pl.cardsInHand);
									playerToUpdate = pl;
									logger.debug('playerToUpdate -> ', playerToUpdate);
								}
							});

							plData = {
								cardsInHand: cards
							};

							playerMod
								.update(playerToUpdate.id, plData, sid)
								.then(() => {})
								.catch(() => {});
						})
						.catch(err => {
							logger.error(err);
						});

					resetActionCard(data.gameId);

					break;

				case 'communism':
					playerMod
						.get()
						.then(players => {
							let wsData = {
								action: data.action,
								type: 'game',
								nuts: players
							};

							ws.send(JSON.stringify(wsData));
						});

					break;

				case 'hoard':
					delete data.playerHoard.cardsInHand;

					wsData = {
						action: data.action,
						type: 'player' + (!hoardPlayer ? 's' : ''),
						nuts: data.playerHoard
					};

					if (!hoardPlayer) {
						hoardPlayer = query;

						// 	FIXME: HACK!!
						setTimeout(() => {
							wss.broadcast(wsData, sid);
							hoardPlayer = null;
						}, 250);
					} else {
						ws.send(JSON.stringify(wsData));
					}

					break;

				case 'quarrel':
					wsData = {
						action: data.action,
						id: data.player || null,
						type: 'players'
					};

					if (data.hasOwnProperty('card')) {
						wsData.card = data.card;
					}

					wss.broadcast(wsData, sid);

					break;

				case 'whirlwind':
					playerMod
						.get()
						.then(players => {
							let cards = [],
								startPlayer = 0,
								playersOrder,
								updatePromises = [],
								dealCards = () => {
									playersOrder = _.union(
										players.slice(startPlayer),
										players.slice(0, startPlayer)
									);

									cards = _(cards).flatten().shuffle().value();

									logger.debug('cards -> ', cards);
									logger.debug('playersOrder1 -> ', playersOrder);

									let pIt = playerIt(playersOrder);

									_.forEach(cards, card => {
										let player = pIt.next();

										logger.debug('card -> ', card);

										player.cardsInHand.push(card);
									});

									logger.debug('playersOrder2 -> ', playersOrder);

									_.forEach(playersOrder, player => {
										let playerData = {
											cardsInHand: player.cardsInHand
										};

										logger.debug('playerData -> ', playerData);

										playerMod.update(
											player.id,
											playerData,
											sid
										);
									});

									resetActionCard(data.gameId);
								};

							_.forEach(players, (pl, index) => {
								let plCards = pl.cardsInHand.slice(); // Copy array

								logger.debug('plCards -> ', plCards);

								cards = _.union(cards, plCards);

								// Remove cards from player's hand
								pl.cardsInHand = [];
								updatePromises.push(
									playerMod.update(pl.id, { cardsInHand: [] }, sid)
								);

								if (pl.isActive) {
									startPlayer = index;
								}
							});

							Q.all(updatePromises)
								.then(() => {
									setTimeout(dealCards, 3000);
								});
						});

					break;

				case 'whoami':
					Player
						.find(query)
						.select('+sessionId +cardsInHand')
						.exec()
						.then(list => {
							wsData = {
								action: 'whoami',
								nuts: list,
								type: 'players'
							};

							ws.send(JSON.stringify(wsData));
						})
						.catch(err => {
							logger.error(err);
						});

					break;

				default:
					wss.broadcast(wsData);
					break;
			}
		});

		ws.on('error', (err) => {
			logger.error(err);
		});

		ws.on('close', (connection) => {
			// close user connection
			logger.warn('Connection Closed:', connection);
			hoardPlayer = null;
		});
	});

	global.wss = wss;

	return wss;
};
