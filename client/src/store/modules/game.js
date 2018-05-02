import Vue from 'vue';
import router from '@/router';

import _ from 'lodash';

import api from '@/api/index';

const initialState = {
	actionCard: null,
	createdAt: null,
	decks: [],
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

					commit('update', gameData);
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

					commit('update', gameData);
					commit('loadFinished');

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

	unload({ commit }) {
		commit('unload');
	},

	update({ commit }, data) {

	},
};

const mutations = {
	loadFinished(state) {
		Vue.set(state, 'isLoaded', true);
	},

	unload(state) {
		for (let prop in initialState) {
			Vue.set(state, prop, initialState[prop]);
		}

		Vue.set(state, 'isLoaded', false);
	},

	update(state, payload) {
		Vue.$log.debug('mutation::game/update', state, payload);

		if (payload) {
			for (let prop in state) {
				if (payload.hasOwnProperty(prop)) {
					Vue.set(state, prop, payload[prop]);
				}
			}
		}

		Vue.$log.debug('mutation::UPDATED', state);
	},
};

export default {
	namespaced: true,
	state,
	getters,
	actions,
	mutations,
};
