const config = require('../../config/config');
const logger = config.logger('modules:player');
const Q = require('q');
const { isEmpty, union } = require('lodash');

const initPlayer = {
	$set: { cardsInHand: [], cardsInStorage: [] },
	hasDrawnCard: false,
	hasStoredCards: false,
	isActive: false,
	totalCards: 0,
};

class Player {
	constructor() {
		this.PlayerModel = require('../../config/models/player.js');
	}

	// prettier-ignore
	findPlayersWithCards(data = {}) {
		return this.PlayerModel
			.find(data)
			.select('+cardsInHand')
			.exec();
	}

	newRound(id, sid) {
		return this.update(id, initPlayer, sid);
	}

	reset(id) {
		const newGameData = Object.assign({}, initPlayer, {
			score: 0,
		});

		logger.debug('newGameData -> ', newGameData);

		return this.update(id, newGameData);
	}

	update(id, data, sid) {
		const playerId = { _id: id };
		const options = { new: true };
		const cardsDefer = Q.defer();
		const defer = Q.defer();

		logger.debug('update -> ', id, data, sid);

		if (!id) {
			return Promise.reject("ERROR: Missing 'id' for player update!");
		}

		if (!isEmpty(data.cardsInHand)) {
			if (data.addCards) {
				// Get existing cards from player and merge them with the given cards
				// prettier-ignore
				this
					.findPlayersWithCards(playerId)
					.then(pl => {
						logger.debug('pl -> ', pl);
						cardsDefer.resolve(
							union(data.cardsInHand, pl[0].cardsInHand)
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
				logger.debug('cardsAdded -> ', cards);

				if (!isEmpty(cards)) {
					data.cardsInHand = cards;
				}

				if (Object.prototype.hasOwnProperty.call(data, 'cardsInHand')) {
					data.totalCards = data.cardsInHand.length;
				}


				// prettier-ignore
				this.PlayerModel
					.findByIdAndUpdate(playerId._id, data, options)
					.select('+sessionId +cardsInHand')
					.populate({
						path: 'cardsInHand',
						model: 'Card',
						options: { sort: '-amount' },
					})
					.then(doc => {
						logger.debug('updated -> ', doc);

						if (!doc || isEmpty(doc)) {
							return defer.reject('ERROR: Catastrophe!!');
						}

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
			});

		return defer.promise;
	}
}

module.exports = new Player();
