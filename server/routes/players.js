const express = require('express');
const config = require('../config/config');
const logger = config.logger('routes:players');
const validator = require('validator');
const players = express.Router();

const player = require('./modules/player');
const PlayerModel = require('../config/models/player');
const { isObject, isEmpty } = require('lodash');

const validatePlayer = pl => {
	if (pl.name) {
		pl.name = validator.stripLow(validator.escape(pl.name));

		if (pl.name.length > 24) {
			const err = `The name you provided (${
				pl.name
			}) is longer than 24 chars!`;

			return err;
		}
	}

	return pl;
};

players.delete('/:id?', function(req, res) {
	if (req.params.id) {
		// FIXME: Add 'remove' method to modules/player
		// Remove single player
		PlayerModel.findByIdAndRemove(req.params.id)
			.then(function() {
				res.sendStatus(200);
			})
			.catch(function(err) {
				logger.error(err);
				res.status(500).json(config.apiError(err));
			});
	} else {
		// Remove ALL players
		PlayerModel.remove()
			.then(function() {
				res.status(200).json();
			})
			.catch(function(err) {
				logger.error(err);
				res.status(500).json(config.apiError(err));
			});
	}
});

players.get('/:id?', function(req, res) {
	const sessionId = req.sessionID;
	const ids = req.params.id ? req.params.id.split(',') : [];
	let playerQuery = PlayerModel.find();

	logger.debug('sessionId -> ', sessionId);
	logger.debug('ids -> ', ids);

	if (ids.length) {
		playerQuery = playerQuery.where('_id').in(ids);
	} else {
		logger.error('No playerIds provided to API!');
		res.status(500).json(config.apiError(''));

		return [];
	}

	playerQuery
		.exec()
		.then(list => {
			logger.debug('player -> ', list);

			if (list.length === 0) {
				res.status(204);
			}

			res.status(200).json(list);

			/* ****IN CASE WE DO THIS LATER****
			const playerId = list[0].id;
			const localPlayer = PlayerModel
									.find({ _id: playerId, sessionId })
									.select('+sessionId +cardsInHand');

			localPlayer
				.exec()
				.then(player => {
					logger.debug('localPlayer -> ', player);
					res.json(player);
				})
				.catch(err => {
					logger.error('localPlayer -> ', err);
					res.status(500).json(config.apiError(err));
				})
			*********/
		})
		.catch(function(err) {
			if (err) {
				logger.error(err);
				res.status(500).json(config.apiError(err));
			}
		});
});

players.post('/:id?', function(req, res) {
	const sessionId = req.sessionID;
	const playerId = req.params.id;

	if (!sessionId) {
		logger.error('!!Possible Attack!!', req);
		res
			.status(500)
			.json(config.apiError('ALERT: Missing required sessionId!!'));

		return false;
	}

	if (playerId) {
		const plData = validatePlayer(req.body);

		if (!isObject(plData) || isEmpty(plData)) {
			res.status(500).json(config.apiError('Invalid data sent for update!'));

			return false;
		}

		player
			.update(playerId, plData, sessionId)
			.then(doc => {
				const statusCode = doc ? 200 : 204;
				const data = doc ? doc : [];

				logger.debug('players/update', data);

				res.status(statusCode).json(data);
			})
			.catch(err => {
				logger.error(err);
				res.status(500).json(config.apiError(err));
			});
	} else {
		// Add new player, if the player with current session doesn't already exist
		// prettier-ignore
		PlayerModel
			.findOne({ sessionId })
			.exec()
			.then(list => {
				logger.info(list);

				if (list) {
					logger.error();
					res.status(200).json(list);

					return true;
				}

				const addPlayer = () => {
					const playerDefaults = {
						sessionId,
						name: config.getRandomStr(8),
						img: config.playerImage,
					};
					let pData = Object.assign({}, playerDefaults, req.body);

					pData = validatePlayer(pData);

					if (!pData) {
						return Promise.reject('PlayerModel data could not be validated!');
					}

					return new PlayerModel(pData)
						.save()
						.then(doc => {
							logger.debug('PlayerModel.save()', doc);

							wss.broadcast(
								{ namespace: 'wsPlayers', action: 'create', nuts: doc },
								req.session.id,
								false
							);

							return Promise.resolve(doc);
						})
						.catch(err => {
							return Promise.reject(err);
						});
				};

				addPlayer()
					.then(player => {
						res.status(201).json(player);
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
	}
});

module.exports = players;
