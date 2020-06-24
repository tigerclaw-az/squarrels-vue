const mongoose = require('mongoose');
const CardSchema = require('../config/schemas/CardSchema');

module.exports = mongoose.model('Card', CardSchema.default || CardSchema);
