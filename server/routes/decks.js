const config = require('../config/config');
const logger = config.logger('routes:decks');

const decks = require('express').Router();

const DeckModel = require('../config/models/deck');
const deck = require('./modules/deck');

// TODO: Remove API, cards in deck will only be manipulated through websocket
decks.get('/:id', function(req, res) {
	const ids = req.params.id.split(',');
	const deckQuery = DeckModel.find()
		.where('_id')
		.in(ids);

	deckQuery
		// .find(query)
		.populate('cards')
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
			}
		});
});

decks.post('/:id', function(req, res) {
	const sessionId = req.sessionID;

	const deckId = req.params.id;

	logger.debug('decks/:id', deckId, req.body);

	deck.update(deckId, req.body, sessionId)
		.then(doc => {
			logger.debug(doc);

			if (doc) {
				res.status(200).json(doc);
			} else {
				res.status(204).json([]);
			}
		})
		.catch(err => {
			logger.error(err);
			res.status(500).json(config.apiError(err));
		});
});

module.exports = decks;
