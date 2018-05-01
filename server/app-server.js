var express = require('express'),
	bodyParser = require('body-parser'),
	session = require('express-session'),
	path = require('path'),
	config = require('./config/config'),
	logger = config.logger(),
	MongodbSession = require('connect-mongodb-session')(session);

let app = express(),
	secret = '$eCuRiTy',
	sessionStore = new MongodbSession({
		uri: `mongodb://${process.env.SERVER}/squarrels_sessions`,
		collection: 'sessions'
	});

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.set('trust proxy', 1);

// app.use(log4js.connectLogger(log4js.getLogger('http'), { level: 'auto' }));

app.use(bodyParser.json({ limit: '75mb' }));
app.use(bodyParser.urlencoded({ limit: '75mb', extended: true }));

// ----------
// SESSION
// ----------
const sessionParser = session({
	secret,
	cookie: {
		httpOnly: false,
		sameSite: true,
	},
	store: sessionStore,
	resave: false,
	saveUninitialized: false
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
			.catch((err) => {
				logger.error(err);
			});
	})
	.catch(function(err) {
		logger.error('mongodb connection error', err);
		process.exit(1);
	});

app.use(express.static(path.join(__dirname, '../client/public')));
app.use(express.static(path.join(__dirname, '../client')));

// ----------
// ROUTING
// ----------
let routes = {
	cards: require('./routes/cards'),
	decks: require('./routes/decks'),
	games: require('./routes/games'),
	players: require('./routes/players')
};

app.use(function(req, res, next) {
	res.header('Access-Control-Allow-Credentials', true);
	res.header('Access-Control-Allow-Origin', `http://${process.env.SERVER}:${process.env.CLIENT_PORT}`);
	res.header(
		'Access-Control-Allow-Headers',
		'Cache-Control, Pragma, Origin, Authorization, Content-Type, X-Requested-With'
	);
	res.header('Access-Control-Allow-Methods', 'GET, PUT, POST, DELETE');
	return next();
});
// app.use('/api/', routes);
app.use('/api/cards', routes.cards);
app.use('/api/decks', routes.decks);
app.use('/api/games', routes.games);
app.use('/api/players', routes.players);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
	var err = new Error(`Not Found: ${req.url}`);

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
			error: err
		});
	});
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res) {
	res.status(err.status || 500);
	res.render('error', {
		message: err.message,
		error: {}
	});
});

module.exports = {
	app,
	sessionParser,
	sessionStore
};
