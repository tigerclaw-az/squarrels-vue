var mongoose = require('mongoose'),
	mongooseSeed = require('mongoose-seed-db'),
	config = require('./config');

mongoose.Promise = require('q').Promise;
mongoose.set('debug', config.loglevel === 'debug');

module.exports = function() {
	return mongooseSeed.connect(`mongodb://${config.server}/squarrels`);
};
