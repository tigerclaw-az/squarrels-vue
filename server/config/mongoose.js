var mongoose = require('mongoose'),
	mongooseSeed = require('mongoose-seed-db');

mongoose.Promise = require('q').Promise;
mongoose.set('debug', process.env.DEBUG_MONGO || false);

module.exports = function() {
	return mongooseSeed.connect(`mongodb://${process.env.SERVER}/squarrels`);
};
