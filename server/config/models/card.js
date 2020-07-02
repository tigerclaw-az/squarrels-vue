const mongoose = require('mongoose');
const CardSchema = require('../schemas/CardSchema');

module.exports = mongoose.model('Card', CardSchema.default || CardSchema);
