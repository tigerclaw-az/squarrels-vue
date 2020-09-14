import Vue from 'vue';
import {
	concat,
	find,
	filter,
	pull,
	reject,
	sampleSize,
	some,
	isArray,
	isEmpty,
} from 'lodash';

import api from '@/api/index';
import { config } from '@/config';
import store from '@/store/index';
import mutationTypes from '@/store/mutation-types';

const state = {
	isLoaded: false,
	isShuffled: false,
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
	cardsDealt({ getters }) {
		const mainDeck = getters.getByType('main');

		this._vm.$log.debug('dealPromises -> ', mainDeck);

		// After all cards have been dealt, set the starting player
		return api.decks.update(mainDeck.id, {
			cards: getters.getCardIds(mainDeck.id),
		});
	},

	async dealCards({ dispatch, getters }, playerId) {
		const drawCardOptions = { numOnly: true, isDeal: true, playerId };
		const mainDeck = getters.getByType('main');

		this._vm.$log.debug('decks/dealCards', playerId);

		// Need to reset cardsDrawn* properties so they can be
		// used again with new deal later
		await dispatch('players/resetCardsDrawn', { id: playerId }, { root: true });

		return new Promise((resolve, reject) => {
			// Watch for each time a card was drawn and updated for
			// a given player, then continue to draw until they have MAX_CARDS
			const unsubscribe = store.subscribe((mutation, state) => {
				const playerCards = state.players[playerId].cardsDrawnIds;

				if (mutation.type === 'players/DRAW_CARD') {
					this._vm.$log.debug('decks/dealCards.subscribe', playerCards, state);

					if (playerCards.length === config.MAX_CARDS) {
						unsubscribe();

						api.players
							.update(playerId, {
								cardsInHand: playerCards,
							})
							.then(() => {
								resolve({
									deckId: mainDeck.id,
								});
							})
							.catch(err => {
								reject(err);
							});
					} else {
						dispatch('drawCard', drawCardOptions)
							.then(cardId => {
								this._vm.$log.debug('card drawn -> ', cardId);
							})
							.catch(err => {
								unsubscribe();
								reject(err);
							});
					}
				}
			});

			// Trigger initial 'players/DRAW_CARD' mutation, which will trigger the .subscribe() above
			// and continue drawing cards for given user until they have MAX_CARDS
			dispatch('drawCard', drawCardOptions)
				.then(cardId => {
					this._vm.$log.debug('card drawn -> ', cardId);
				})
				.catch(err => {
					unsubscribe();
					reject(err);
				});
		});
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
		// return dispatch('addCard', { type: 'hoard', cardId: card.id });
	},

	async drawCard({ commit, dispatch, getters }, options = {}) {
		const mainDeck = getters.getByType('main');

		this._vm.$log.debug('decks/drawCard -> ', options, mainDeck);

		dispatch('sound/play', this._vm.$sounds.drawCard, { root: true });

		const cardsFromDeck = {
			ids: getters.getCardIds(mainDeck.id),
			toDraw: options.numOnly
				? filter(mainDeck.cards, { cardType: 'number' })
				: mainDeck.cards,
		};

		const cardDrawn = options.adminCard || sampleSize(cardsFromDeck.toDraw)[0];

		this._vm.$log.debug('cardsFromDeck -> ', cardsFromDeck);
		this._vm.$log.debug('cardDrawn -> ', cardDrawn);

		if (!cardDrawn) {
			throw new Error('Card drawn does not exist!');
		}

		try {
			// Removes cardDrawn.id from cardsFromDeck.ids
			pull(cardsFromDeck.ids, cardDrawn.id);

			// Need to update the cards in main deck so that the next
			// player doesn't draw the same card (async)
			commit(mutationTypes.decks.UPDATE_CARDS, {
				id: mainDeck.id,
				cards: reject(mainDeck.cards, c => cardDrawn.id === c.id),
			});
		} catch (err) {
			this._vm.$log.error(err);
			throw new Error(err);
		}

		// Need to update the cards drawn by the player so that
		// the subscribe knows when to stop
		if (options.isDeal) {
			commit(
				'players/DRAW_CARD',
				{
					id: options.playerId,
					cardDrawnId: cardDrawn.id,
				},
				{ root: true },
			);

			return cardDrawn;
		}

		try {
			await api.decks.update(mainDeck.id, { cards: cardsFromDeck.ids });
		} catch (err) {
			this._vm.$log.error(err);
			throw new Error(err);
		}

		return cardDrawn;
	},

	async load({ commit }, { ids }) {
		this._vm.$log.debug('decks/load', ids);

		if (isEmpty(ids)) {
			return Promise.reject('ERROR: No ids provided for "decks/load"');
		}

		try {
			const res = await api.decks.get(ids.join(','));

			if (res.status !== 200) {
				this._vm.$log.error(res);
				throw new Error(res);
			}

			const decks = res.data;

			decks.forEach(deck => {
				commit(mutationTypes.decks.UPDATE, deck);
			});

			commit(mutationTypes.decks.LOADED);

			return decks;
		} catch (err) {
			this._vm.$log.error(err);
			reject(err);
		}
	},

	async remove({ dispatch }, ids) {
		await dispatch('unload');

		return api.decks.delete(ids.join(','));
	},

	unload({ commit }) {
		commit(mutationTypes.decks.INIT);
	},
};

const mutations = {
	[mutationTypes.decks.CARDS_SHUFFLED](state, val) {
		state.isShuffled = val;
	},

	[mutationTypes.decks.INIT](state) {
		state.isLoaded = false;

		for (const prop in state) {
			if (typeof state[prop] === 'object') {
				Vue.delete(state, prop);
			}
		}
	},

	[mutationTypes.decks.LOADED](state) {
		state.isLoaded = true;
	},

	[mutationTypes.decks.UPDATE](state, payload) {
		const deckId = payload.id;

		this._vm.$log.debug('mutation::decks/update', state, payload);

		if (!state[deckId]) {
			Vue.set(state, deckId, {});
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
