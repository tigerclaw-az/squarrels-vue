const config = require('../config/config');
const logger = config.logger('routes:decks');

const decks = require('express').Router();

const deck = require('./modules/deck');

// TODO: Remove API, cards in deck will only be manipulated through websocket
decks.get('/:id', function(req, res) {
	const ids = req.params.id.split(',');

	deck.getDecksWithCards(ids)
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
			}
		});
});

decks.post('/:id/draw', function(req, res) {
	const sessionId = req.sessionID;

	const deckId = req.params.id;
	const options = req.body;

	logger.debug('decks/:id/draw', deckId, options);

	deck.drawCard({ deckId, sessionId, ...options })
		.then(card => {
			res.status(200).json({ card });
		})
		.catch(err => {
			logger.error(err);
			res.status(500).json(config.apiError(err));
		});
});

module.exports = decks;
