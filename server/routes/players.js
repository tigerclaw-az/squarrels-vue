const express = require('express');
const config = require('../config/config');
const logger = config.logger('routes:players');
const validator = require('validator');
const players = express.Router();
const playerMod = require('./modules/player');

const Player = require('../models/PlayerModel');

players.delete('/:id?', function(req, res) {
	if (req.params.id) {
		// Remove single player
		Player.findByIdAndRemove(req.params.id)
			.then(function() {
				res.sendStatus(200);
			})
			.catch(function(err) {
				logger.error(err);
				res.status(500).json(config.apiError(err));
			});
	} else {
		// Remove ALL players
		Player.remove()
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
	const ids = req.params.id.split(',');
	let playerQuery = Player.find();

	logger.debug('sessionId -> ', sessionId);
	logger.debug('ids -> ', ids);

	if (ids.length) {
		playerQuery = playerQuery.where('_id').in(ids);
	}

	playerQuery
		.exec()
		.then(list => {
			logger.debug('player -> ', list);

			if (list.length === 0) {
				res.status(204);
			}

			res.json(list);

			/* ****IN CASE WE DO THIS LATER****
			const playerId = list[0].id;
			const localPlayer = Player
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

				return [];
			}
		});
});

players.post('/:id?', function(req, res) {
	const sessionId = req.sessionID;
	const playerId = req.params.id;

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

	if (!sessionId) {
		logger.error('!!Possible Attack!!', req);
		res
			.status(500)
			.json(config.apiError('ALERT: Missing required sessionId!!'));

		return false;
	}

	if (playerId) {
		const plData = validatePlayer(req.body);

		if (typeof plData !== 'object') {
			res.status(500).json(config.apiError(plData));

			return false;
		}

		playerMod
			.update(playerId, plData, sessionId)
			.then(doc => {
				const statusCode = doc ? 200 : 204,
					data = doc ? doc : [];

				res.status(statusCode).json(data);
			})
			.catch(err => {
				logger.error(err);
				res.status(500).json(config.apiError(err));
			});
	} else {
		// Add new player, if the player with current session doesn't already exist
		// prettier-ignore
		Player
			.findOne({ sessionId })
			.exec()
			.then(list => {
				logger.info(list);

				if (list) {
					// let err = `Player found with same sessionId: ${sessionId}`;
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
						return Promise.reject('Player data could not be validated!');
					}

					const playerModel = new Player(pData);

					return playerModel
						.save()
						.then(() => {
							logger.debug('Player.save()', playerModel);

							/* eslint-disable no-undef */
							wss.broadcast(
								{ namespace: 'wsPlayers', action: 'create', nuts: playerModel },
								req.session.id,
								false
							);
							/* eslint-enable no-undef */

							return Promise.resolve(playerModel);
						})
						.catch(err => {
							Promise.reject(err);
						});
				};

				addPlayer()
					.then(player => {
						res.status(201).json(player);
					})
					.catch(err => {
						logger.error(err);
						res.status(500).json(config.apiError(err));
					})
			})
			.catch(err => {
				logger.error(err);
				res.status(500).json(config.apiError(err));
			});
	}
});

module.exports = players;
