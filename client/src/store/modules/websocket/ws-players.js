const state = {};

const getters = {};

const actions = {
	actioncard_hoard({ dispatch }, data) {
		this._vm.$log.debug(data);

		dispatch('players/collectHoard', data.nuts, { root: true });
	},

	actioncard_quarrel({ dispatch }, data) {
		this._vm.$log.debug(data);

		const quarrelData = {
			playerId: data.playerId,
			card: data.card || null,
		};

		dispatch('game/addQuarrelCard', quarrelData, { root: true });
	},

	create({}, data) {
		this._vm.$log.debug(data);
	},

	getMyCards({ commit }, data) {
		this._vm.$log.debug('wsPlayers/getMyCards', data);

		let id = data.nuts.id;
		let cardsInHand = data.nuts.cardsInHand;

		commit('players/UPDATE_CARDS', { id, cardsInHand }, { root: true });
	},

	reset({}, data) {
		this._vm.$log.debug('ws-players:reset', data);
	},

	showMessage({}, data) {
		this._vm.$toasted.error(data.nuts);
	},

	update({ commit }, data) {
		this._vm.$log.debug('wsPlayers/update', data);
		commit('players/UPDATE', data.nuts, { root: true });
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
