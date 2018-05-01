import Vue from 'vue';
import Vuex from 'vuex';

Vue.use(Vuex);

// import api from '@/store/modules/api/api';
import decks from '@/store/modules/decks';
import game from '@/store/modules/game';
import players from '@/store/modules/players';
import sound from '@/store/modules/sound';
import websocket from '@/store/modules/websocket';

export default new Vuex.Store({
	strict: process.env.VUE_APP_STRICT || false,
	modules: {
		// api,
		decks,
		game,
		players,
		sound,
		websocket
	},
	state: {
		isAdmin: false,
		isLoggedIn: false,
		localPlayer: {},
	},
	actions: {
		init({ commit }) {
			commit('SET_CONFIG', {
				isAdmin: Vue.$storage.get('isAdmin') || false
			});
		},

		checkLogin({ commit }) {
			return new Promise((resolve, reject) => {
				let player = Vue.$storage.get('player');
				if (player) {
					resolve(player);
					commit('LOGIN', player);
				} else {
					reject('User not logged in');
				}
			});
		}
	},
	mutations: {
		LOGIN(state, player) {
			state.isLoggedIn = true;
			state.localPlayer = player;
		},
		SET_CONFIG(state, config) {
			state.isAdmin = config.isAdmin;
		},
	},
});
