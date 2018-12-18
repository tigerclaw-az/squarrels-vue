import { isEmpty } from 'lodash';

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

	// eslint-disable-next-line
	create({}, data) {
		this._vm.$log.debug(data);
	},

	getMyCards({ commit }, data) {
		this._vm.$log.debug('wsPlayers/getMyCards', data);

		const id = data.nuts.id;
		const cardsInHand = data.nuts.cardsInHand;

		commit('players/UPDATE_CARDS', { id, cardsInHand }, { root: true });
	},

	// eslint-disable-next-line
	reset({}, data) {
		this._vm.$log.debug('ws-players:reset', data);
	},

	// eslint-disable-next-line
	showMessage({}, data) {
		this._vm.$toasted.error(data.nuts);
	},

	update({ dispatch }, data) {
		this._vm.$log.debug('wsPlayers/update', data);

		if (!isEmpty(data.nuts)) {
			dispatch('players/updateLocalPlayer', data.nuts, { root: true });
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
