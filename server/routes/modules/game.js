const config = require('../../config/config');
const logger = config.logger('modules:game');

const DeckModel = require('../../config/models/deck');
const GameModel = require('../../config/models/game');

const player = require('./player');
const { isEmpty } = require('lodash');

module.exports = {
	update: (id, data, sid) => {
		logger.debug(id, data, sid);

		const gameId = { _id: id };
		const options = { new: true };

		if (isEmpty(data) || typeof data !== 'object') {
			return Promise.reject('ERROR: Invalid "data" to update game!');
		}

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
	 * @returns {Promise} mongoose Promise then/catch
	 */
	resetActionCard(id) {
		if (!id) {
			throw new Error('Missing game "id" to reset action card!');
		}

		return this.update(id, { actionCard: null });
	},

	async resetGame(gameData, options) {
		logger.debug('gameData -> ', gameData);
		logger.debug('option -> ', options);

		const init = {
			actionCard: null,
			isDealing: false,
			isLoaded: false,
			isStarted: false,
			roundNumber: 1,
			// $set: { deckIds: [] },
		};

		const gameId = gameData.id;
		const sessionId = gameData.sessionId;

		const game = await GameModel.findById(gameId).exec();

		logger.debug('game -> ', game);

		const deckIds = [...game.deckIds];
		const playerIds = [...game.playerIds];

		logger.debug('decks -> ', deckIds);
		logger.debug('players -> ', playerIds);

		game.deckIds = [];

		try {
			await DeckModel.deleteMany({ _id: { $in: deckIds } });
		} catch (err) {
			throw new Error(err);
		}

		playerIds.forEach(id => {
			// prettier-ignore
			player[options.isNewRound ? 'newRound' : 'reset'](id, sessionId)
				.then(doc => {
					logger.debug('player reset -> ', doc);
					wss.broadcast(
						{
							namespace: 'wsPlayers',
							action: 'update',
							nuts: doc,
						},
						sessionId
					);
				})
				.catch(err => {
					logger.error(err);
				});
		});

		// Set roundNumber to correct value
		if (options.isNewRound) {
			init.roundNumber = game.roundNumber + 1;
		}

		logger.debug('game init -> ', init);

		try {
			// eslint-disable-next-line
			for (const prop in init) {
				game[prop] = init[prop];
			}

			logger.debug('game reset -> ', game);
			game.save();

			wss.broadcast(
				{ namespace: 'wsGame', action: 'update', nuts: game },
				sessionId
			);

			return game;
		} catch (err) {
			logger.error(err);
			throw new Error(err);
		}
	},
};
