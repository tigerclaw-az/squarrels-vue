var _ = require('lodash'),
	log = require('log4js');

let config = {
	/* eslint quotes: "off" */
	apiError: function(err) {
		if (!err) {
			err = "I'm sorry Dave, I'm afraid I can't do that.";
		}

		return {
			error: err
		};
	},

	getRandom(from, to) {
		return Math.random() * (to - from) + from;
	},

	getRandomStr(num) {
		var self = this;

		return _.times(num, function() {
			return String.fromCharCode(self.getRandom(96, 122));
		}).join('').replace(/`/g, ' ');
	},

	logger(name, options) {
		let mylog = log.getLogger(name || 'app');

		if (options) {
			return log.connectLogger(mylog, options);
		}

		return mylog;
	},

	playerImage: 'assets/images/squirrel-placeholder.jpg'
};

log.configure({
	appenders: {
		console: { type: 'console' }
	},
	categories: {
		default: { appenders: ['console'], level: process.env.LOGLEVEL },
		websocket: { appenders: ['console'], level: 'WARN' },
		'routes:decks': { appenders: ['console'], level: 'WARN' },
	}
});

module.exports = config;
