const _ = require('lodash');
const config = require('../config/config');
const logger = config.logger('routes:games');
const games = require('express').Router();

const GameModel = require('../config/models/game');

const game = require('./modules/game');

games.delete('/:id', function(req, res) {
	const id = req.params.id;
	const sessionId = req.sessionID;

	logger.debug('games:delete -> ', id);

	game.delete(id, sessionId)
		.then(() => {
			res.sendStatus(200);
		})
		.catch(function(err) {
			logger.error(err);
			res.status(500).json(config.apiError(err));
		});
});

games.get('/:id?', function(req, res) {
	const id = req.params.id || '';
	const query = id ? { _id: id } : {};

	GameModel
		.find(query)
		.populate('actionCard createdBy')
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

games.get('/:id/start', function(req, res) {
	const gameId = req.params.id;
	const sessionId = req.sessionID;
	const gameData = { status: 'STARTED' };

	logger.debug('/start', gameId, sessionId, gameData);

	game
		.update(gameId, gameData, sessionId)
		.then(doc => {
			logger.debug(doc);
			res.status(doc ? 200 : 204).json(doc);
		})
		.catch(err => {
			res.status(500).json(config.apiError(err));
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
			res.status(doc ? 200 : 204).json(doc);
		})
		.catch(err => {
			res.status(500).json(config.apiError(err));
		});
});

games.post('/:id/next-round', function(req, res) {
	const gameId = req.params.id;
	const sessionId = req.sessionID;

	game.reset({ id: gameId, sessionId }, { isNewRound: true })
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

	game.reset({ id: gameId, sessionId }, { isNewRound: false })
		.then(doc => {
			logger.debug('reset -> ', doc);
			res.status(200).json(doc);
		})
		.catch(err => {
			logger.error(err);
			res.status(500).json(config.apiError(err));
		});
});

games.post('/:id/decks', function(req, res) {
	const gameId = req.params.id;
	const sessionId = req.sessionID;

	game.createDecks(gameId, sessionId)
		.then(doc => {
			res.status(doc ? 200 : 204).json(doc);
		})
		.catch(err => {
			res.status(500).json(config.apiError(err));
		});
});

module.exports = games;
