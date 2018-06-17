var config = require('../config/config'),
	logger = config.logger('routes:decks'),
	decks = require('express').Router();

const DeckModel = require('../models/DeckModel').model;

decks.get('/:id', function(req, res) {
	const ids = req.params.id.split(',');
	let deckQuery = DeckModel.find()
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
	const options = { returnNewDocument: true };

	// prettier-ignore
	DeckModel
		.findOneAndUpdate(deck, req.body, options)
		.populate('cards')
		.then(function(doc) {
			if (doc) {
				res.status(200).json(doc);

				/* eslint-disable no-undef */
				wss.broadcast(
					{ namespace: 'wsDecks', action: 'update', nuts: doc },
					sessionId
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
