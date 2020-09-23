const config = require('../../config/config');
const { isArray, shuffle, isEmpty, sampleSize, filter } = require('lodash');

const logger = config.logger('modules:deck');

class Deck {
	constructor() {
		this.CardModel = require('../../config/models/card');
		this.model = require('../../config/models/deck');
	}

	async create(options) {
		logger.debug('create -> ', options);
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

	async drawCard(payload) {
		logger.debug('drawCard -> ', payload);

		const {
			deckId: id,
			sessionId: sid,
			filter: applyFilter,
		} = payload;

		const mainDeck = await this.getDecksWithCards(id, filter);
		const cardsToDraw = applyFilter ? filter(mainDeck.cards, applyFilter) : mainDeck.cards;
		const cardDrawn = payload.adminCard || sampleSize(cardsToDraw)[0];

		try {
			// Remove the card drawn from the deck so it doesn't get pulled again
			mainDeck.cards.pull(cardDrawn.id);
			await mainDeck.save();

			// This will send a websocket update back to the clients so they update the
			// local cache of the main deck
			wss.broadcast(
				{ namespace: 'wsDecks', action: 'update', nuts: mainDeck },
				sid
			);

			return cardDrawn;
		} catch (err) {
			logger.error(err);
			throw new Error(err);
		}
	}

	delete(ids) {
		logger.debug('delete -> ', ids);

		if (isArray(ids)) {
			return this.model.deleteMany({ _id: { $in: ids } });
		}

		return this.model.findByIdAndDelete(ids);
	}

	getDecksWithCards(ids) {
		logger.debug('getDecksWithCards -> ', ids);

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

	async update(id, data, sid) {
		logger.debug('update -> ', id, data);

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
