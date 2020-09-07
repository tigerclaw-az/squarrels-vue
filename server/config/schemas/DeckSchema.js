const mongoose = require('mongoose');
const Schema = mongoose.Schema;

module.exports = new Schema({
	deckType: {
		type: String,
		required: true,
	},
	cards: [
		{
			type: Schema.Types.ObjectId,
			ref: 'Card',
			select: false,
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
