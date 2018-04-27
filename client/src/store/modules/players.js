import Vue from 'vue';
import utils from '@/utils';

import PlayersApi from '@/api/PlayersApi';
const api = new PlayersApi();
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
		let plData = Object.assign({}, plDefault, data);

		return api.create(plData)
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
