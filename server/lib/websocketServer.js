const appSession = require('./app-session');
const config = require('../config/config');
const logger = config.logger('websocket');
const WebSocket = require('ws');

const WS_EVENTS = {
	CLOSE: 'close',
	ERROR: 'error',
	MESSAGE: 'message',
	OPEN: 'open',
	PING: 'ping',
	PONG: 'pong',
	UPGRADE: 'upgrade',
};

// Create new WebSocket server instance
class WebsocketServer {
	constructor(server) {
		this.clients = {};

		this.wss = new WebSocket.Server({
			clientTracking: true,
			verifyClient: function(info, done) {
				logger.debug('Parsing session from reequest...');
				appSession(info.req, {}, () => {
					done(info.req.sessionID);
				});
			},
			server,
		});

		/*
		 * Setup broadcast method to send messages to ALL clients
		 */
		this.wss.broadcast = (data, sid, all = true) => {
			logger.debug('broadcast() -> ', data, sid, all);

			wss.clients.forEach(client => {
				if (client.readyState === WebSocket.OPEN) {
					if (all || client !== this.clients[sid]) {
						client.send(JSON.stringify(data));
					}
				}
			});
		};
	}

	connected(ws, sid) {
		logger.info('Connection accepted:', sid);
		logger.info('Clients Connected: %s', this.wss.clients.size);

		// Save sessionID against the map of clients so we can reference later
		this.clients[sid] = ws;

		ws.on(WS_EVENTS.ERROR, err => {
			logger.error(err);
		});

		ws.on(WS_EVENTS.CLOSE, connection => {
			logger.warn('Connection Closed:', connection);
			// hoardPlayer = null;
		});
	}
}

module.exports = WebsocketServer;
