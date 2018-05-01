import Vue from 'vue';

import api from '@/api/index';

const state = {
};

const getters = {

};

const actions = {
	load({ commit, dispatch }, { ids }) {
		Vue.$log.debug('decks/load', ids);
		if (ids.length) {
			api.decks.get(ids.split(','))
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
};

const mutations = {
	update({ state }, payload) {
		let deckId = payload.id;

		if (!state[deckId]) {
			Vue.set(state, deckId, {});
		}

		Vue.set(state, deckId, payload);
	}
};

export default {
	state,
	getters,
	actions,
	mutations,
};
