import vm from 'vue';

const state = {

};

const getters = {

};

const actions = {
	create({ commit }, data) {
		Vue.$log.debug(data);
		// commit('game/insert', data.nuts);
	},

	update({ commit }, data) {
		commit('game/update', data.nuts, { root: true });
	},
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
