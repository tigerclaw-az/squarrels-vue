var config = require('../config/config'),
	logger = config.logger(),
	cards = require('express').Router();

const CardModel = require('../models/CardModel').model;

cards.get('/:id', function(req, res) {
	var ids = req.params.id.split(',');

	CardModel
		.find()
		.where('_id')
		.in(ids)
		.exec()
		.then(function(list) {
			if (list.length === 0) {
				res.status(204);
			}

			res.status(200).json(list);
		})
		.catch(function(err) {
			logger.error(err);
			res.status(500).json(config.apiError(err));
		});
});

module.exports = cards;
