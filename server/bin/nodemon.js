require('dotenv').config();
const config = require('../config/config');
const logger = config.logger('nodemon');
const nodemon = require('nodemon');

nodemon({ script: './bin/www' })
	.on('start', function() {
		logger.info('nodemon start');
	})
	.on('crash', () => {
		logger.error('script crashed');
		nodemon.emit('quit');
	})
	.on('exit', () => {
		logger.error('script exit');
		nodemon.emit('quit');
	});
