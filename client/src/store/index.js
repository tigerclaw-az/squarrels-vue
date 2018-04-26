import Vue from 'vue';
import Vuex from 'vuex';

Vue.use(Vuex);

// import api from '@/store/modules/api/api';
import deck from '@/store/modules/deck';
import game from '@/store/modules/game';
import players from '@/store/modules/players';
import sound from '@/store/modules/sound';
import websocket from '@/store/modules/websocket';

export default new Vuex.Store({
	modules: {
		// api,
		deck,
		game,
		players,
		sound,
		websocket
	},
	state: {
		isAdmin: false,
	},
	actions: {
		init({ commit }) {
			commit('SET_CONFIG', {
				isAdmin: Vue.$storage.get('isAdmin') || false
			});
		}
	},
	mutations: {
		SET_CONFIG(state, config) {
			state.isAdmin = config.isAdmin;
		}
	},
});
