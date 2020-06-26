const _ = require('lodash');
const config = require('../config/config');
const logger = config.logger('routes:games');
const games = require('express').Router();
const gameMod = require('./modules/game');
const playerMod = require('./modules/player');

const CardModel = require('../models/CardModel');
const DeckModel = require('../models/DeckModel');
const GameModel = require('../models/GameModel');

const resetGame = async function(gameData, options) {
	logger.debug('resetGame:gameData -> ', gameData);
	logger.debug('resetGame:option -> ', options);

	const init = {
		actionCard: null,
		isDealing: false,
		isLoaded: false,
		isStarted: false,
		roundNumber: 1,
		$set: { deckIds: [] },
	};

	const gameId = gameData.id;
	const sessionId = gameData.sessionId;

	try {
		const game = await GameModel.findById(gameId).exec();

		logger.debug('game -> ', game);

		const deckIds = game.deckIds;
		const playerIds = game.playerIds;

		logger.debug('decks -> ', deckIds);
		logger.debug('players -> ', playerIds);

		await DeckModel.deleteMany({ _id: { $in: deckIds } });

		_.forEach(playerIds, id => {
			// prettier-ignore
			playerMod[options.isNewRound ? 'newRound' : 'reset'](id, sessionId)
				.then(doc => {
					logger.debug('player reset -> ', doc);
					wss.broadcast(
						{
							namespace: 'wsPlayers',
							action: 'update',
							nuts: doc,
						},
						sessionId
					);
				})
				.catch(err => {
					logger.error(err);
				});
		});

		return new Promise((resolve, reject) => {
			// Set roundNumber to correct value
			if (options.isNewRound) {
				init.roundNumber = game.roundNumber + 1;
			}

			logger.debug('game init -> ', init);

			return gameMod.update(gameId, init, sessionId)
				.then(doc => {
					logger.debug('game reset -> ', doc);

					wss.broadcast(
						{ namespace: 'wsGame', action: 'update', nuts: doc },
						sessionId
					);

					resolve(doc);
				})
				.catch(err => {
					logger.error(err);
					reject(err);
				});
		});
	} catch (err) {
		Promise.reject(err);
	}
};

games.delete('/:id', function(req, res) {
	const id = req.params.id,
		sessionId = req.sessionID;

	logger.debug('games:delete -> ', id);

	// prettier-ignore
	GameModel
		.findById(id)
		.exec()
		.then(game => {
			const deckIds = game.deckIds;
			const playerIds = game.playerIds;

			logger.debug('decks -> ', deckIds);
			logger.debug('players -> ', playerIds);

			_.forEach(playerIds, id => {
				playerMod.reset(id).then(doc => {
					wss.broadcast(
						{
							namespace: 'wsPlayers',
							action: 'update',
							nuts: doc,
						},
						sessionId
					);
				});
			});

			// prettier-ignore
			GameModel
				.remove({ _id: game.id })
				.then(function() {
					wss.broadcast(
						{
							namespace: 'wsGame',
							action: 'delete',
							id: game.id,
						},
						sessionId
					);

					res.sendStatus(200);
				})
				.catch(function(err) {
					logger.error(err);
					res.status(500).json(config.apiError(err));
				});

			// prettier-ignore
			DeckModel
				.deleteMany({ _id: { $in: deckIds } })
				.catch(err => {
					logger.error(err);
					res.status(500).json(config.apiError(err));
				});
		});
});

games.get('/:id?', function(req, res) {
	const id = req.params.id || '',
		query = id ? { _id: id } : {};

	// prettier-ignore
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
	const sessionId = req.sessionID;

	const game = new GameModel();

	logger.debug('create -> ', req.body);

	// prettier-ignore
	GameModel
		.create(game)
		.then(gameDoc => {
			wss.broadcast(
				{ namespace: 'wsGame', action: 'create', nuts: gameDoc },
				sessionId,
			);

			res.status(201).json(game);
		})
		.catch(err => {
			logger.error(err);
			res.status(500).json(config.apiError(err));
		});
});

games.post('/:id', function(req, res) {
	const gameId = req.params.id,
		sessionId = req.sessionID;

	logger.debug('update -> ', req.body);

	gameMod
		.update(gameId, req.body, sessionId)
		.then(doc => {
			const statusCode = doc ? 200 : 204;

			res.status(statusCode).json(doc);
		})
		.catch(err => {
			res.status(500).json(config.apiError(err));
		});
});

games.post('/:id/next-round', function(req, res) {
	const gameId = req.params.id;
	const sessionId = req.sessionID;

	resetGame({ id: gameId, sessionId }, { isNewRound: true })
		.then(doc => {
			res.status(200).json(doc);
		})
		.catch(err => {
			res.status(500).json(config.apiError(err));
		});
});

games.post('/:id/reset', function(req, res) {
	const gameId = req.params.id;
	const sessionId = req.sessionID;

	resetGame({ id: gameId, sessionId }, { isNewRound: false })
		.then(doc => {
			res.status(200).json(doc);
		})
		.catch(err => {
			res.status(500).json(config.apiError(err));
		});
});

games.get('/:id/shuffle-decks', function(req, res) {
	const gameId = req.params.id;
	const sessionId = req.sessionID;

	// prettier-ignore
	CardModel
		.find({})
		.exec()
		.then(cards => {
			const deckPromises = [];

			const decks = [
				new DeckModel({
					deckType: 'discard',
				}),
				new DeckModel({
					deckType: 'main',
					cards: _.shuffle(_.shuffle(cards)),
				}),
				new DeckModel({
					deckType: 'hoard',
				}),
			];

			decks.forEach(deck => {
				// Create all decks, and store promises to be used later
				deckPromises.push(DeckModel.create(deck));
			});

			// prettier-ignore
			Promise.all(deckPromises)
				.then(decksCreated => {
					const gameData = {
						deckIds: _.map(decksCreated, deck => deck.id),
					};

					logger.debug('gameData -> ', gameData);

					gameMod
						.update(gameId, gameData, sessionId)
						.then(doc => {
							const statusCode = doc ? 200 : 204;

							logger.debug('gameMod:update -> ', doc);

							wss.broadcast(
								{
									namespace: 'wsGame',
									action: 'update',
									nuts: doc,
								},
								sessionId,
							);

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
});

games.get('/:id/start', function(req, res) {
	const gameId = req.params.id;
	const sessionId = req.sessionID;
	const gameData = { isStarted: true };

	gameMod
		.update(gameId, gameData, sessionId)
		.then(doc => {
			const statusCode = doc ? 200 : 204;

			wss.broadcast(
				{
					namespace: 'wsGame',
					action: 'update',
					nuts: doc,
				},
				sessionId
			);

			res.status(statusCode).json(doc);
		})
		.catch(err => {
			res.status(500).json(config.apiError(err));
		});
});

module.exports = games;
