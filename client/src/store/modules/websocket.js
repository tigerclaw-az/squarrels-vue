import Vue from 'vue';
import router from '@/router';

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
		Vue.$log.debug(state, event);
		state.socket.isConnected = true;
	},
	SOCKET_ONCLOSE(state, event) {
		Vue.$log.debug(state, event);
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
		Vue.$log.debug(state, count);
	},
};

export default {
	// Can't use namespace until Issue is fixed: https://github.com/nathantsoi/vue-native-websocket/issues/40
	// namespaced: true,
	state,
	getters,
	actions,
	mutations,
};
