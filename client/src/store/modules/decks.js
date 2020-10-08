import Vue from 'vue';
import { find, isArray, isEmpty } from 'lodash';

import api from '@/api/index';
import { config } from '@/config';
import mutationTypes from '@/store/mutation-types';

const state = {
	isCardDrawn: false,
	isLoaded: false,
	isShuffled: false,
	ids: [],
};

const getters = {
	getById: state => id => {
		return state[id];
	},

	getByType: state => name => {
		return find(state, { deckType: name });
	},

	getCardIds: state => deckId => {
		return state[deckId].cards.map(card => {
			return card.id;
		});
	},
};

const actions = {
	dealCards({ commit, dispatch }, playerIds) {
		this._vm.$log.debug('decks/dealCards', playerIds);

		const drawCardOptions = { filter: { cardType: 'number' } };

		// Loop through each player and deal cards
		// Each deal will be saved as a Promise so we can wait
		// for all players to be dealt cards before starting game
		let i = 0;

		return [...Array(config.MAX_CARDS)].reduce(async promise => {
			try {
				await promise;

				this._vm.$log.debug('decks/dealCards :: ', i);
				i++;

				return Array.from(playerIds).reduce(async(plPromise, id) => {
					try {
						await plPromise;

						await dispatch('game/update', { isDrawingCard: true }, { root: true });
						const cardDrawn = await dispatch('drawCard', drawCardOptions);

						this._vm.$log.debug('decks/dealCards:cardDrawn :: ', cardDrawn, id);

						await dispatch('game/update', { isDrawingCard: false }, { root: true });
						commit(mutationTypes.decks.CARD_DRAWN, false);

						return dispatch(
							'players/addCards',
							{ id, cards: [cardDrawn] },
							{ root: true },
						);
					} catch (err) {
						this._vm.$log.error(err);
						throw new Error(err);
					}
				}, Promise.resolve());
			} catch (e) {
				this._vm.$log.error(e);
				throw new Error(e);
			}
		}, Promise.resolve());
	},

	cardsShuffled({ commit }) {
		commit(mutationTypes.decks.CARDS_SHUFFLED, true);
	},

	discard({ getters }, card) {
		this._vm.$socket.sendObj({
			action: 'discard',
			namespace: 'decks',
			payload: {
				deckId: getters.getByType('hoard').id,
				cardId: card.id,
			},
		});
	},

	async drawCard({ commit, dispatch, getters }, options = {}) {
		const mainDeck = getters.getByType('main');

		this._vm.$log.debug('decks/drawCard -> ', options, mainDeck);

		await dispatch('sound/play', this._vm.$sounds.drawCard, { root: true });

		commit(mutationTypes.decks.CARD_DRAWN, true);

		try {
			const data = await api.decks.drawCard(mainDeck.id, options);

			if (data.card) {
				return data.card;
			}

			throw new Error('No card returned!');
		} catch (e) {
			commit(mutationTypes.decks.CARD_DRAWN, false);
			this._vm.$log.error(e);
			throw new Error(e);
		}
	},

	async load({ commit }, { ids }) {
		this._vm.$log.debug('decks/load', ids);

		if (isEmpty(ids)) {
			return Promise.reject('ERROR: No ids provided for "decks/load"');
		}

		try {
			const data = await api.decks.get(ids.join(','));
			const decks = data;

			decks.forEach(deck => {
				commit(mutationTypes.decks.UPDATE, deck);
			});

			commit(mutationTypes.decks.LOADED);

			return decks;
		} catch (err) {
			this._vm.$log.error(err);
			this._vm.$toasted.error(err);
			throw new Error(err);
		}
	},

	async remove({ dispatch }, ids) {
		await dispatch('unload');

		return api.decks.delete(ids.join(','));
	},

	unload({ commit }) {
		this._vm.$log.debug('decks/unload');

		commit(mutationTypes.decks.INIT);
	},
};

const mutations = {
	[mutationTypes.decks.CARD_DRAWN](state, val) {
		state.isCardDrawn = val;
	},

	[mutationTypes.decks.CARDS_SHUFFLED](state, val) {
		state.isShuffled = val;
	},

	[mutationTypes.decks.INIT](state) {
		for (const prop in state) {
			if (typeof state[prop] === 'object') {
				Vue.delete(state, prop);
			} else {
				state[prop] = false;
			}
		}

		Vue.set(state, 'ids', []);

		this._vm.$log.debug('decks.INIT :: ', state);
	},

	[mutationTypes.decks.LOADED](state) {
		state.isLoaded = true;
	},

	[mutationTypes.decks.UPDATE](state, payload) {
		const deckId = payload.id;

		this._vm.$log.debug('mutation::decks/update', state, payload);

		if (!state[deckId]) {
			Vue.set(state, deckId, {});
			Vue.set(state, 'ids', [...state.ids, deckId]);
		}

		for (const prop in payload) {
			let value = payload[prop];

			if (isArray(prop)) {
				value = [...payload[prop]];
			}

			Vue.set(state[deckId], prop, value);
		}
	},

	[mutationTypes.decks.UPDATE_CARDS](state, payload) {
		this._vm.$log.debug('decks/UPDATE_CARDS', payload);

		Vue.set(state[payload.id], 'cards', [...payload.cards]);
	},
};

export default {
	namespaced: true,
	state,
	getters,
	actions,
	mutations,
};
