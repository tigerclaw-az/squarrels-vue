var config = require('../config/config'),
	logger = config.logger(),
	decks = require('express').Router();

const DeckModel = require('../models/DeckModel').model;

decks.get('/:id?', function(req, res) {
	var query = {},
		deckId = req.params.id;

	if (deckId) {
		query = { _id: deckId };
	}

	DeckModel
		.find(query)
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
	var deckId = req.params.id,
		deck = { _id: deckId },
		options = { new: true };

	DeckModel
		.findOneAndUpdate(deck, req.body, options)
		.populate('cards')
		.then(function(doc) {
			if (doc) {
				res.status(200).json(doc);

				/* eslint-disable no-undef */
				wss.broadcast(
					{ type: 'decks', action: 'update', nuts: doc },
					req.session.id
				);
				/* eslint-enable no-undef */
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
