import Vue from 'vue';
import router from '@/router';

import _ from 'lodash';

import api from '@/api/index';

const initialState = {
	actionCard: null,
	createdAt: null,
	decks: [],
	id: null,
	instantAction: false,
	isLoaded: false,
	isStarted: false,
	players: [],
	roundNumber: 1,
	updatedAt: null,
};

const state = Object.assign({}, initialState);

const getters = {
	isPlayerInGame: (state) => (id) => {
		return state.players.filter(pl => pl.id === id).length;
	},
};

const actions = {
	addPlayer({ commit, dispatch, state }, { gameId, playerId }) {
		let newPlayers = _.union(playerId, [...state.players, playerId]);

		Vue.$log.debug('game/addPlayer', gameId, playerId, newPlayers);

		if (newPlayers.length) {
			api.games.updatePlayers(gameId, newPlayers)
				.then(res => {
					Vue.$log.debug('addPlayer()', res);
					let gameData = res.data;

					this._vm.$toasted.show('Player joined!');

					commit('UPDATE', gameData);
				})
				.catch(err => {
					Vue.$log.error(err);
				});
		}
	},

	load({ commit, dispatch }, { id }) {
		return api.games.get(id)
			.then(res => {
				Vue.$log.debug('game/load', res);
				if (res.status === 200) {
					let gameData = res.data[0];

					commit('UPDATE', gameData);
					commit('LOADED');

					// Add all players to the current state of game
					if (gameData.players.length) {
						dispatch('players/add', gameData.players, { root: true });
					}
				} else {
					router.push('/');
				}
			})
			.catch(err => {
				Vue.$log.error(err);
			});
	},

	start({ commit, state }) {
		api.games
			.start(state.id, state.players)
			.then(data => {

			})
			.catch(err => {
				this._vm.$log.error(err);
			});
	},

	unload({ commit, rootState }) {
		let players = state.players;
		let updatedPlayers = _.without(players, rootState.localPlayer.id);

		api.games
			.updatePlayers(state.id, updatedPlayers)
			.then(() => {
				commit('INIT');
			})
			.catch(err => {
				this._vm.$log.error(err);
			});
	},

	update({ commit }, data) {

	},
};

const mutations = {
	LOADED(state) {
		Vue.set(state, 'isLoaded', true);
	},

	INIT(state) {
		for (let prop in initialState) {
			Vue.set(state, prop, initialState[prop]);
		}

		Vue.set(state, 'isLoaded', false);
	},

	UPDATE(state, payload) {
		Vue.$log.debug('mutation::game/update', state, payload);

		if (payload) {
			for (let prop in state) {
				if (payload.hasOwnProperty(prop)) {
					Vue.set(state, prop, payload[prop]);
				}
			}
		}
	},
};

export default {
	namespaced: true,
	state,
	getters,
	actions,
	mutations,
};
