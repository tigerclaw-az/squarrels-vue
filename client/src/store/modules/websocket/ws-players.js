const state = {

};

const getters = {

};

const actions = {
	create({ commit }, data) {
		this._vm.$log.debug(data);
	},

	update({ commit }, data) {
		this._vm.$log.debug('wsPlayers/update', data);
		commit('players/UPDATE', data.nuts, { root: true });
	},

	getMyCards({ commit }, data) {
		this._vm.$log.debug('wsPlayers/getMyCards', data);

		let id = data.nuts.id;
		let cardsInHand = data.nuts.cardsInHand;
		commit('players/UPDATE_CARDS', { id, cardsInHand }, { root: true });
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
