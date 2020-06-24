const config = require('../config/config');
const logger = config.logger();
const session = require('express-session');
const MongodbSession = require('connect-mongodb-session')(session);

// ----------
// SESSION
// ----------
const SECRET = '$eCuRiTy';
const sessionStore = new MongodbSession({
	autoReconnect: true,
	clearInterval: 3600000,
	collection: 'sessions',
	databaseName: 'squarrels_sessions',
	secret: SECRET,
	uri: `${config.mongodbUri}/squarrels_sessions`,
});

sessionStore.on('error', err => {
	logger.error('sessionStore ERROR -> ', err);
});

module.exports = session({
	cookie: {
		httpOnly: true,
		maxAge: 1000 * 60 * 60 * 24 * 90, // 3 months
		sameSite: 'lax',
		secure: false,
	},
	name: 'squarrels',
	secret: SECRET,
	store: sessionStore,
	resave: true,
	saveUninitialized: true,
});
