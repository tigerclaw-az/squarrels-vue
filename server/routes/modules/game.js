const config = require('../../config/config');
const logger = config.logger();

const GameModel = require('../../models/game');

module.exports = {
	update: (id, data, sid) => {
		const gameId = { _id: id };
		const options = { new: true };

		// prettier-ignore
		return GameModel
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

	/**
	 * Remove the 'actionCard' from the game, which will trigger a
	 * message back to each client that the actionCard was removed
	 *
	 * @param {string} id ID of the game
	 * @param {string} sid Player sessionID
	 * @returns {Promise} mongoose Promise then/catch
	 */
	resetActionCard(id, sid) {
		return GameModel.findByIdAndUpdate(id, { actionCard: null }, sid);
	},
};
