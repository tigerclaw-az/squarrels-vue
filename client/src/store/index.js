import Vue from 'vue';
import Vuex from 'vuex';

Vue.use(Vuex);

import api from '@/store/modules/api/api';
import game from '@/store/modules/game';
import websocket from '@/store/modules/websocket';

export default new Vuex.Store({
	modules: {
		api,
		game,
		websocket
	},
	state: {
		isAdmin: false,
	},
	mutations: {

	},
	actions: {

	},
});
