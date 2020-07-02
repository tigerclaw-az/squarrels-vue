const _ = require('lodash');
const config = require('../config/config');
const logger = config.logger('routes:games');
const games = require('express').Router();

const CardModel = require('../config/models/card');
const DeckModel = require('../config/models/deck');
const GameModel = require('../config/models/game');

const game = require('./modules/game');
const playerMod = require('./modules/player');

games.delete('/:id', function(req, res) {
	const id = req.params.id,
		sessionId = req.sessionID;

	logger.debug('games:delete -> ', id);

	// prettier-ignore
	GameModel
		.findById(id)
		.exec()
		.then(doc => {
			const deckIds = doc.deckIds;
			const playerIds = doc.playerIds;

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
				.remove({ _id: doc.id })
				.then(function() {
					wss.broadcast(
						{
							namespace: 'wsGame',
							action: 'delete',
							id: doc.id,
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
	const id = req.params.id || '';
	const query = id ? { _id: id } : {};

	// prettier-ignore
	GameModel
		.find(query)
		.populate('actionCard createdBy')
		// .populate({
		// 	path: 'createdBy',
		// 	select: 'name',
		// })
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
	const data = req.body;

	if (!data.playerId) {
		return res.status(500).json({ error: 'Invalid request, missing "playerId"' });
	}

	logger.debug('create -> ', data);

	// prettier-ignore
	new GameModel({ createdBy: data.playerId })
		.save()
		.then(async doc => {
			const gameData = await GameModel.populate(doc, { path: 'createdBy' });

			wss.broadcast(
				{ namespace: 'wsGame', action: 'create', nuts: gameData },
				sessionId,
			);

			res.status(201).json(gameData);
		})
		.catch(err => {
			logger.error(err);
			res.status(500).json(config.apiError(err));
		});
});

games.post('/:id', function(req, res) {
	const gameId = req.params.id;
	const sessionId = req.sessionID;

	logger.debug('/update -> ', gameId, sessionId, req.body);

	game
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

	game.resetGame({ id: gameId, sessionId }, { isNewRound: true })
		.then(doc => {
			res.status(200).json(doc);
		})
		.catch(err => {
			logger.error(err);
			res.status(500).json(config.apiError(err));
		});
});

games.post('/:id/reset', function(req, res) {
	const gameId = req.params.id;
	const sessionId = req.sessionID;

	logger.debug('/reset', gameId, sessionId);

	game.resetGame({ id: gameId, sessionId }, { isNewRound: false })
		.then(doc => {
			logger.debug('resetGame -> ', doc);
			res.status(200).json(doc);
		})
		.catch(err => {
			logger.error(err);
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

					game
						.update(gameId, gameData, sessionId)
						.then(doc => {
							const statusCode = doc ? 200 : 204;

							logger.debug('game:update -> ', doc);

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

	logger.debug('/start', gameId, sessionId, gameData);

	game
		.update(gameId, gameData, sessionId)
		.then(doc => {
			logger.debug('game.update : ', doc);
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
