const state = {};

const getters = {};

const actions = {
	actioncard_communism({ commit }) {},
	actioncard_quarrel({ commit }) {},
	actioncard_winter({ commit }) {
		dispatch('game/end');
	}
};

const mutations = {};

export default {
	namespaced: true,
	state,
	getters,
	actions,
	mutations
};
