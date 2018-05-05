import Vue from 'vue';
import router from '@/router';

import wsDecks from '@/store/modules/websocket/ws-decks';
import wsGame from '@/store/modules/websocket/ws-game';
import wsPlayers from '@/store/modules/websocket/ws-players';

const state = {
	socket: {
		isConnected: false,
		message: '',
		reconnectError: false,
	}
};

const getters = {
	isConnected: (state) => {
		return state.socket.isConnected;
	}
};

const actions = {

};

const mutations = {
	SOCKET_ONOPEN(state, event) {
		Vue.$log.info(state, event);
		state.socket.isConnected = true;
	},
	SOCKET_ONCLOSE(state, event) {
		Vue.$log.info(state, event);
		router.push('/');
		state.socket.isConnected = false;
	},
	SOCKET_ONERROR(state, event) {
		Vue.$log.error(state, event);
	},
	SOCKET_ONMESSAGE(state, message) {
		Vue.$log.debug(state, message);
		state.message = message;
	},
	// mutations for reconnect methods
	SOCKET_RECONNECT(state, count) {
		state.socket.isConnected = true;
		Vue.$log.info(state, count);
	},
	// mutations for reconnect methods
	SOCKET_RECONNECT_ERROR(state, count) {
		Vue.$log.error(state, count);
	},
};

export default {
	// Can't use namespace until Issue is fixed: https://github.com/nathantsoi/vue-native-websocket/issues/40
	// namespaced: true,
	modules: {
		wsDecks,
		wsGame,
		wsPlayers,
	},
	state,
	getters,
	actions,
	mutations,
};
