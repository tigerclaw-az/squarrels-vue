const _ = require('lodash');
const config = require('../../config/config');
const logger = config.logger('routes:modules:player');
const Q = require('q');
const Player = require('../../models/PlayerModel.js');

const initPlayer = {
	$set: { cardsInHand: [], cardsInStorage: [] },
	hasDrawnCard: false,
	hasStoredCards: false,
	isActive: false,
	totalCards: 0,
};

module.exports = {
	get: (data = {}) => {
		// prettier-ignore
		return Player
			.find(data)
			.select('+cardsInHand')
			.exec();
	},
	newRound: (id, sid) => {
		return this.update(id, initPlayer, sid);
	},
	reset: (id, sid) => {
		const newGameData = Object.assign({}, initPlayer, {
			score: 0,
		});

		logger.debug('newGameData -> ', newGameData);

		return this.update(id, newGameData, sid);
	},
	update: (id, data, sid) => {
		const playerId = { _id: id },
			options = { new: true },
			cardsDefer = Q.defer(),
			defer = Q.defer();

		if (data.cardsInHand) {
			if (data.addCards) {
				// Get existing cards from player and merge them with the given cards
				// prettier-ignore
				this
					.get(playerId)
					.then(pl => {
						logger.debug('pl -> ', pl);
						cardsDefer.resolve(
							_.union(data.cardsInHand, pl[0].cardsInHand)
						);
					});
			} else {
				cardsDefer.resolve(data.cardsInHand);
			}
		} else {
			cardsDefer.resolve(null);
		}

		cardsDefer.promise
			.then(cards => {
				logger.debug('cards -> ', cards);

				if (cards) {
					data.cardsInHand = cards;
					data.totalCards = cards.length;

					// Make sure the player can't draw more than 7 cards
					// if (data.totalCards >= 7) {
					// 	data.isFirstTurn = false;
					// }
				}

				// prettier-ignore
				Player
					.findOneAndUpdate(playerId, data, options)
					.then(doc => {
						const wsData = {
							namespace: 'wsPlayers',
							action: 'update',
							nuts: doc,
						};

						wss.broadcast(wsData, sid);

						defer.resolve(doc);
					})
					.catch(err => {
						defer.reject(err);
					});
			})
			.catch(err => {
				logger.error(err);
				defer.reject(err);
			});

		return defer.promise;
	},
};
