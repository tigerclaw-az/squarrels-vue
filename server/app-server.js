const bodyParser = require('body-parser');
const config = require('./config/config');
const cors = require('cors');
const express = require('express');
const logger = config.logger();
const path = require('path');
const session = require('express-session');
const MongodbSession = require('connect-mongodb-session')(session);

const app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.set('trust proxy', 1);

// app.use(log4js.connectLogger(log4js.getLogger('http'), { level: 'auto' }));

app.use(bodyParser.json({ limit: '75mb' }));
app.use(bodyParser.urlencoded({ limit: '75mb', extended: true }));

app.use(express.static(path.join(__dirname, '../client/public')));
app.use(express.static(path.join(__dirname, '../client/dist')));

// -----------
// CORS
// -----------
app.use(
	cors({
		origin: true,
		methods: ['GET', 'POST', 'DELETE'],
		credentials: true,
	})
);

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
	uri: `mongodb://${process.env.MONGODB_HOST}:${process.env.MONGODB_PORT}/squarrels_sessions`,
});

sessionStore.on('error', err => {
	logger.error('sessionStore ERROR -> ', err);
});

const sessionParser = session({
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

app.use(sessionParser);

require('./config/mongoose')()
	.then(function() {
		const mongooseSeed = require('mongoose-seed-db'),
			populateOpts = { populateExisting: false };

		logger.info('mongodb connection successful');

		mongooseSeed.loadModels(path.join(__dirname, '/models/seeds'));
		mongooseSeed
			.populate(path.join(__dirname, '/config/seeds'), populateOpts)
			.catch(err => {
				logger.error(err);
			});
	})
	.catch(function(err) {
		logger.error('mongodb connection error', err);
		process.exit(1);
	});

// ----------
// ROUTING
// ----------
const routes = {
	cards: require('./routes/cards'),
	decks: require('./routes/decks'),
	games: require('./routes/games'),
	players: require('./routes/players'),
};

// app.use('/api/', routes);
app.use('/api/cards', routes.cards);
app.use('/api/decks', routes.decks);
app.use('/api/games', routes.games);
app.use('/api/players', routes.players);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
	const err = new Error(`Not Found: ${req.url}`);

	err.status = 404;
	next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
	app.use(function(err, req, res) {
		logger.log('Server is listening on port ' + app.get('port'));

		res.status(err.status || 500);
		res.render('error', {
			message: err.message,
			error: err,
		});
	});
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res) {
	res.status(err.status || 500);
	res.render('error', {
		message: err.message,
		error: {},
	});
});

module.exports = {
	app,
	sessionParser,
	sessionStore,
};
