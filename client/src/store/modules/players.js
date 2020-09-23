import Vue from 'vue';
import { getRandomStr } from '@/utils';
import {
	concat,
	difference,
	filter,
	find,
	findIndex,
	flatten,
	flow,
	isEmpty,
	isString,
	map,
	maxBy,
	reject,
	sample,
	union,
} from 'lodash';

import api from '@/api/index';
import mutationTypes from '@/store/mutation-types';

const plDefault = {
	name: getRandomStr(12),
};

const state = {
	ids: [],
};

const getters = {
	canDrawCard: (state, getter, _, rootGetters) => {
		const myPlayer = getter.getMyPlayer;

		Vue.$log.debug(state, myPlayer);

		if (myPlayer.id && myPlayer.cardsInHand) {
			return (
				myPlayer.isActive &&
				!rootGetters['game/isActionCard']() &&
				!myPlayer.hasStoredCards &&
				(myPlayer.cardsInHand.length < 7 || !myPlayer.hasDrawnCard)
			);
		}

		return false;
	},

	canDiscardCard: (_, getter) => {
		const myPlayer = getter.getMyPlayer;

		return myPlayer.isActive && myPlayer.hasDrawnCard;
	},

	getById: state => id => {
		return state[id] || {};
	},

	getByProp: state => (prop, value, options = {}) => {
		const index = options.index || false;
		const all = options.all || false;

		Vue.$log.debug('get()', prop, value, index);

		let method = find;

		if (index) {
			method = findIndex;
		} else if (all) {
			method = filter;
		}

		if (prop) {
			if (value) {
				return method(state, function(o) {
					return o[prop] === value;
				});
			}

			// If a 'value' wasn't given, then we're just looking for the player
			// where the supplied 'prop' is !null/undefined
			return method(state, prop);
		}

		return state;
	},

	getMyPlayer: (state, _getters_, rootState) => {
		Vue.$log.debug('getMyPlayer()', state, rootState);

		for (const id in state) {
			if (id === rootState.localPlayer.id) {
				return state[id];
			}
		}

		return { id: '' };
	},

	getNextPlayer: state => activeIndex => {
		Vue.$log.debug('getNextPlayer()', activeIndex, state);

		if (activeIndex === -1) {
			// Get random player from list of player IDs
			return sample(state.ids);
		} else if (activeIndex === state.ids.length - 1) {
			// Reset active player to first player
			activeIndex = 0;
		} else {
			activeIndex++;
		}

		return state.ids[activeIndex];
	},

	isActivePlayer: (state, getter) => {
		return getter.getMyPlayer.isActive;
	},

	totalPlayers: state => {
		return state.ids.length;
	},
};

const actions = {
	actionCard({ getters }, payload) {
		this._vm.$log.debug(payload, getters.isActivePlayer);

		if (getters.isActivePlayer) {
			this._vm.$socket.sendObj({
				action: payload.name,
				gameId: payload.gameId,
			});
		}
	},
	async add({ dispatch }, plArr) {
		this._vm.$log.debug('add()', plArr);

		try {
			const res = await api.players.get(plArr.join(','));

			return dispatch('updateLocalPlayer', res.data[0]);
		} catch (err) {
			this._vm.$log.error(err);
			throw new Error(err);
		}
	},

	async addCards({ dispatch, getters }, data) {
		this._vm.$log.debug('players/addCards', data, getters, this);

		if (!data.cards) {
			throw new Error('"cards" cannot be empty!');
		}

		const cardsToAdd = flow(
			map(card => card.id),
			flatten,
		)(data.cards);

		const playerId = data.id || getters.getMyPlayer.id;

		try {
			const res = await dispatch('update', {
				id: playerId,
				data: {
					addCards: true,
					cardsInHand: cardsToAdd,
				},
			});

			this._vm.$log.debug('players/update', res);

			return res;
		} catch (e) {
			this._vm.$toasted.error('This is nuts! ' + e);
			this._vm.$log.error('This is nuts! Error: ', e);
			throw new Error(e);
		}
	},

	async create({ commit, dispatch }, plObj) {
		const plData = Object.assign({}, plDefault, plObj);

		try {
			const res = await api.players.create(plData);

			commit(mutationTypes.root.LOGIN, res.data, { root: true });
			await dispatch('updateLocalPlayer', res.data);

			return res.data;
		} catch (err) {
			this._vm.$log.error(err);
			throw new Error(err);
		}
	},

	async collectHoard({ dispatch, getters }, pl) {
		const myPlayer = getters.getMyPlayer;

		if (pl.id === myPlayer.id) {
			try {
				// Reset the action
				await dispatch('game/resetAction', {}, { root: true });
			} catch (err) {
				this._vm.$toasted.error(err);
				this._vm.$log.error(err);
			}
		} else {
			this._vm.$toasted.info(`HOARD TAKEN BY: ${pl.name}`);
			dispatch('sound/play', this._vm.$sounds.hoardTaken, { root: true });
		}
	},

	// eslint-disable-next-line
	async delete({}, id) {
		const playerId = id || getters.getMyPlayer.id;

		try {
			await api.players.delete(playerId);
		} catch (err) {
			this._vm.$toasted.error(err);
			this._vm.$log.error(err);
			throw new Error(err);
		}
	},

	discard({ dispatch, getters, state }, payload) {
		this._vm.$log.debug(state, payload);

		const playerId = getters.getMyPlayer.id;
		const cardIds = state[playerId].cardsInHand.map(card => card._id);
		const cardsInHand = difference(cardIds, [payload.card.id]);

		this._vm.$log.debug(cardsInHand);

		const data = { cardsInHand };

		if (!payload.isQuarrel) {
			data.hasStoredCards = true;
		}

		// TODO: Remove once discard is added to PlayerActions in websocket
		dispatch('decks/discard', payload.card, { root: true });

		return dispatch('update', {
			id: playerId,
			data,
		});
	},

	async drawCard({ dispatch, getters }, payload) {
		const playerId = payload.id || getters.getMyPlayer.id;

		try {
			this._vm.$socket.sendObj({
				action: 'drawCard',
				playerId,
			});

			await dispatch('game/update', { isDrawingCard: true }, { root: true });
		} catch (err) {
			this._vm.$log.error(err);
			throw new Error(err);
		}
	},

	/**
	 * Load player data for each player in game
	 * @param  {Array} ids            Array of player IDs
	 *
	 * @return {Object} Promise
	 */
	async load({ dispatch }, { ids }) {
		this._vm.$log.debug('players/load', ids);

		if (isEmpty(ids)) {
			throw new Error('Need at least one player to be loaded!');
		}

		try {
			const res = await api.players.get(ids.join(','));

			this._vm.$log.debug('api/players/get', res);

			return Promise.all(
				res.data.map(async plData => {
					await dispatch('updateLocalPlayer', plData);
				}),
			);
		} catch (err) {
			this._vm.$log.error(err);
			throw new Error(err);
		}
	},

	async nextPlayer({ dispatch, getters }) {
		const activePlayer = getters.getByProp('isActive', true);
		const activePlayerIndex = activePlayer
			? state.ids.indexOf(activePlayer.id)
			: -1;
		const nextPlayerId = getters.getNextPlayer(activePlayerIndex);

		this._vm.$log.debug(
			'nextPlayer()',
			activePlayer,
			activePlayerIndex,
			nextPlayerId,
		);

		if (activePlayerIndex !== -1) {
			try {
				await dispatch('update', {
					id: activePlayer.id,
					data: {
						isActive: false,
						hasDrawnCard: false,
						hasStoredCards: false,
					},
				});
			} catch (err) {
				this._vm.$log.error(err);
				throw new Error(err);
			}
		}

		return dispatch('update', {
			id: nextPlayerId,
			data: {
				isActive: true,
				hasDrawnCard: false,
				hasStoredCards: false,
			},
		});
	},

	async removeHighCard({ dispatch }, player) {
		const cards = player.cardsInHand;
		const highCard = maxBy(cards, card => {
			return card.cardType === 'special' ? -1 : card.amount;
		});

		this._vm.$log.debug('highCard ->', highCard);

		if (!isEmpty(highCard)) {
			this._vm.$toasted.info('You just lost a card!');

			await dispatch('update', {
				id: player.id,
				data: {
					cardsInHand: difference(player.cardsInHand, [highCard.id]),
				},
			});

			return dispatch('decks/discard', highCard, { root: true });
		}
	},

	async resetQuarrel({ dispatch, state }) {
		this._vm.$log.debug('resetQuarrel -> ', state);

		const player = find(Object.values(state), { isQuarrelWinner: true });

		this._vm.$log.debug('player -> ', player);

		if (!player.id) {
			throw new Error(`Unknown winner: ${player}`);
		}

		try {
			await dispatch('update', {
				id: player.id,
				data: {
					isQuarrelWinner: false,
					hasDrawnCard: false,
				},
			});
		} catch (err) {
			this._vm.$log.error(err);
			throw new Error(err);
		}
	},

	async selectQuarrelCard({ dispatch }, data) {
		const wsObj = {
			action: 'quarrel',
			player: data.id,
		};

		// If the player doesn't have any cards, then the 'card' property
		// won't be sent through the websocket, but we still need to send
		// a message so the game is updated properly.
		if (data.card) {
			wsObj.card = data.card;
		}

		await dispatch('update', {
			id: data.id,
			data: {
				selectQuarrelCard: false,
			},
		});

		this._vm.$socket.sendObj(wsObj);
	},

	async setQuarrelWinner({ dispatch, getters }, payload) {
		await dispatch('updateLocalPlayer', {
			id: payload.id,
			isQuarrelWinner: true,
		});

		// Only send call for 'addCards' for player that is receiving them
		if (payload.id === getters.getMyPlayer.id) {
			setTimeout(() => {
				dispatch('addCards', payload);
			}, 1000);
		}
	},

	async startQuarrel({ dispatch, getters, state }, options = {}) {
		const myPlayer = getters.getMyPlayer;
		const players = options.players
			? options.players.map(pl => state[pl.playerId])
			: state.ids.map(id => state[id]);

		this._vm.$log.debug('startQuarrel -> ', players, myPlayer);

		// Player may not be participating in quarrel when other players tied
		if (findIndex(players, { id: myPlayer.id }) === -1) {
			this._vm.$log.info('You are not participating in this Quarrel');

			return;
		}

		// Find all players that have at least 1 card
		const quarrelPlayers = reject(players, { totalCards: 0 });

		this._vm.$log.debug('quarrelPlayers -> ', quarrelPlayers);

		// If no players, or just 1 player, have enough cards for Quarrel
		if (quarrelPlayers.length <= 1) {
			await dispatch('game/quarrelWinner', {}, { root: true });
		} else {
			dispatch('game/setQuarrelCount', quarrelPlayers.length, {
				root: true,
			});

			await dispatch('update', {
				id: myPlayer.id,
				data: {
					selectQuarrelCard: true,
				},
			});
		}
	},

	storeCards({ dispatch, getters }, payload) {
		this._vm.$log.debug('storeCards -> ', payload);

		const currentPlayer = getters.getMyPlayer;
		const cardsInStorage = currentPlayer.cardsInStorage;
		const cardsToStore = payload.cards;
		const cardsToStoreIds = cardsToStore.map(card => card.id);
		const playerCardsIds = currentPlayer.cardsInHand.map(card => card.id);

		const plData = {
			cardsInHand: difference(playerCardsIds, cardsToStoreIds),
			cardsInStorage: concat(cardsInStorage, cardsToStoreIds[0]),
			hasStoredCards: true,
			score: currentPlayer.score + cardsToStore[0].amount,
		};

		this._vm.$log.debug('plData -> ', plData);

		dispatch('sound/play', this._vm.$sounds.storeCards, { root: true });

		return dispatch('update', {
			id: currentPlayer.id,
			data: plData,
		});
	},

	// eslint-disable-next-line
	update({}, payload) {
		this._vm.$log.debug('players/update', payload);

		if (!isString(payload.id)) {
			throw new Error('"payload.id" MUST be a string');
		} else if (isEmpty(payload.data)) {
			throw new Error('Missing "payload.data" for players/update!');
		}

		return api.players.update(payload.id, payload.data);
	},

	updateGame({ dispatch }, payload) {
		if (!payload.id) {
			throw new Error('Missing required "id" property!');
		}

		const playerId = payload.id;
		const gameId = payload.gameId || null;

		return dispatch('update', {
			id: playerId,
			data: {
				gameId,
			},
		});
	},

	async updateLocalPlayer({ commit, state }, payload) {
		this._vm.$log.debug('players/updateLocalPlayer', state, payload);

		if (!payload.id) {
			this._vm.$toasted.info('Did not receive "id" for player!');
			this._vm.$log.info('Missing "id" from payload:', payload);
		}

		commit(mutationTypes.players.UPDATE, payload);

		const playerId = payload.id;
		const $playerStorage = await Vue.$storage.getItem('player');
		const localPlayerId = $playerStorage && $playerStorage.id;

		this._vm.$log.debug('playerMatch?', playerId, localPlayerId);

		if (state[playerId] && playerId === localPlayerId) {
			await Vue.$storage.setItem('player', state[playerId]);

			if (!Object.prototype.hasOwnProperty.call(payload, 'cardsInHand')) {
				// Send async websocket request for 'whoami' to update
				// cardsInHand for local player
				this._vm.$socket.sendObj({ action: 'getMyCards' });
			}
		}
	},
};

const mutations = {
	// This is only used for dealing cards to player, remove when draw card is run on server
	[mutationTypes.players.DRAW_CARD](state, payload) {
		this._vm.$log.debug('players/DRAW_CARD', payload, state);

		if (
			!Object.prototype.hasOwnProperty.call(state[payload.id], 'cardsDrawnIds')
		) {
			Vue.set(state[payload.id], 'cardsDrawnIds', []);
		}

		const myCards = state[payload.id].cardsDrawnIds;

		myCards.push(payload.cardDrawnId);

		Vue.set(state[payload.id], 'cardsDrawnIds', [...myCards]);

		this._vm.$log.debug('cardsDrawn', state[payload.id].cardsDrawnIds);
	},

	[mutationTypes.players.UPDATE](state, payload) {
		const playerId = payload.id;
		const ids = state.ids;

		this._vm.$log.debug('mutation::players/UPDATE', state, payload);

		if (!isString(playerId)) {
			throw new Error('Player ID must be a string!');
		}

		if (!state[playerId]) {
			Vue.set(state, playerId, {});
			ids.push(playerId);
		}

		state.ids = [...ids];

		for (const prop in payload) {
			Vue.set(state[playerId], prop, payload[prop]);
		}
	},

	[mutationTypes.players.UPDATE_CARDS](state, payload) {
		this._vm.$log.debug('mutation::players/UPDATE_CARDS', state, payload);

		const id = payload.id;
		const cards = payload.cardsInHand;

		if (!Object.prototype.hasOwnProperty.call(state[id], 'cardsInHand')) {
			Vue.set(state[id], 'cardsInHand', []);
		}

		Vue.set(state[id], 'cardsInHand', [...cards]);
	},
};

export default {
	namespaced: true,
	state,
	getters,
	actions,
	mutations,
};
