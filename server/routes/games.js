var _ = require('lodash'),
	config = require('../config/config'),
	logger = config.logger('routes:games'),
	games = require('express').Router(),
	gameMod = require('./modules/game');

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

			/* eslint-disable no-undef */
			wss.broadcast(
				{ action: 'remove', type: 'games' },
				sessionId
			);
			/* eslint-enable no-undef */

			DeckModel
				.deleteMany({ '_id': { $in: decks } })
				.then(() => {
					/* eslint-disable no-undef */
					wss.broadcast(
						{ action: 'remove', type: 'decks' },
						sessionId
					);
					/* eslint-enable no-undef */

					logger.debug('players -> ', players);

					PlayerModel
						.updateMany({ '_id': { $in: players } }, playerUpdate)
						.then(() => {
							/* eslint-disable no-undef */
							wss.broadcast(
								{ action: 'update', type: 'players', nuts: playerUpdate },
								sessionId
							);
							/* eslint-enable no-undef */

							GameModel
								.remove({ _id: game.id })
								.then(function() {
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
	var query = {};

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
	let sessionId = req.session.id;

	const CardModel = require('../models/CardModel').model;
	const DeckModel = require('../models/DeckModel').model;

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

					let game = new GameModel({
						isGameStarted: true,
						players: req.body,
						decks: _.map(decksCreated, (deck => {
							return deck.id
						}))
					});

					GameModel
						.create(game)
						.then(() => {
							/* eslint-disable no-undef */
							wss.broadcast(
								{ type: 'games', action: 'create', nuts: game },
								sessionId,
								false
							);

							decks.forEach(deck => {
								wss.broadcast(
									{ type: 'decks', action: 'create', nuts: deck },
									sessionId,
									false
								);
							})
							/* eslint-enable no-undef */

							res.status(201).json(game);
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
		})
		.catch(err => {
			logger.error(err);
			res.status(500).json(config.apiError(err));
		});
});

games.post('/:id', function(req, res) {
	let gameId = req.params.id,
		sessionId = req.session.id;

	logger.debug('post -> ', req.body);

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

module.exports = games;
