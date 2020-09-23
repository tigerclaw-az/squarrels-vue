const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const DeckSchema = new Schema({
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
}, {
	collection: 'decks',
	timestamps: true,
	toObject: {
		virtuals: true,
	},
	toJSON: {
		virtuals: true,
	},
});

DeckSchema.methods.toJSON = function() {
	const obj = this.toObject();

	delete obj.__v;
	delete obj._id;

	return obj;
};

module.exports = DeckSchema;
