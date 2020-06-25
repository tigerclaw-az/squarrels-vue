const config = require('../config/config');
const logger = config.logger('routes:decks');

const decks = require('express').Router();

const DeckModel = require('../models/DeckModel');

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
	const deck = { _id: deckId };
	const options = { new: true, returnNewDocument: true };

	logger.debug('decks/:id', deck, req.body);

	// prettier-ignore
	DeckModel
		.findOneAndUpdate(deck, req.body, options)
		.populate('cards')
		.then(function(doc) {
			wss.broadcast(
				{ namespace: 'wsDecks', action: 'update', nuts: doc },
				sessionId
			);

			if (doc) {
				res.status(200).json(doc);
			} else {
				res.status(204).json([]);
			}
		})
		.catch(function(err) {
			logger.error(err);
			res.status(500).json(config.apiError(err));
		});
});

module.exports = decks;
