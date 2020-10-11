const config = require('../../config/config');
const logger = config.logger('modules:player');
const Q = require('q');
const { isEmpty, union } = require('lodash');

const initPlayer = {
	$set: { cardsInHand: [], cardsInStorage: [] },
	hasDrawnCard: false,
	hasStoredCards: false,
	isActive: false,
	isQuarrelWinner: false,
	selectQuarrelCard: false,
	totalCards: 0,
};

class Player {
	constructor() {
		this.model = require('../../config/models/player.js');
	}

	// prettier-ignore
	findPlayersWithCards(query = {}) {
		return this.model
			.find(query)
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

	async update(id, data, sid) {
		const playerQuery = { _id: id };
		const options = { new: true };
		let cardsToAdd = [];

		logger.debug('update -> ', id, data, sid);

		if (!id) {
			return Promise.reject("ERROR: Missing 'id' for player update!");
		}

		const pl = (await this.findPlayersWithCards(playerQuery))[0];

    logger.debug('pl -> ', pl);

		if (!isEmpty(data.cardsInHand)) {
			if (data.addCards) {
				cardsToAdd = union(data.cardsInHand, pl.cardsInHand);
			} else {
				cardsToAdd = data.cardsInHand;
			}
		}

		const plUpdates = {
			...data,
		};

		if (!isEmpty(cardsToAdd)) {
			plUpdates.cardsInHand = cardsToAdd;
		}

		plUpdates.totalCards = plUpdates.cardsInHand ? plUpdates.cardsInHand.length : pl.cardsInHand.length;
		logger.debug('plUpdates -> ', plUpdates);

		try {
			// Should not need .populate() here, it will populate ALL players cards
			const doc = await this.model.findByIdAndUpdate(playerQuery._id, plUpdates, options).select('+sessionId +cardsInHand')
				.populate({
					path: 'cardsInHand',
					model: 'Card',
					options: { sort: '-amount' },
				});

			logger.debug('updated -> ', doc);

			if (!doc || isEmpty(doc)) {
				throw new Error('ERROR: Catastrophe!!');
			}

			const wsData = {
				namespace: 'wsPlayers',
				action: 'update',
				nuts: doc,
			};

			wss.broadcast(wsData, sid);

			return doc;
		} catch (e) {
			throw new Error(e);
		}
	}
}

module.exports = new Player();
