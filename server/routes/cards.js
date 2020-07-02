const config = require('../config/config');
const logger = config.logger('routes:cards');

const cards = require('express').Router();

const CardModel = require('../config/models/card');

cards.get('/:id', function(req, res) {
	const ids = req.params.id.split(',');
	const promises = [];

	for (const id of ids) {
		promises.push(new Promise(resolve => {
			CardModel
				.findById(id)
				.exec()
				.then(card => resolve(card));
		}));
	}

	Promise.all(promises)
		.then(function(list) {
			logger.debug('cardDetails -> ', list);

			if (list.length === 0) {
				res.status(204);
			}

			res.status(200).json(list.reverse());
		})
		.catch(function(err) {
			logger.error(err);
			res.status(500).json(config.apiError(err));
		});
});

module.exports = cards;
