const _ = require('lodash');
const log = require('log4js');

log.configure({
	appenders: {
		console: { type: 'console' },
	},
	categories: {
		'default': { appenders: ['console'], level: process.env.LOGLEVEL },
		'modules:deck': { appenders: ['console'], level: 'DEBUG' },
		'routes:decks': { appenders: ['console'], level: 'DEBUG' },
	},
});

const config = {
	/* eslint quotes: "off" */
	apiError(err) {
		let error = err;

		if (_.isEmpty(err)) {
			error = "I'm sorry Dave, I'm afraid I can't do that.";
		}

		return {
			error,
		};
	},

	getRandom(from, to) {
		return Math.random() * (to - from) + from;
	},

	getRandomStr(num) {
		return _.times(num, () => {
			return String.fromCharCode(this.getRandom(96, 122));
		})
			.join('')
			.replace(/`/g, ' ');
	},

	logger(name, options) {
		const mylog = log.getLogger(name || 'app');

		if (options) {
			return log.connectLogger(mylog, options);
		}

		return mylog;
	},

	mongodbUri: `mongodb://${process.env.MONGODB_HOST}:${process.env.MONGODB_PORT}`,
	playerImage: 'assets/images/squirrel-placeholder.jpg',
};

module.exports = config;
