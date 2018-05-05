import Vue from 'vue';
import _ from 'lodash';

import api from '@/api/index';
import store from '@/store/index';
import { config } from '@/config';

const state = {
	cardsDrawnCount: 0,
	cardsDrawnIds: [],
	isLoaded: false,
};

const getters = {
	getByType: state => name => {
		return _.find(state, { deckType: name });
	},
};

const actions = {
	dealCards({ commit, dispatch }, playerId) {
		const drawCardOptions = { numOnly: true };

		this._vm.$log.debug('decks/dealCards', playerId);

		// Instead of -> for (i=0; i<config.MAX_CARDS; ++i)
		// [...Array(config.MAX_CARDS)].forEach(() => {
		// 	if (!state.isDrawingCard) {
		// 		drawPromises.push(dispatch('drawCard', { numOnly: true }));
		// 	}
		// });

		return new Promise((resolve, reject) => {
			let unsubscribe = store.subscribe((mutation, state) => {
				this._vm.$log.debug('decks/dealCards.subscribe', mutation, state.decks.cardsDrawnCount, state);

				if (mutation.type === 'decks/UPDATE_CARDS') {
					if (state.decks.cardsDrawnCount > config.MAX_CARDS) {
						unsubscribe();

						this._vm.$log.debug('api.decks.update:then()', state.decks.cardsDrawnIds);

						// Ensure no card is 'null'
						if (!state.decks.cardsDrawnIds.some(el => el !== null)) {
							throw new Error('Invalid cardId: null');
						}

						api.players
							.update(playerId, {
								cardsInHand: state.decks.cardsDrawnIds,
							})
							.then(() => {
								resolve();
							})
							.catch(err => {
								reject(err);
							});
					} else {
						dispatch('drawCard', drawCardOptions);
						// .then(cardId => {
						// 	state.decks.cardsDrawnIds.push(cardId);
						// });
					}
				}
			});

			dispatch('drawCard', drawCardOptions)
				.then(cardId => {
					this._vm.$log.debug('card drawn -> ', cardId);
				})
				.catch(err => {
					reject(err);
				});
		});

		// return new Promise((resolve, reject) => {

		// });
		// prettier-ignore
		// Promise
		// 	.all(drawPromises)
		// 	.then(cards => {

		// 	})
		// 	// .then(res => {
		// 	// 	this.$log.debug('playersApi:update()', res, this);
		// 	// 	return Promise.resolve(cards);
		// 	// })
		// 	.catch(err => {
		// 		this._vm.$log.debug(err);
		// 		this._vm.$toasted.error(`Unable to deal cards - ${err}`);
		// 		return Promise.reject(err);
		// 	});
	},

	/**
	 *
	 * @param {Boolean} param0 (Optional)
	 * @param {Object} param1 (Optional)
	 * @param {String} param2 (Optional)
	 */
	drawCard({ commit, getters }, options) {
		const mainDeck = getters.getByType('main');
		let cardsFromDeck = {
			ids: mainDeck.cards.map(obj => {
				return obj.id;
			}),
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

		this._vm.$log.debug('decks/drawCard -> ', options, mainDeck);
		this._vm.$log.debug('cardsFromDeck -> ', cardsFromDeck);
		this._vm.$log.debug('cardDrawn -> ', cardDrawn);

		// Removes cardDrawn.id from cardsFromDeck.ids
		_.pull(cardsFromDeck.ids, cardDrawn.id);
		// mainDeck.cards = _.reject(mainDeck.cardIds, o => {
		// 	return cardDrawn.id === o.id;
		// });

		commit('UPDATE_CARDS', {
			id: mainDeck.id,
			cards: cardsFromDeck.ids,
			cardDrawnId: cardDrawn.id,
		});

		return new Promise((resolve, reject) => {
			api.decks
				.update(mainDeck.id, { cards: cardsFromDeck.ids })
				.then(() => {
					resolve(cardDrawn.id);
				});
		});
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
		state.cardsDrawnCount += 1;
		// Vue.set(state, 'cardsDrawnIds', payload.cardDrawnId);
		state.cardsDrawnIds.push(payload.cardDrawnId);
	},

	UPDATE_CARDS_COUNT(state) {},
};

export default {
	namespaced: true,
	state,
	getters,
	actions,
	mutations,
};
