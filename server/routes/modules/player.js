var _ = require('lodash'),
	config = require('../../config/config'),
	logger = config.logger('routes:modules:player'),
	Q = require('q'),
	Player = require('../../models/PlayerModel.js').model;

let playerMod = {
	get: (data = {}) => {
		return Player
			.find(data)
			.select('+cardsInHand')
			.exec();
	},
	update: (id, data, sid) => {
		let playerId = { _id: id },
			options = { new: true },
			cardsDefer = Q.defer(),
			defer = Q.defer();

		if (data.cardsInHand) {
			if (data.addCards) {
				// Get existing cards from player and merge them with the given cards
				playerMod
					.get(playerId)
					.then(pl => {
						logger.debug('pl -> ', pl);
						cardsDefer.resolve(_.union(data.cardsInHand, pl[0].cardsInHand));
					});
			} else {
				cardsDefer.resolve(data.cardsInHand);
			}
		} else {
			cardsDefer.resolve(null);
		}

		cardsDefer.promise.then(cards => {
			logger.debug('cards -> ', cards);

			if (cards) {
				data.cardsInHand = cards;
				data.totalCards = cards.length;

				// Make sure the player can't draw more than 7 cards
				if (data.totalCards >= 7) {
					data.isFirstTurn = false;
				}
			}

			Player
				.findOneAndUpdate(playerId, data, options)
				.then(doc => {
					let wsData = {
						action: 'update',
						nuts: doc,
						type: 'players'
					};

					/* eslint-disable no-undef */
					wss.broadcast(wsData, sid);
					/* eslint-enable no-undef */

					defer.resolve(doc);
				})
				.catch(err => {
					defer.reject(err);
				});
		});

		return defer.promise;
	}
};

module.exports = playerMod;
