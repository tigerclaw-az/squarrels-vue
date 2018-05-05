import Vue from 'vue';

import api from '@/api/index';

const state = {
	isLoaded: false,
};

const getters = {

};

const actions = {
	dealCards({ commit, state }) {

	},

	load({ commit, dispatch }, { ids }) {
		this._vm.$log.debug('decks/load', ids);
		if (ids.length) {
			api.decks.get(ids.join(','))
				.then(res => {
					this._vm.$log.debug('decks/load', res);
					if (res.status === 200) {
						let deckData = res.data;

						deckData.forEach(deck => {
							commit('UPDATE', deck);
						});

						commit('LOADED');
					} else {
						// TODO: Handle deck load error
						this._vm.$log.error(res);
					}
				})
				.catch(err => {
					this._vm.$log.error(err);
				});
		}
	},

	unload({ commit }) {
		commit('INIT');
	},
};

const mutations = {
	LOADED(state) {
		state.isLoaded = true;
	},

	INIT(state) {
		Vue.set(state, 'isLoaded', false);

		for (let prop in state) {
			if (typeof state[prop] === 'object') {
				Vue.delete(state, prop);
			}
		}
	},

	UPDATE(state, payload) {
		let deckId = payload.id;

		this._vm.$log.debug('mutation::decks/update', state, payload);

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
