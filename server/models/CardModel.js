const mongoose = require('mongoose');

const Schema = mongoose.Schema,
	CardSchema = new Schema(
		{
			name: {
				type: String,
				required: true,
			},
			amount: {
				type: Number,
				required: true,
			},
			cardType: {
				type: String,
				required: true,
			},
			action: {
				type: String,
			},
		},
		{
			collection: 'cards',
			timestamps: false,
			toObject: {
				virtuals: true,
			},
			toJSON: {
				virtuals: true,
			},
		}
	);

module.exports = {
	schema: CardSchema,
	model: mongoose.model('Card', CardSchema),
};
