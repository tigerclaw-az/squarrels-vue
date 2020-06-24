const mongoose = require('mongoose');
const DeckSchema = require('../config/schemas/DeckSchema');

module.exports = mongoose.model('Deck', DeckSchema);
