import Vue from 'vue';
import router from '@/router';

// import EventBus from '@/EventBus';

const state = {

};

const getters = {

};

const actions = {
	create({ commit }, data) {
		Vue.$log.debug(this, this._vm, data);
		// EventBus.$emit('game:create', data.nuts);
		commit('start/ADD_GAME', data.nuts, { root: true });
	},

	delete({ commit }, data) {
		Vue.$log.debug(this, this._vm, data);
		// EventBus.$emit('game:delete', data.id);
		commit('start/DELETE_GAME', data.id, { root: true });
	},

	update({ commit }, data) {
		let curRoute = router.currentRoute;
		let nuts = data.nuts;

		// Only perform an update action if the player is on the proper route
		if (curRoute.name === 'game' && curRoute.params.id === nuts.id) {
			commit('game/update', data.nuts, { root: true });
		}
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
