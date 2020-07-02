const mongoose = require('mongoose');
const PlayerSchema = require('../schemas/PlayerSchema');

module.exports = mongoose.model('Player', PlayerSchema);
