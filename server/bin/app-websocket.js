const config = require('../config/config');
const logger = config.logger('websocket');

const WebsocketServer = require('../lib/websocketServer');

module.exports = function(server) {
	const appWSS = new WebsocketServer(server);
	const wss = appWSS.wss;

	const PlayerActions = require('../lib/PlayerActions');

	const onConnection = (ws, req) => {
		logger.info('connection state -> ', ws.readyState);

		const sid = req.sessionID;
		const actions = new PlayerActions(wss, ws, sid);

		const onMessage = message => {
			const data = JSON.parse(message);

			// Process WebSocket message
			logger.debug('Message received: ', data);
			logger.debug(`websocket:onmessage:${data.action} -> ${sid}`);

			if (typeof actions[data.action] === 'function') {
				actions[data.action](data);
			} else {
				wss.broadcast(data);
			}
		};

		appWSS.connected(ws, sid);

		// This is the most important callback for us, we'll handle
		// all messages from users here.
		ws.on('message', onMessage);
	};

	wss.on('connection', onConnection);

	global.wss = wss;

	return wss;
};
