const mongoose = require('mongoose');
const mongooseSeed = require('mongoose-seed-db');

mongoose.Promise = require('q').Promise;
mongoose.set('debug', process.env.DEBUG_MONGO || false);

module.exports = function() {
	return mongooseSeed.connect(`mongodb://${process.env.MONGODB_HOST}:${process.env.MONGODB_PORT}/squarrels`);
};
