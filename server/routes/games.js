const _ = require('lodash');
const config = require('../config/config');
const logger = config.logger('routes:games');
const games = require('express').Router();
const gameMod = require('./modules/game');

const DeckModel = require('../models/DeckModel').model;
const GameModel = require('../models/GameModel').model;
const PlayerModel = require('../models/PlayerModel').model;

games.delete('/:id', function(req, res) {
	let id = req.params.id,
		sessionId = req.session.id;

	logger.debug('games:delete -> ', id);

	GameModel
		.findById(id)
		.exec()
		.then(game => {
			let decks = game.decks,
				players = game.players,
				playerUpdate = {
					cardsInHand: [],
					cardsInStorage: [],
					isFirstTurn: true,
					isActive: false,
					score: 0,
					totalCards: 0
				};

			logger.debug('decks -> ', decks);

			DeckModel
				.deleteMany({ '_id': { $in: decks } })
				.then(() => {
					/* eslint-disable no-undef */
					// NOTE: No need to know when decks are removed
					// wss.broadcast(
					// 	{ namespace: 'wsDecks', action: 'remove' },
					// 	sessionId
					// );
					/* eslint-enable no-undef */

					logger.debug('players -> ', players);

					PlayerModel
						.updateMany({ '_id': { $in: players } }, playerUpdate)
						.then(() => {
							/* eslint-disable no-undef */
							wss.broadcast(
								{ namespace: 'wsPlayers', action: 'update', nuts: playerUpdate },
								sessionId
							);
							/* eslint-enable no-undef */

							GameModel
								.remove({ _id: game.id })
								.then(function() {
									/* eslint-disable no-undef */
									wss.broadcast(
										{ namespace: 'wsGame', action: 'delete', id: game.id },
										sessionId
									);
									/* eslint-enable no-undef */

									res.sendStatus(200);
								})
								.catch(function(err) {
									logger.error(err);
									res.status(500).json(config.apiError(err));
								})
						});
				})
				.catch(err => {
					logger.error(err);
					res.status(500).json(config.apiError(err));
				});
		});
});

games.get('/:id?', function(req, res) {
	let id = req.params.id || '',
		query = id ? { _id: id } : {};

	GameModel
		.find(query)
		.populate('actionCard')
		.exec()
		.then(function(list) {
			if (list.length === 0) {
				res.status(204);
			}

			res.json(list);
		})
		.catch(function(err) {
			if (err) {
				logger.error(err);
				res.status(500).json(config.apiError(err));

				return [];
			}
		});
});

games.post('/', function(req, res) {
	const sessionId = req.session.id;
	const CardModel = require('../models/CardModel').model;
	const DeckModel = require('../models/DeckModel').model;

	let game = new GameModel();

	logger.debug('create -> ', req.body);

	GameModel
		.create(game)
		.then(newGame => {
			/* eslint-disable no-undef */
			wss.broadcast(
				{ namespace: 'wsGame', action: 'create', nuts: game },
				sessionId,
				true
			);
			/* eslint-enable no-undef */

			CardModel
				.find({})
				.exec()
				.then(cards => {
					let mainDeck = new DeckModel({
							deckType: 'main',
							cards: _.shuffle(_.shuffle(cards))
						}),
						hoardDeck = new DeckModel({
							deckType: 'discard'
						}),
						actionDeck = new DeckModel({
							deckType: 'action'
						}),
						decks = [mainDeck, hoardDeck, actionDeck],
						deckPromises = [];

					decks.forEach(deck => {
						// Create all decks, and store promises to be used later
						deckPromises.push(DeckModel.create(deck));
						return true;
					});

					Promise
						.all(deckPromises)
						.then(decksCreated => {
							logger.debug('decksCreated -> ', decksCreated);

							const gameData = {
								decks: _.map(decksCreated, (deck => {
									return deck.id
								}))
							};

							gameMod
								.update(newGame.id, gameData, sessionId)
								.then(doc => {
									let statusCode = doc ? 200 : 204;

									/* eslint-disable no-undef */
									wss.broadcast(
										{ namespace: 'wsGame', action: 'update', nuts: doc },
										sessionId,
										true
									);
									/* eslint-enable no-undef */

									res.status(statusCode).json(doc);
								})
								.catch(err => {
									res.status(500).json(config.apiError(err));
								});
						})
						.catch(err => {
							logger.error(err);
							res.status(500).json(config.apiError(err));
						});
				})
				.catch(err => {
					logger.error(err);
					res.status(500).json(config.apiError(err));
				});

			res.status(201).json(game);
		})
		.catch(err => {
			logger.error(err);
			res.status(500).json(config.apiError(err));
		});
});

games.post('/:id', function(req, res) {
	let gameId = req.params.id,
		sessionId = req.session.id;

	logger.debug('update -> ', req.body);

	gameMod
		.update(gameId, req.body, sessionId)
		.then(doc => {
			let statusCode = doc ? 200 : 204;

			res.status(statusCode).json(doc);
		})
		.catch(err => {
			res.status(500).json(config.apiError(err));
		});
});

games.post('/:id/start', function(req, res) {
	const gameId = req.params.id;
	const sessionId = req.session.id;

	logger.debug('start -> ', req.body);

	gameMod
		.update(gameId, { isStarted: true }, sessionId)
		.then(game => {
			let statusCode = game ? 200 : 204;

			/* eslint-disable no-undef */
			wss.broadcast(
				{ namespace: 'wsGame', action: 'update', nuts: game },
				sessionId,
				true
			);
			/* eslint-enable no-undef */

			res.status(statusCode).json(game);
		})
		.catch(err => {
			res.status(500).json(config.apiError(err));
		});
});

module.exports = games;
