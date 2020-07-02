const mongoose = require('mongoose');
const GameSchema = require('../schemas/GameSchema');

module.exports = mongoose.model('Game', GameSchema);
