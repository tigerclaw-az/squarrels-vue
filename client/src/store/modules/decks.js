import Vue from 'vue';

import api from '@/api/index';

const state = {
	isLoaded: false,
};

const getters = {

};

const actions = {
	load({ commit, dispatch }, { ids }) {
		Vue.$log.debug('decks/load', ids);
		if (ids.length) {
			api.decks.get(ids.join(','))
				.then(res => {
					Vue.$log.debug('decks/load', res);
					if (res.status === 200) {
						let deckData = res.data;

						deckData.forEach(deck => {
							commit('update', deck);
						});

						commit('loadFinished');
					} else {
						// TODO: Handle deck load error
					}
				})
				.catch(err => {
					Vue.$log.error(err);
				});
		}
	},

	unload({ commit }) {
		commit('unload');
	},
};

const mutations = {
	loadFinished(state) {
		state.isLoaded = true;
	},

	unload(state) {
		Vue.set(state, 'isLoaded', false);

		for (let prop in state) {
			if (typeof state[prop] === 'object') {
				Vue.delete(state, prop);
			}
		}
	},

	update(state, payload) {
		let deckId = payload.id;

		Vue.$log.debug('mutation::decks/update', state, payload);

		if (!state[deckId]) {
			Vue.set(state, deckId, {});
		}

		Vue.set(state, deckId, payload);
	}
};

export default {
	namespaced: true,
	state,
	getters,
	actions,
	mutations,
};
