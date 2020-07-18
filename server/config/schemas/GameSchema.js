const mongoose = require('mongoose');
const Schema = mongoose.Schema;

module.exports = new Schema({
	actionCard: {
		type: Schema.Types.ObjectId,
		ref: 'Card',
		default: null,
	},
	createdBy: {
		type: Schema.Types.ObjectId,
		ref: 'Player',
		default: null,
	},
	deckIds: {
		type: [Schema.Types.ObjectId],
		ref: 'Deck',
	},
	isDrawingCard: {
		type: Boolean,
		default: false,
	},
	// isStarted: {
	// 	type: Boolean,
	// 	default: false,
	// },
	playerIds: {
		type: [Schema.Types.ObjectId],
		ref: 'Player',
	},
	roundNumber: {
		type: Number,
		default: 1,
	},
	// TODO: Use GameState schema
	status: {
		type: String,
		default: null,
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
