const state = {

};

const getters = {

};

const actions = {
	create({ commit }, data) {
		this._vm.$log.debug(data);
	},

	update({ commit }, data) {
		commit('players/UPDATE', data, { root: true });
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
