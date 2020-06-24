const mongoose = require('mongoose');
const Schema = mongoose.Schema;

module.exports = new Schema({
	actionCard: {
		type: Schema.Types.ObjectId,
		ref: 'Card',
		default: null,
	},
	roundNumber: {
		type: Number,
		default: 1,
	},
	playerIds: {
		type: [Schema.Types.ObjectId],
		ref: 'Player',
	},
	deckIds: {
		type: [Schema.Types.ObjectId],
		ref: 'Deck',
	},
	isStarted: {
		type: Boolean,
		default: false,
	},
}, {
	collection: 'games',
	timestamps: true,
	toObject: {
		virtuals: true,
	},
	toJSON: {
		virtuals: true,
	},
});
