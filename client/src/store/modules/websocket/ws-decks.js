import _ from 'lodash';

const state = {};

const getters = {};

const actions = {
	actioncard_communism({ commit }) {},
	actioncard_quarrel({ commit }) {},
	actioncard_winter({ commit }) {
		dispatch('game/end');
	},
	update({ commit }, data) {
		if (data.nuts && !_.isEmpty(data.nuts)) {
			commit('decks/UPDATE', data.nuts, { root: true });
		}
	},
};

const mutations = {};

export default {
	namespaced: true,
	state,
	getters,
	actions,
	mutations,
};
