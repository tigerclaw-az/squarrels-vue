const mongoose = require('mongoose');
const PlayerSchema = require('../config/schemas/PlayerSchema');

module.exports = mongoose.model('Player', PlayerSchema);
