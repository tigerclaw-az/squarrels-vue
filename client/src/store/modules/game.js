import Vue from 'vue';
import router from '@/router';

import _ from 'lodash';

import api from '@/api/index';

const initialState = {
	actionCard: null,
	createdAt: null,
	deckIds: [],
	id: null,
	instantAction: false,
	isLoaded: false,
	isStarted: false,
	playerIds: [],
	roundNumber: 1,
	updatedAt: null,
};

const state = Object.assign({}, initialState);

const getters = {
	isPlayerInGame: (state) => (id) => {
		return state.playerIds.filter(pl => pl.id === id).length;
	},
};

const actions = {
	addPlayer({ commit, dispatch, state }, { gameId, playerId }) {
		let newPlayers = _.union(playerId, [...state.playerIds, playerId]);

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
					let gameData = res.data[0],
						playersInGame = gameData.playerIds;

					commit('UPDATE', gameData);
					commit('LOADED');

					// Add all players to the current state of game
					if (playersInGame.length) {
						dispatch('players/add', playersInGame, { root: true });
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
			.start(state.id, state.playerIds)
			.then(data => {

			})
			.catch(err => {
				this._vm.$log.error(err);
			});
	},

	/**
	 * Unload the current local game state, this will
	 * only affect current player. Since the player is
	 * being removed, we need to add their cards back into
	 * the main deck.
	 *
	 * @returns {Object} 	Promise
	 */
	unload({ commit, rootState }) {
		const playerIds = state.playerIds;
		const updatedPlayerIds = _.without(playerIds, rootState.localPlayer.id);

		api.games
			.updatePlayers(state.id, updatedPlayerIds)
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
