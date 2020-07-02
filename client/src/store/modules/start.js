import { filter } from 'lodash';

import api from '@/api/index';
import mutationTypes from '@/store/mutation-types';

const state = {
	games: [],
	waitCreateGame: false,
	waitDeleteGame: false,
	waitLoadGames: false,
};

const getters = {};

const actions = {
	createGame({ commit }, playerId) {
		commit(mutationTypes.start.GAME_CREATE, { wait: true });

		api.games
			.create(playerId)
			.then(res => {
				const game = res.data;

				this._vm.$log.debug('start/createGame', this, game);

				commit(mutationTypes.start.GAME_CREATE, { wait: false });
				// Websocket will trigger 'wsGame/create'
			})
			.catch(err => {
				commit(mutationTypes.start.GAME_CREATE, { wait: false });
				this._vm.$log.error(err);
			});
	},

	deleteGame({ commit }, id) {
		commit(mutationTypes.start.GAME_DELETE, { wait: true });

		api.games
			.delete(id)
			.then(() => {
				// Websocket will trigger 'wsGame/delete'
				commit(mutationTypes.start.GAME_DELETE, { wait: false });
			})
			.catch(err => {
				// commit('GAME_DELETE', { wait: false });
				this._vm.$log.error(err);
			});
	},

	loadGames({ commit }) {
		commit(mutationTypes.start.GAMES_LOAD, { wait: true });

		commit(mutationTypes.start.GAMES_CLEAR);

		api.games
			.get()
			.then(res => {
				if (res.status === 200) {
					const gamesData = res.data;

					this._vm.$log.debug('start/loadGames', gamesData);

					commit(mutationTypes.start.GAMES_LOAD, { wait: false });

					for (const game of gamesData) {
						commit(mutationTypes.start.ADD_GAME, game);
					}
				}
			})
			.catch(err => {
				commit(mutationTypes.start.GAMES_LOAD, { wait: false });
				this._vm.$log.error(err);
			});
	},
};

const mutations = {
	[mutationTypes.start.ADD_GAME](state, nuts) {
		state.games.push(nuts);
	},
	// Comes from websocket/wsGame (ws-game.js)
	[mutationTypes.start.DELETE_GAME](state, id) {
		state.games = filter(state.games, g => g.id !== id);
	},
	[mutationTypes.start.GAME_CREATE](state, payload) {
		state.waitCreateGame = payload.wait;
	},
	[mutationTypes.start.GAME_DELETE](state, payload) {
		state.waitDeleteGame = payload;
	},
	[mutationTypes.start.GAMES_CLEAR](state) {
		state.games = [];
	},
	[mutationTypes.start.GAMES_LOAD](state) {
		state.waitLoadGames = false;
	},
};

export default {
	namespaced: true,
	state,
	getters,
	actions,
	mutations,
};
