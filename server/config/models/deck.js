const mongoose = require('mongoose');
const DeckSchema = require('../schemas/DeckSchema');

module.exports = mongoose.model('Deck', DeckSchema);
