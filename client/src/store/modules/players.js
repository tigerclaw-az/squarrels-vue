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

};

const actions = {
	insert({ commit }, data) {
		commit('insert', data);
	},
	create({ commit }, data) {
		let plData = Object.assign({}, plDefault, data);

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
