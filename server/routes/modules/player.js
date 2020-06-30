const _ = require('lodash');
const config = require('../../config/config');
const logger = config.logger('routes:modules:player');
const Q = require('q');
const { isEmpty } = require('lodash');

const initPlayer = {
	$set: { cardsInHand: [], cardsInStorage: [] },
	hasDrawnCard: false,
	hasStoredCards: false,
	isActive: false,
	totalCards: 0,
};

class Player {
	constructor() {
		this.PlayerModel = require('../../models/player.js');
	}

	// prettier-ignore
	getState(data = {}) {
		return this.PlayerModel
			.find(data)
			.select('+cardsInHand')
			.exec();
	}

	newRound(id, sid) {
		return this.update(id, initPlayer, sid);
	}

	reset(id, sid) {
		const newGameData = Object.assign({}, initPlayer, {
			score: 0,
		});

		logger.debug('newGameData -> ', newGameData);

		return this.update(id, newGameData, sid);
	}

	update(id, data, sid) {
		const playerId = { _id: id };
		const options = { new: true };
		const cardsDefer = Q.defer();
		const defer = Q.defer();

		if (!isEmpty(data.cardsInHand)) {
			if (data.addCards) {
				// Get existing cards from player and merge them with the given cards
				// prettier-ignore
				this
					.getState(playerId)
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
			cardsDefer.resolve([]);
		}

		cardsDefer.promise
			.then(cards => {
				logger.debug('cards -> ', cards);

				if (!isEmpty(cards)) {
					data.cardsInHand = cards;
					data.totalCards = cards.length;

					// Make sure the player can't draw more than 7 cards
					// if (data.totalCards >= 7) {
					// 	data.isFirstTurn = false;
					// }
				}

				// prettier-ignore
				this.PlayerModel
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
	}
}

module.exports = new Player();
