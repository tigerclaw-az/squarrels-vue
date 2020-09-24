import Vue from 'vue';
import Vuex from 'vuex';

Vue.use(Vuex);

import api from '@/api';
import modules from '@/store/modules';
import mutationTypes from '@/store/mutation-types';

const state = {
	isAdmin: false,
	isLoggedIn: false,
	localPlayer: {},
};

const actions = {
	init({ commit }) {
		const isAdmin = window.localStorage.getItem('isAdmin');

		this._vm.$log.debug('store/init', isAdmin);

		commit(mutationTypes.root.SET_CONFIG, {
			isAdmin,
		});
	},

	async checkLogin({ commit, state }) {
		const player = await Vue.$storage.getItem('player');
		const localPlayer = state.localPlayer;

		this._vm.$log.debug('checkLogin', player, localPlayer);

		if (!player) {
			throw new Error('User not logged in');
		}

		if (localPlayer.id) {
			commit(mutationTypes.root.LOGIN, player);

			return localPlayer;
		}

		try {
			const data = await api.players.get(player.id);
			const pl = data[0];

			commit(mutationTypes.root.LOGIN, pl);

			return pl;
		} catch (err) {
			await Vue.$storage.removeItem('player');
			this._vm.$toasted.error(err);
			throw new Error('USER NOT FOUND', err);
		}
	},
};

const mutations = {
	[mutationTypes.root.LOGIN](state, player) {
		state.isLoggedIn = true;
		state.localPlayer = player;
		Vue.$storage.setItem('player', player);
	},
	[mutationTypes.root.SET_CONFIG](state, config) {
		state.isAdmin = config.isAdmin;
	},
};

export default new Vuex.Store({
	strict: process.env.VUE_APP_STRICT || false,
	modules,
	state: state,
	actions,
	mutations,
});
