const mongoose = require('mongoose');
const Schema = mongoose.Schema;

module.exports = DeckSchema = new Schema({
	deckType: {
		type: String,
		required: true,
	},
	cards: [
		{
			type: Schema.Types.ObjectId,
			ref: 'Card',
		},
	],
},
{
	collection: 'decks',
	timestamps: true,
	toObject: {
		virtuals: true,
	},
	toJSON: {
		virtuals: true,
	},
});
