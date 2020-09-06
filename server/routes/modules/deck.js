const config = require('../../config/config');
const { isArray, shuffle, isEmpty } = require('lodash');
const logger = config.logger('modules:decks');

class Deck {
	constructor() {
		this.CardModel = require('../../config/models/card');
		this.DeckModel = require('../../config/models/deck');
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

		return new this.DeckModel(data).save();
	}

	delete(ids) {
		logger.debug(ids);

		if (isArray(ids)) {
			return this.DeckModel.deleteMany({ _id: { $in: ids } });
		}

		return this.DeckModel.deleteOne({ _id: ids });
	}

	getCards(id) {
		const deckId = { _id: id };

		return this.DeckModel
			.findById(deckId)
			.populate('cards')
			.exec();
	}

	async update(id, data, sid) {
		logger.debug(id, data);

		const options = { new: true };

		if (isEmpty(data) || typeof data !== 'object') {
			throw new Error('ERROR: Invalid "data" to update deck!');
		}

		try {
			const doc = await this.DeckModel.findByIdAndUpdate(id, data, options).populate('cards');

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
