const config = require('../../config/config');
const logger = config.logger();
const gameModel = require('../../models/game');

module.exports = {
	update: (id, data, sid) => {
		const gameId = { _id: id };
		const options = { new: true };

		// prettier-ignore
		return gameModel
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
