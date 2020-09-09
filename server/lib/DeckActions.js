/* eslint-disable class-methods-use-this */
const config = require('../config/config');
const deck = require('../routes/modules/deck');
const { sampleSize } = require('lodash');
const WSSActions = require('./WSSActions');
const logger = config.logger('lib:DeckActions');

class DeckActions extends WSSActions {
	constructor(wss, ws, sid) {
		super(wss, ws, sid);
		this.namespace = 'wsDecks';
	}

	// addCard(options) {
	// 	const {
	// 		id,
	// 		cards,
	// 	} = options;

	// 	return deck.update(id, { cards });
	// }

	async discardAction(payload) {
		logger.debug(payload);

		const {
			deckId,
			cardId,
		} = payload;

		await deck.update(deckId, { $push: { cards: cardId } });
	}

	drawCard(id, options) {
		const mainDeck = this.getDecksWithCards(id);
		const cardDrawn = options.adminCard || sampleSize(mainDeck.cards)[0];


	}
}

module.exports = DeckActions;
