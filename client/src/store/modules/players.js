import Vue from 'vue';
import utils from '@/utils';
import _ from 'lodash';

import api from '@/api/index';

const plDefault = {
	name: utils.getRandomStr(12)
};

const state = {
};

const getters = {
	get: (state) => (prop, value, index = false, all = false) => {
		Vue.$log.debug('get()', prop, value, index);

		let method = index ? 'findIndex' : all ? 'filter' : 'find';

		if (prop) {
			if (value) {
				return _[method](state.players, function(o) {
					return o[prop] === value;
				});
			}

			// If a 'value' wasn't given, then we're just looking for the player
			// where the supplied 'prop' is !null/undefined
			return _[method](state.players, prop);
		}

		return state.players;
	}
};

const actions = {
	add({ commit }, plArr) {
		Vue.$log.debug('add()', plArr);

		if (plArr.length) {
			return api.players.get(plArr.join(','))
				.then(res => {
					if (res.status === 200) {
						commit('update', res.data[0]);
					}
				})
				.catch(err => {
					Vue.$log.error(err);
				});
		}
	},

	create({ commit }, plObj) {
		let plData = Object.assign({}, plDefault, plObj);

		return api.players.create(plData)
			.then(res => {
				Vue.$storage.set('player', res.data);
				commit('update', res.data);
			})
			.catch(err => {
			})
	},

	/**
	 * Load player data for each player in game
	 * @param  {Array} ids            Array of player IDs
	 * @return {Promise}
	 */
	load({ commit }, { ids }) {
		Vue.$log.debug('players/load', ids);
		if (ids.length) {
			return api.players.get(ids.join(','))
				.then(res => {
					Vue.$log.debug('api/players/get', res);
					if (res.status === 200) {
						res.data.forEach(plData => {
							commit('update', plData);
						})
					}
				})
				.catch(err => {
					Vue.$log.error(err);
				});
		}
	},

	update({ commit }, id, data) {

	},
};

const mutations = {
	update(state, payload) {
		let playerId = payload.id;

		if (!state[playerId]) {
			Vue.set(state, playerId, {});
		}

		Vue.set(state, playerId, payload);
	},
};

export default {
	namespaced: true,
	state,
	getters,
	actions,
	mutations,
};
