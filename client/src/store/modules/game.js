import Vue from 'vue';

import api from '@/api/index';

const state = {
	actionCard: null,
	createdAt: null,
	decks: [],
	instantAction: false,
	isStarted: false,
	players: [],
	roundNumber: 1,
	updatedAt: null,
};

const getters = {

};

const actions = {
	load({ commit, dispatch }, { id }) {
		return api.games.get(id)
			.then(res => {
				Vue.$log.debug(res);
				if (res.status === 200) {
					let gameData = res.data[0];
					commit('insert', gameData);

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
	insert(state, data) {
		Vue.$log.debug(state, data);
		for (let prop of Object.keys(state)) {
			if (data.hasOwnProperty(prop)) {
				state[prop] = data[prop];
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
