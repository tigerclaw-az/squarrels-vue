import Vue from 'vue';
import utils from '@/utils';
import _ from 'lodash';

import api from '@/api/index';

const plDefault = {
	name: utils.getRandomStr(12)
};

const state = {};

const getters = {
	getById: state => id => {},

	getByProp: state => (prop, value, index = false, all = false) => {
		this._vm.$log.debug('get()', prop, value, index);

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
	}
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

	update({ commit }, data) {
		this._vm.$log.debug('players/update', data);
	}
};

const mutations = {
	UPDATE(state, payload) {
		let playerId = payload.id,
			localPlayerId = Vue.$storage.get('player').id;

		this._vm.$log.debug('mutation::players/UPDATE', state, payload);

		if (playerId) {
			if (!state[playerId]) {
				Vue.set(state, playerId, {});
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
	}
};

export default {
	namespaced: true,
	state,
	getters,
	actions,
	mutations
};
