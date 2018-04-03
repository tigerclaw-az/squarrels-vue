var Q = require('q'),
	Game = require('../../models/GameModel.js').model;

let gameMod = {
	update: (id, data, sid) => {
		let gameId = { _id: id },
			options = { new: true },
			defer = Q.defer();

		Game
			.findByIdAndUpdate(gameId, data, options)
			.populate('actionCard')
			.then(doc => {
				/* eslint-disable no-undef */
				wss.broadcast(
					{ type: 'games', action: 'update', nuts: doc },
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
	}
};

module.exports = gameMod;
