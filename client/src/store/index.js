import Vue from 'vue';
import Vuex from 'vuex';

Vue.use(Vuex);

import api from '@/api/index';
import decks from '@/store/modules/decks';
import game from '@/store/modules/game';
import players from '@/store/modules/players';
import sound from '@/store/modules/sound';
import start from '@/store/modules/start';
import websocket from '@/store/modules/websocket';

const modules = {
	decks,
	game,
	players,
	sound,
	start,
	websocket,
};

const state = {
	isAdmin: false,
	isLoggedIn: false,
	localPlayer: {},
};

const actions = {
	init({ commit }) {
		const isAdmin = window.localStorage.getItem('isAdmin');

		this._vm.$log.debug('store/init', isAdmin);

		commit('SET_CONFIG', {
			isAdmin,
		});
	},

	checkLogin({ commit, state }) {
		return new Promise(async (resolve, reject) => {
			const player = await Vue.$storage.getItem('player');
			const localPlayer = state.localPlayer;

			this._vm.$log.debug('checkLogin', player, localPlayer);

			if (player) {
				if (localPlayer.id) {
					commit('LOGIN', player);
					resolve(localPlayer);
				} else {
					api.players
						.get(player.id)
						.then(async res => {
							if (res.status !== 200) {
								this._vm.$toasted.error('USER NOT FOUND');
								await Vue.$storage.removeItem('player');
								reject('USER NOT FOUND');

								return false;
							}

							let pl = res.data[0];

							commit('LOGIN', pl);
							resolve(pl);
						})
						.catch(err => {
							this._vm.$toasted.error(err);
							reject('Unable to find player', err);
						});
				}
			} else {
				reject('User not logged in');
			}
		});
	},
};

const mutations = {
	LOGIN(state, player) {
		state.isLoggedIn = true;
		state.localPlayer = player;
		Vue.$storage.setItem('player', player);
	},
	SET_CONFIG(state, config) {
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
