const config = require('../../config/config');
const logger = config.logger('modules:game');

const { isEmpty, shuffle } = require('lodash');

class Game {
	constructor() {
		this.CardModel = require('../../config/models/card');
		this.DeckModel = require('../../config/models/deck');
		this.GameModel = require('../../config/models/game');
		this.player = require('./player');
	}

	async createDecks(id, sessionId) {
		try {
			const cards = await this.CardModel.find({}).exec();

			const decks = [
				await new this.DeckModel({
					deckType: 'discard',
				}).save(),
				await new this.DeckModel({
					deckType: 'main',
					cards: shuffle(shuffle(cards)),
				}).save(),
				await new this.DeckModel({
					deckType: 'hoard',
				}).save(),
			];

			// const decks = Promise.all(deckPromises);

			const gameData = {
				deckIds: decks.map(deck => deck.id),
			};

			logger.debug('gameData -> ', gameData);

			const doc = await this.update(id, gameData, sessionId);

			logger.debug('game:createDecks -> ', doc);

			return doc;
		} catch (err) {
			logger.error(err);
			throw new Error(err);
		}
	}

	async delete(id, sessionId) {
		const doc = await this.GameModel.findById(id).exec();

		const deckIds = doc.deckIds;
		const playerIds = doc.playerIds;

		logger.debug('decks -> ', deckIds);
		logger.debug('players -> ', playerIds);

		try {
			await this.DeckModel.deleteMany({ _id: { $in: deckIds } });
			wss.broadcast(
				{
					namespace: 'wsDecks',
					action: 'reset',
				},
				sessionId
			);

			playerIds.forEach(id => {
				this.player.reset(id).then(doc => {
					wss.broadcast(
						{
							namespace: 'wsPlayers',
							action: 'reset',
							nuts: doc,
						},
						sessionId
					);
				});
			});

			await this.GameModel.remove({ _id: doc.id });

			wss.broadcast(
				{
					namespace: 'wsGame',
					action: 'delete',
					id: doc.id,
				},
				sessionId
			);
		} catch (err) {
			logger.error(err);
			throw new Error(err);
		}
	}

	async update(id, data, sid) {
		logger.debug(id, data, sid);

		const gameId = { _id: id };
		const options = { new: true };

		if (isEmpty(data) || typeof data !== 'object') {
			throw new Error('ERROR: Invalid "data" to update game!');
		}

		try {
			const doc = await this.GameModel.findByIdAndUpdate(gameId, data, options).populate('actionCard');

			wss.broadcast(
				{ namespace: 'wsGame', action: 'update', nuts: doc },
				sid
			);

			return doc;
		} catch (err) {
			logger.error(err);
			throw new Error(err);
		}
	}

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
	}

	async reset(gameData, options) {
		logger.debug('gameData -> ', gameData);
		logger.debug('option -> ', options);

		const init = {
			actionCard: null,
			roundNumber: 1,
			status: 'INIT',
		};

		const gameId = gameData.id;
		const sessionId = gameData.sessionId;

		const game = await this.GameModel.findById(gameId).exec();

		logger.debug('game -> ', game);

		const deckIds = [...game.deckIds];
		const playerIds = [...game.playerIds];

		logger.debug('decks -> ', deckIds);
		logger.debug('players -> ', playerIds);

		try {
			const decksDeleted = await this.DeckModel.deleteMany({ _id: { $in: deckIds } });

			if (!decksDeleted || decksDeleted.deletedCount !== deckIds.length) {
				throw new Error('DECKS NOT DELTED!');
			}

			wss.broadcast(
				{
					namespace: 'wsDecks',
					action: 'reset',
				},
				sessionId
			);
		} catch (err) {
			throw new Error(err);
		}

		playerIds.forEach(id => {
			// prettier-ignore
			this.player[options.isNewRound ? 'newRound' : 'reset'](id, sessionId)
				.then(doc => {
					logger.debug('player reset -> ', doc);
					wss.broadcast(
						{
							namespace: 'wsPlayers',
							action: 'reset',
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
			return this.update(game.id, {
				deckIds: [],
				...init,
			});
		} catch (err) {
			logger.error(err);
			throw new Error(err);
		}
	}
}

module.exports = new Game();
