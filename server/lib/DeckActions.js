/* eslint-disable class-methods-use-this */
const config = require('../config/config');
const WSSActions = require('./WSSActions');

const logger = config.logger('lib:DeckActions');

class DeckActions extends WSSActions {
	constructor(wss, ws, sid) {
		super(wss, ws, sid);
		this.namespace = 'wsDecks';

		this.deck = require('../routes/modules/deck');
	}

	async discard(payload) {
		logger.debug(payload);

		const {
			deckId,
			cardId,
		} = payload;

		await this.deck.update(deckId, { $push: { cards: cardId } });
	}
}

module.exports = DeckActions;
