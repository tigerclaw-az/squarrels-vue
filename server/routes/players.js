var express = require('express'),
	config = require('../config/config'),
	logger = config.logger(),
	validator = require('validator'),
	players = express.Router(),
	playerMod = require('./modules/player');

const Player = require('../models/PlayerModel').model;

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
	var query = {};

	Player
		.find(query)
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

players.post('/:id?', function(req, res) {
	var playerId = req.params.id,
		validatePlayer = (pl) => {
			if (pl.name) {
				pl.name = validator.stripLow(validator.escape(pl.name));

				if (pl.name.length > 24) {
					let err = `The name you provided (${pl.name}) is longer than 24 chars!`;

					return err;
				}
			}

			return pl;
		},
		addPlayer = () => {
			let playerDefaults = {
					sessionId: req.session.id,
					name: config.getRandomStr(8),
					img: config.playerImage
				},
				pData = Object.assign({}, playerDefaults, req.body);

			pData = validatePlayer(pData);

			if (!pData) {
				return false;
			}

			let pl = new Player(pData);

			pl.save()
				.then(() => {
					logger.debug('Player.save()', pl);

					/* eslint-disable no-undef */
					wss.broadcast(
						{ type: 'players', action: 'create', nuts: pl },
						req.session.id,
						false
					);
					/* eslint-enable no-undef */

					res.status(201).json(pl);
				})
				.catch(err => {
					logger.error(err);
					res.status(500).json(config.apiError(err));
				});
		};

	if (!req.session.id) {
		logger.error('!!Possible Attack!!', req);
		res.status(500).json(config.apiError('ALERT: Missing required sessionId!!'));

		return false;
	}

	if (playerId) {
		let plData = validatePlayer(req.body);

		if (typeof plData !== 'object') {
			res.status(500).json(config.apiError(plData));

			return false;
		}

		playerMod
			.update(playerId, plData, req.session.id)
			.then(doc => {
				let statusCode = doc ? 200 : 204,
					data = doc ? doc : [];

				res.status(statusCode).json(data);
			})
			.catch(err => {
				logger.error(err);
				res.status(500).json(config.apiError(err));
			});
	} else {
		// Add new player, if the maximum players hasn't been reached
		Player
			.find({}).exec()
			.then(list => {
				let totalPlayers = list.length;

				if (totalPlayers === 6) {
					logger.error('TOO MANY PLAYERS!');
					res.status(500).json(config.apiError());

					return false;
				}

				addPlayer();
			})
			.catch(err => {
				logger.error(err);
				res.status(500).json(config.apiError(err));
			});
	}
});

module.exports = players;
