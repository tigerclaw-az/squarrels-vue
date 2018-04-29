var mongoose = require('mongoose'),
	Schema = mongoose.Schema,
	Deck = require('./DeckModel'),
	Player = require('./PlayerModel'),
	GameSchema = new Schema({
		actionCard: {
			type: Schema.Types.ObjectId,
			ref: 'Card',
			default: null
		},
		roundNumber: {
			type: Number,
			default: 1
		},
		players: {
			type: [Schema.Types.ObjectId],
			ref: Player.model
		},
		decks: {
			type: [Schema.Types.ObjectId],
			ref: Deck.model
		},
		isStarted: {
			type: Boolean,
			default: false
		}
	}, {
		collection: 'games',
		timestamps: true,
		toObject: {
			virtuals: true
		},
		toJSON: {
			virtuals: true
		}
	});

module.exports = {
	schema: GameSchema,
	model: mongoose.model('Game', GameSchema)
};
