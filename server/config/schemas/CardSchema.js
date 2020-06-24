const mongoose = require('mongoose');

module.exports = new mongoose.Schema({
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
});
