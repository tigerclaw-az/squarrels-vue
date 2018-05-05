import Vue from 'vue';
import _ from 'lodash';

import api from '@/api/index';
import store from '@/store/index';
import { config } from '@/config';

const state = {
	isLoaded: false,
};

const getters = {
	getByType: state => name => {
		return _.find(state, { deckType: name });
	},

	getCardIds: state => deckId => {
		return state[deckId].cards.map(card => {
			return card.id;
		});
	},
};

const actions = {
	dealCards({ commit, dispatch, getters }, playerId) {
		const drawCardOptions = { numOnly: true, playerId };
		const mainDeck = getters.getByType('main');

		this._vm.$log.debug('decks/dealCards', playerId);

		// Instead of -> for (i=0; i<config.MAX_CARDS; ++i)
		// [...Array(config.MAX_CARDS)].forEach(() => {
		// 	if (!state.isDrawingCard) {
		// 		drawPromises.push(dispatch('drawCard', { numOnly: true }));
		// 	}
		// });

		return new Promise((resolve, reject) => {
			// Watch for each time a card was drawn and updated for
			// a given player, then continue to draw until they have MAX_CARDS
			let unsubscribe = store.subscribe((mutation, state) => {
				this._vm.$log.debug(
					'decks/dealCards.subscribe',
					mutation,
					state.players[playerId].cardsDrawnCount,
					state
				);

				if (mutation.type === 'players/DRAW_CARD') {
					if (
						state.players[playerId].cardsDrawnCount ===
						config.MAX_CARDS
					) {
						unsubscribe();

						// Ensure no card is 'null'
						if (
							!state.players[playerId].cardsDrawnIds.some(
								el => el !== null
							)
						) {
							reject('Invalid cardId: null');
						}

						api.players
							.update(playerId, {
								cardsInHand:
									state.players[playerId].cardsDrawnIds,
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
						dispatch('drawCard', drawCardOptions);
					}
				}
			});

			// Start drawing cards
			dispatch('drawCard', drawCardOptions)
				.then(cardId => {
					this._vm.$log.debug('card drawn -> ', cardId);
				})
				.catch(err => {
					reject(err);
				});
		});
	},

	/**
	 *
	 * @param {Boolean} param0 (Optional)
	 * @param {Object} param1 (Optional)
	 * @param {String} param2 (Optional)
	 */
	drawCard({ commit, getters }, options) {
		const mainDeck = getters.getByType('main');
		this._vm.$log.debug('decks/drawCard -> ', options, mainDeck);

		let cardsFromDeck = {
			ids: getters.getCardIds(mainDeck.id),
			toDraw: options.numOnly
				? _.filter(mainDeck.cards, { cardType: 'number' })
				: mainDeck.cards,
		};
		let cardDrawn;

		if (options.adminCard) {
			cardDrawn = _.find(cardsFromDeck.toDraw, options.adminCard);
		} else {
			cardDrawn = _.sampleSize(cardsFromDeck.toDraw)[0];
		}

		this._vm.$log.debug('cardsFromDeck -> ', cardsFromDeck);
		this._vm.$log.debug('cardDrawn -> ', cardDrawn);

		// Removes cardDrawn.id from cardsFromDeck.ids
		_.pull(cardsFromDeck.ids, cardDrawn.id);

		// Need to update the cards in main deck so that the next
		// player doesn't draw the same card (async)
		commit('UPDATE_CARDS', {
			id: mainDeck.id,
			cards: _.reject(mainDeck.cards, c => cardDrawn.id === c.id),
		});

		// Need to update the cards drawn by the player so that
		// the subscribe knows when to stop
		commit(
			'players/DRAW_CARD',
			{
				id: options.playerId,
				cardDrawnId: cardDrawn.id,
			},
			{ root: true }
		);

		return Promise.resolve(cardDrawn.id);

		// return new Promise((resolve, reject) => {
		// 	api.decks
		// 		.update(mainDeck.id, { cards: cardsFromDeck.ids })
		// 		.then(() => {
		// 			resolve(cardDrawn.id);
		// 		});
		// });
	},

	load({ commit, dispatch }, { ids }) {
		this._vm.$log.debug('decks/load', ids);

		return new Promise((resolve, reject) => {
			api.decks
				.get(ids.join(','))
				.then(res => {
					this._vm.$log.debug('decks/load', res);
					if (res.status === 200) {
						let decks = res.data;

						decks.forEach(deck => {
							commit('UPDATE', deck);
						});

						commit('LOADED');
						resolve();
					} else {
						// TODO: Handle deck load error
						this._vm.$log.error(res);
						reject();
					}
				})
				.catch(err => {
					this._vm.$log.error(err);
					reject(err);
				});
		});
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
	},

	UPDATE_CARDS(state, payload) {
		this._vm.$log.debug('decks/UPDATE_CARDS', payload);

		Vue.set(state[payload.id], 'cards', payload.cards);
		// Vue.set(state, 'cardsDrawnIds', payload.cardDrawnId);
	},
};

export default {
	namespaced: true,
	state,
	getters,
	actions,
	mutations,
};
