const Q = require('q');
const Game = require('../../models/GameModel.js');

const gameMod = {
	update: (id, data, sid) => {
		const gameId = { _id: id },
			options = { new: true },
			defer = Q.defer();

		// prettier-ignore
		Game
			.findByIdAndUpdate(gameId, data, options)
			.populate('actionCard')
			.then(doc => {
				/* eslint-disable no-undef */
				wss.broadcast(
					{ namespace: 'wsGame', action: 'update', nuts: doc },
					sid
				);
				/* eslint-disable no-undef */

				defer.resolve(doc);
			})
			.catch(err => {
				logger.error(err);
				defer.reject(err);
			});

		return defer.promise;
	},
};

module.exports = gameMod;
