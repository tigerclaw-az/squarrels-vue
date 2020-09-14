const config = require('../config/config');
const logger = config.logger('lib:WSSActions');

class WSSActions {
	constructor(wss, ws, sid) {
		this.wss = wss;
		this.ws = ws;
		this.sid = sid;

		this.deck = require('../routes/modules/deck');
		this.game = require('../routes/modules/game');
	}

	send(data, options = { all: true }) {
		logger.debug(data, options);

		const wsData = {
			namespace: this.namespace,
			...data,
		};

		if (options.all) {
			return this.wss.broadcast(wsData, this.sid);
		}

		return this.ws.send(JSON.stringify(wsData));
	}
}

module.exports = WSSActions;
