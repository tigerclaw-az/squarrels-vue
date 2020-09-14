const config = require('../../config/config');
const { isArray, shuffle, isEmpty } = require('lodash');
const logger = config.logger('modules:decks');

class Deck {
	constructor() {
		this.CardModel = require('../../config/models/card');
		this.model = require('../../config/models/deck');
	}

	async create(options) {
		logger.debug(options);
		const deckType = options.name;
		const data = {
			deckType,
		};

		if (deckType === 'main') {
			const cards = await this.CardModel.find({}).exec();

			data.cards = shuffle(shuffle(cards));
		}

		logger.debug(data);

		return new this.model(data).save();
	}

	delete(ids) {
		logger.debug(ids);

		if (isArray(ids)) {
			return this.model.deleteMany({ _id: { $in: ids } });
		}

		return this.model.findByIdAndDelete(ids);
	}

	getDecksWithCards(ids) {
		logger.debug(ids);

		let query = this.model.find()
			.where('_id')
			.in(ids);

		if (!isArray(ids)) {
			query = this.model.findById(ids);
		}

		return query
			.populate('cards')
			.exec();
	}

	// TODO: Move this into DeckActions once it's not being called from routes/decks.js
	async update(id, data, sid) {
		logger.debug(id, data);

		const options = { new: true };

		if (isEmpty(data) || typeof data !== 'object') {
			throw new Error('ERROR: Invalid "data" to update deck!');
		}

		try {
			const doc = await this.model.findByIdAndUpdate(id, data, options).populate('cards');

			wss.broadcast(
				{ namespace: 'wsDecks', action: 'update', nuts: doc },
				sid
			);

			return doc;
		} catch (err) {
			logger.error(err);
			throw new Error(err);
		}
	}
}

module.exports = new Deck();
