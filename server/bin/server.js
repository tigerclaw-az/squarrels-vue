require('dotenv').config();
const config = require('../config/config');
const logger = config.logger('nodemon');
const nodemon = require('nodemon');

nodemon({ script: './bin/www' })
	.on('start', function() {
		logger.info('nodemon start');
	})
	.on('crash', err => {
		logger.error('script crashed', err);
		nodemon.emit('quit');
		// process.exit(1);
	})
	.on('exit', () => {
		logger.warn('script exit');
	});
