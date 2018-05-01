var mongoose = require('mongoose'),
	mongooseSeed = require('mongoose-seed-db');

mongoose.Promise = require('q').Promise;
mongoose.set('debug', process.env.LOGLEVEL === 'debug' || process.env.LOGLEVEL === 'trace');

module.exports = function() {
	return mongooseSeed.connect(`mongodb://${process.env.SERVER}/squarrels`);
};
