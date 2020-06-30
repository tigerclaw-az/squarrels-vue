import Vue from 'vue';
import router from '@/routes';

import wsDecks from '@/store/modules/websocket/wsDecks';
import wsGame from '@/store/modules/websocket/wsGame';
import wsPlayers from '@/store/modules/websocket/wsPlayers';

const state = {
	socket: {
		isConnected: false,
		isOpen: false,
		message: '',
		reconnectError: false,
	},
};

const getters = {
	isConnected: state => {
		return state.socket.isConnected;
	},
};

const actions = {};

const mutations = {
	SOCKET_ONOPEN(state, event) {
		Vue.$log.info(state, event);
		state.socket.isConnected = true;
		state.socket.isOpen = true;
	},
	SOCKET_ONCLOSE(state, event) {
		Vue.$log.info(state, event);

		if (router.currentRoute.path !== '/offline') {
			router.push('/offline');
		}

		state.socket.isConnected = false;
		state.socket.isOpen = false;
	},
	SOCKET_ONERROR(state, event) {
		if (state.socket.isOpen) {
			// Only display error if the error wasn't from socket close
			Vue.$log.error(state, event);
		}

		if (router.currentRoute.path !== '/offline') {
			router.push('/offline');
		}
	},
	SOCKET_ONMESSAGE(state, message) {
		Vue.$log.debug(state, message);
		state.message = message;
	},
	// mutations for reconnect methods
	SOCKET_RECONNECT(state, count) {
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
