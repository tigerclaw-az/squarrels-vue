const mongoose = require('mongoose');
const GameSchema = require('../config/schemas/GameSchema');

module.exports = mongoose.model('Game', GameSchema);
