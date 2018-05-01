import Vue from 'vue';
import _ from 'lodash';

import api from '@/api/index';

const state = {
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

const getters = {
	isPlayerInGame: (state) => (id) => {
		return state.players.filter(pl => pl.id === id).length;
	},
};

const actions = {
	addPlayer({ commit, dispatch, state }, { gameId, playerId }) {
		let newPlayers = _.union(playerId, state.players);

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
					// TODO: Handle game not found logic
				}
			})
			.catch(err => {
				Vue.$log.error(err);
			});
	},

	update({ commit }, data) {

	},
};

const mutations = {
	loadFinished(state) {
		state.isLoaded = true;
	},

	update(state, payload) {
		Vue.$log.debug(state, payload);

		if (payload) {
			for (let prop of Object.keys(state)) {
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
