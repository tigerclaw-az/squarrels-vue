var mongoose = require('mongoose'),
	Schema = mongoose.Schema,
	PlayerSchema = new Schema({
		cardsInHand: {
			type: [Schema.Types.ObjectId],
			ref: 'Card',
			select: false
		},
		cardsInStorage: [{
			type: Schema.Types.ObjectId,
			ref: 'Card'
		}],
		img: {
			type: String
		},
		isActive: {
			type: Boolean,
			default: false
		},
		name: {
			type: String,
			required: true,
			trim: true
		},
		score: {
			type: Number,
			default: 0
		},
		sessionId: {
			type: String,
			required: true,
			select: false
		},
		isFirstTurn: {
			type: Boolean,
			default: true
		},
		totalCards: {
			type: Number,
			default: 0
		}
	}, {
		collection: 'players',
		timestamps: true,
		toObject: {
			virtuals: true
		},
		toJSON: {
			virtuals: true
		}
	});

module.exports = {
	schema: PlayerSchema,
	model: mongoose.model('Player', PlayerSchema)
};
