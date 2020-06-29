const appSession = require('./app-session');
const config = require('../config/config');
const logger = config.logger('websocket');
const WebSocket = require('ws');

// Create new WebSocket server instance
class WebsocketServer {
	constructor(server) {
		this.wss = new WebSocket.Server({
			verifyClient: function(info, done) {
				logger.debug('Parsing session from reequest...');
				appSession(info.req, {}, () => {
					done(info.req.sessionID);
				});
			},
			server,
		});
	}
}

module.exports = WebsocketServer;
