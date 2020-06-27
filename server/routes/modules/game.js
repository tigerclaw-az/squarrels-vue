const config = require('../../config/config');
const logger = config.logger();
const Game = require('../../models/GameModel.js');

module.exports = {
	update: (id, data, sid) => {
		const gameId = { _id: id };
		const options = { new: true };

		// prettier-ignore
		return Game
			.findByIdAndUpdate(gameId, data, options)
			.populate('actionCard')
			.then(doc => {
				wss.broadcast(
					{ namespace: 'wsGame', action: 'update', nuts: doc },
					sid
				);

				return Promise.resolve(doc);
			})
			.catch(err => {
				logger.error(err);

				return Promise.reject(err);
			});
	},
};
