import Vue from 'vue';

import GamesApi from '@/api/GamesApi';
const api = new GamesApi();

const state = {
	id: null,
	actionCard: null,
	createdDate: null,
	instantAction: false,
	isStarted: false,
	roundNumber: 0,
};

const getters = {

};

const actions = {
	load({ commit }) {
		api.get()
			.then(res => {
				Vue.$log.debug(res);
			})
			.catch(err => {
				Vue.$error(err);
			});
	},

	insert({ commit }, data) {

	},

	update({ commit }, data) {

	}
};

const mutations = {

};

export default {
	namespaced: true,
	state,
	getters,
	actions,
	mutations,
};
