import Vue from 'vue';
import utils from '@/utils';
import _ from 'lodash';

import api from '@/api/index';

const plDefault = {
	name: utils.getRandomStr(12),
};

const state = {
	ids: [],
};

const getters = {
	getById: state => id => {},

	getByProp: state => (prop, value, options = {}) => {
		let index = options.index || false;
		let all = options.all || false;

		Vue.$log.debug('get()', prop, value, index);

		let method = index ? 'findIndex' : all ? 'filter' : 'find';

		if (prop) {
			if (value) {
				return _[method](state, function(o) {
					return o[prop] === value;
				});
			}

			// If a 'value' wasn't given, then we're just looking for the player
			// where the supplied 'prop' is !null/undefined
			return _[method](state, prop);
		}

		return state;
	},

	getMyPlayer: (state, getters, rootState) => {
		Vue.$log.debug('getMyPlayer()', state, rootState);

		for (let id in state) {
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
			return _.sample(state.ids);
		} else if (activeIndex === state.ids.length - 1) {
			// Reset active player to first player
			activeIndex = 0;
		} else {
			activeIndex++;
		}

		return state.ids[activeIndex];
	},
};

const actions = {
	add({ commit }, plArr) {
		this._vm.$log.debug('add()', plArr);

		if (plArr.length) {
			return api.players
				.get(plArr.join(','))
				.then(res => {
					if (res.status === 200) {
						commit('UPDATE', res.data[0]);
					}
				})
				.catch(err => {
					this._vm.$log.error(err);
				});
		}
	},

	create({ commit }, plObj) {
		let plData = Object.assign({}, plDefault, plObj);

		return new Promise((resolve, reject) => {
			return api.players
				.create(plData)
				.then(res => {
					commit('LOGIN', res.data, { root: true });
					commit('UPDATE', res.data);
					resolve();
				})
				.catch(err => {
					this._vm.$log.error(err);
					reject(err);
				});
		});
	},

	/**
	 * Load player data for each player in game
	 * @param  {Array} ids            Array of player IDs
	 *
	 * @return {Object} Promise
	 */
	load({ commit }, { ids }) {
		this._vm.$log.debug('players/load', ids);

		if (ids.length) {
			return api.players
				.get(ids.join(','))
				.then(res => {
					this._vm.$log.debug('api/players/get', res);
					if (res.status === 200) {
						res.data.forEach(plData => {
							commit('UPDATE', plData);
						});
					}
				})
				.catch(err => {
					this._vm.$log.error(err);
				});
		}
	},

	nextPlayer({ getters }) {
		const activePlayer = getters.getByProp('isActive', true);
		const activePlayerIndex = activePlayer
			? state.ids.indexOf(activePlayer.id)
			: -1;
		const nextPlayerId = getters.getNextPlayer(activePlayerIndex);

		this._vm.$log.debug(
			'nextPlayer()',
			activePlayer,
			activePlayerIndex,
			nextPlayerId
		);

		if (activePlayerIndex !== -1) {
			api.players
				.update(activePlayer.id, { isActive: false })
				.then(res => {
					// Merge data with existing object of player
					if (res.status === 200) {
						// this.update(res.data.id, res.data);
					}
				})
				.catch(err => {
					this.$log.error(err);
				});
		}

		api.players.update(nextPlayerId, { isActive: true, isFirstTurn: true });
	},

	update({ commit }, data) {
		this._vm.$log.debug('players/update', data);
	},
};

const mutations = {
	UPDATE(state, payload) {
		let playerId = payload.id,
			localPlayerId = Vue.$storage.get('player').id;

		this._vm.$log.debug('mutation::players/UPDATE', state, payload);

		if (playerId) {
			if (!state[playerId]) {
				Vue.set(state, playerId, {});
				state.ids.push(playerId);
			}

			for (let prop in payload) {
				Vue.set(state[playerId], prop, payload[prop]);
			}

			if (playerId === localPlayerId) {
				this._vm.$storage.set('player', state[playerId]);
				// Send async websocket request for 'whoami' to update
				// cardsInHand for local player
				this._vm.$socket.sendObj({ action: 'getMyCards' });
			}
		}
	},

	UPDATE_CARDS(state, payload) {
		const id = payload.id;
		const cards = payload.cardsInHand;

		Vue.set(state[id], 'cardsInHand', cards);
	},

	DRAW_CARD(state, payload) {
		this._vm.$log.debug('players/DRAW_CARD', payload, state);

		if (!state[payload.id].cardsDrawnCount) {
			Vue.set(state[payload.id], 'cardsDrawnCount', 0);
		}

		if (!state[payload.id].cardsDrawnIds) {
			Vue.set(state[payload.id], 'cardsDrawnIds', []);
		}

		this._vm.$log.debug('players/DRAW_CARD2', payload, state);

		state[payload.id].cardsDrawnIds.push(payload.cardDrawnId);
		state[payload.id].cardsDrawnCount += 1;
	},
};

export default {
	namespaced: true,
	state,
	getters,
	actions,
	mutations,
};
