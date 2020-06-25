const bodyParser = require('body-parser');
const config = require('../config/config');
const cors = require('cors');
const express = require('express');
const logger = config.logger();
const appSession = require('../lib/app-session');

const app = express();

app.use(bodyParser.json({ limit: '75mb' }));
app.use(bodyParser.urlencoded({ limit: '75mb', extended: true }));

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

app.use(appSession);

// ----------
// ROUTING
// ----------
const routes = {
	cards: require('../routes/cards'),
	decks: require('../routes/decks'),
	games: require('../routes/games'),
	players: require('../routes/players'),
};

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
		logger.info(`Server is listening on port ${app.get('port')}`);

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
	logger.info('Production error handler -> ', err);

	res.status(err.status || 500);
	res.render('error', {
		message: err.message,
		error: {},
	});
});

module.exports = app;
