const mongoose = require("mongoose"),
    config = require("../config/config"),
    logger = config.logger();

var Schema = mongoose.Schema,
    CardSchema = new Schema({
        name: {
            type: String,
            required: true
        },
        amount: {
            type: Number,
            required: true
        },
        cardType: {
            type: String,
            required: true
        },
        action: {
            type: String
        }
    }, {
        collection: 'cards',
        timestamps: false,
        toObject: {
            virtuals: true
        },
        toJSON: {
            virtuals: true
        }
    });

module.exports = {
    schema: CardSchema,
    model: mongoose.model('Card', CardSchema)
};