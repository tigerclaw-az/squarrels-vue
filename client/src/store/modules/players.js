import Vue from 'vue';
import utils from '@/utils';
import _ from 'lodash';

import api from '@/api/index';

const plDefault = {
	name: utils.getRandomStr(12)
};

const state = {
	players: {}
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
						commit('insert', res.data[0]);
					}
				})
				.catch(err => {
					Vue.$log.error(err);
				});
		}
	},

	insert({ commit }, plObj) {
		commit('insert', plObj);
	},

	create({ commit }, plObj) {
		let plData = Object.assign({}, plDefault, plObj);

		return api.players.create(plData)
			.then(res => {
				Vue.$storage.set('player', res.data);
				commit('insert', res.data);
			})
			.catch(err => {
			})
	},

	update({ commit }, id, data) {

	},
};

const mutations = {
	insert(state, payload) {
		Vue.set(state.players, payload.id, {});
		Vue.set(state.players, payload.id, payload);
	},
};

export default {
	namespaced: true,
	state,
	getters,
	actions,
	mutations,
};
