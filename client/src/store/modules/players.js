import Vue from 'vue';
import utils from '@/utils';
import {
	concat,
	difference,
	filter,
	find,
	findIndex,
	flatten,
	flow,
	includes,
	isEmpty,
	isString,
	map,
	maxBy,
	reject,
	sample,
	union,
} from 'lodash';

import api from '@/api/index';

const plDefault = {
	name: utils.getRandomStr(12),
};

const state = {
	ids: [],
};

const getters = {
	canDrawCard: (state, getter, rootState, rootGetters) => {
		const myPlayer = getter.getMyPlayer;

		Vue.$log.debug(state, myPlayer);

		if (myPlayer.id && myPlayer.cardsInHand) {
			return (
				myPlayer.isActive &&
				!rootGetters['game/isActionCard']() &&
				!myPlayer.hasStoredCards &&
				(myPlayer.cardsInHand.length < 7 || !myPlayer.hasDrawnCard)
			);
		}

		return false;
	},

	canDiscardCard: (_, getter) => {
		const myPlayer = getter.getMyPlayer;

		return myPlayer.isActive && myPlayer.hasDrawnCard;
	},

	getById: state => id => {
		return state[id] || {};
	},

	getByProp: state => (prop, value, options = {}) => {
		const index = options.index || false;
		const all = options.all || false;

		Vue.$log.debug('get()', prop, value, index);

		let method = find;

		if (index) {
			method = findIndex;
		} else if (all) {
			method = filter;
		}

		if (prop) {
			if (value) {
				return method(state, function(o) {
					return o[prop] === value;
				});
			}

			// If a 'value' wasn't given, then we're just looking for the player
			// where the supplied 'prop' is !null/undefined
			return method(state, prop);
		}

		return state;
	},

	getMyPlayer: (state, getters, rootState) => {
		Vue.$log.debug('getMyPlayer()', state, rootState);

		for (const id in state) {
			if (id === rootState.localPlayer.id) {
				return state[id];
			}
		}

		return { id: '' };
	},

	getNextPlayer: state => activeIndex => {
		Vue.$log.debug('getNextPlayer()', activeIndex, state);

		if (activeIndex === -1) {
			// Get random player from list of player IDs
			return sample(state.ids);
		} else if (activeIndex === state.ids.length - 1) {
			// Reset active player to first player
			activeIndex = 0;
		} else {
			activeIndex++;
		}

		return state.ids[activeIndex];
	},

	isActivePlayer: (state, getter) => {
		return getter.getMyPlayer.isActive;
	},

	totalPlayers: state => {
		return state.ids.length;
	},
};

const actions = {
	actionCard({ getters }, payload) {
		this._vm.$log.debug(payload, getters.isActivePlayer);

		if (getters.isActivePlayer) {
			this._vm.$socket.sendObj({
				action: payload.name,
				gameId: payload.gameId,
			});
		}
	},
	async add({ dispatch }, plArr) {
		this._vm.$log.debug('add()', plArr);

		// if (plArr.length) {
		try {
			const res = await api.players.get(plArr.join(','));

			if (res.status === 200) {
				return dispatch('updateLocalPlayer', res.data[0]);
			}

			throw new Error(res.error);
		} catch (err) {
			this._vm.$log.error(err);
			throw new Error(err);
		}
		// }
	},

	addCards({ dispatch, getters }, data) {
		this._vm.$log.debug('players/addCards', data, getters, this);

		if (!data.cards) {
			throw new Error('Parameter "cards" cannot be empty!');
		}

		// const cardsToAdd = _(data.cards)
		// 	.flatten([data.cards])
		// 	.map(card => card.id)
		// 	.value();
		const cardsToAdd = flow(
			map(card => card.id),
			flatten,
		)(data.cards);

		const playerId = data.id || getters.getMyPlayer.id;

		return dispatch('update', {
			id: playerId,
			data: {
				addCards: true,
				cardsInHand: cardsToAdd,
			},
		})
			.then(res => {
				this._vm.$log.debug('playersApi:update()', res, this);
			})
			.catch(err => {
				this._vm.$toasted.error('This is nuts! ' + err);
				this._vm.$log.error('This is nuts! Error: ', err);
			});
	},

	create({ commit, dispatch }, plObj) {
		const plData = Object.assign({}, plDefault, plObj);

		return new Promise((resolve, reject) => {
			api.players
				.create(plData)
				.then(res => {
					commit('LOGIN', res.data, { root: true });
					dispatch('updateLocalPlayer', res.data);
					resolve();
				})
				.catch(err => {
					this._vm.$log.error(err);
					reject(err);
				});
		});
	},

	collectHoard({ dispatch, getters, rootGetters }, pl) {
		const myPlayer = getters.getMyPlayer;
		const hoardDeck = rootGetters['decks/getByType']('hoard');
		const hoardCards = rootGetters['decks/getCardIds'](hoardDeck.id);
		const cardsInHand = union(myPlayer.cardsInHand, hoardCards);

		if (pl.id === myPlayer.id) {
			// Add hoard cards to player cards
			// prettier-ignore
			dispatch('update', { id: myPlayer.id, data: { cardsInHand } })
				.then(async() => {
					try {
						await dispatch(
							'decks/updateById',
							{ id: hoardDeck.id, data: { cards: [] } },
							{ root: true },
						);

						dispatch(
							'game/resetAction',
							{},
							{ root: true },
						);
					} catch (err) {
						this._vm.$toasted.error(err);
						this._vm.$log.error(err);
					}
				});
		} else {
			this._vm.$toasted.info(`HOARD TAKEN BY: ${pl.name}`);
			dispatch('sound/play', 'hoard-taken', { root: true });
		}
	},

	// eslint-disable-next-line
	async delete({}, id) {
		const playerId = id || getters.getMyPlayer.id;

		try {
			await api.players.delete(playerId);
		} catch (err) {
			this._vm.$toasted.error(err);
			throw new Error(err);
		}
	},

	discard({ dispatch, getters, state }, payload) {
		this._vm.$log.debug(state, payload);

		const playerId = getters.getMyPlayer.id;
		const cardIds = state[playerId].cardsInHand.map(card => card._id);
		const cardsInHand = difference(cardIds, [payload.card.id]);

		// dispatch('updateLocalPlayer', {
		// 	id: playerId,
		// 	cardsInHand,
		// 	quarrel: false,
		// 	message: null,
		// });

		this._vm.$log.debug(cardsInHand);

		const data = { cardsInHand };

		if (!payload.isQuarrel) {
			data.hasStoredCards = true;
		}

		return dispatch('update', {
			id: playerId,
			data,
		});
	},

	async drawCard({ dispatch, getters }, payload) {
		const playerId = payload.id || getters.getMyPlayer.id;

		try {
			return await dispatch('update', {
				id: playerId,
				data: {
					hasDrawnCard: true,
				},
			});
		} catch (err) {
			this._vm.$log.error(err);

			return false;
		}
	},

	/**
	 * Load player data for each player in game
	 * @param  {Array} ids            Array of player IDs
	 *
	 * @return {Object} Promise
	 */
	async load({ dispatch }, { ids }) {
		this._vm.$log.debug('players/load', ids);

		if (!ids.length) {
			throw new Error('Need at least one player to be loaded!');
		}

		try {
			const res = await api.players.get(ids.join(','));

			this._vm.$log.debug('api/players/get', res);

			if (res.status !== 200) {
				throw new Error(res.error);
			}

			const playersUpdated = [];

			res.data.forEach(plData => {
				playersUpdated.push(dispatch('updateLocalPlayer', plData));
			});

			return Promise.all(playersUpdated);
		} catch (err) {
			this._vm.$log.error(err);
			throw new Error(err);
		}
	},

	nextPlayer({ dispatch, getters }) {
		const activePlayer = getters.getByProp('isActive', true);
		const activePlayerIndex = activePlayer
			? state.ids.indexOf(activePlayer.id)
			: -1;
		const nextPlayerId = getters.getNextPlayer(activePlayerIndex);

		this._vm.$log.debug(
			'nextPlayer()',
			activePlayer,
			activePlayerIndex,
			nextPlayerId,
		);

		if (activePlayerIndex !== -1) {
			dispatch('update', {
				id: activePlayer.id,
				data: {
					isActive: false,
					hasDrawnCard: false,
					hasStoredCards: false,
				},
			})
				.then(res => {
					// Merge data with existing object of player
					if (res.status === 200) {
						// this.update(res.data.id, res.data);
					}
				})
				.catch(err => {
					this.$log.error(err);
				});
		}

		return dispatch('update', {
			id: nextPlayerId,
			data: {
				isActive: true,
				hasDrawnCard: false,
				hasStoredCards: false,
			},
		});
	},

	async removeHighCard({ dispatch }, player) {
		const cards = player.cardsInHand;
		const highCard = maxBy(cards, card => {
			return card.cardType === 'special' ? -1 : card.amount;
		});

		this._vm.$log.debug('highCard ->', highCard);

		if (!isEmpty(highCard)) {
			this._vm.$toasted.info('You just lost a card!');

			await dispatch('update', {
				id: player.id,
				data: {
					cardsInHand: difference(player.cardsInHand, [highCard.id]),
				},
			});

			return dispatch('decks/discard', highCard, { root: true });
		}
	},

	async resetCardsDrawn({ dispatch }, data) {
		await dispatch('updateLocalPlayer', {
			id: data.id,
			cardsDrawnCount: 0,
			cardsDrawnIds: [],
		});
	},

	resetQuarrelWinner({ dispatch }, payload) {
		Vue.$log.debug(payload);

		return dispatch('update', {
			id: payload.id,
			data: {
				isQuarrelWinner: false,
				hasDrawnCard: false,
			},
		});
	},

	async selectQuarrelCard({ dispatch }, data) {
		const wsObj = {
			action: 'quarrel',
			player: data.id,
		};

		// If the player doesn't have any cards, then the 'card' property
		// won't be sent through the websocket, but we still need to send
		// a message so the game is updated properly.
		if (data.card) {
			wsObj.card = data.card;
		}

		await dispatch('updateLocalPlayer', {
			id: data.id,
			message: null,
			quarrel: false,
		});

		this._vm.$socket.sendObj(wsObj);
	},

	async setQuarrelWinner({ dispatch, getters }, payload) {
		await dispatch('updateLocalPlayer', {
			id: payload.id,
			isQuarrelWinner: true,
		});

		// Only send call for 'addCards' for player that is receiving them
		if (payload.id === getters.getMyPlayer.id) {
			setTimeout(() => {
				dispatch('addCards', payload);
			}, 1000);
		}
	},

	startQuarrel({ dispatch, getters, state }, options = {}) {
		const myPlayer = getters.getMyPlayer;
		const players = options.players || state.ids;

		this._vm.$log.debug(players, myPlayer);

		if (!includes(players, myPlayer.id)) {
			return;
		}

		// Find all players that have at least 1 card
		const quarrelPlayers = reject(players, { totalCards: 0 });

		// If no players, or just 1 player, have enough cards for Quarrel
		if (quarrelPlayers.length <= 1) {
			dispatch('game/quarrelWinner');
		} else {
			dispatch('game/setQuarrelCount', quarrelPlayers.length, {
				root: true,
			});

			dispatch('updateLocalPlayer', {
				id: myPlayer.id,
				message: 'Choose a Card',
				quarrel: true,
			});
		}
	},

	storeCards({ dispatch, getters }, payload) {
		this._vm.$log.debug('storeCards -> ', payload);

		const currentPlayer = getters.getMyPlayer;
		const cardsInStorage = currentPlayer.cardsInStorage;
		const cardsToStore = payload.cards;
		const cardsToStoreIds = cardsToStore.map(card => card.id);
		const playerCardsIds = currentPlayer.cardsInHand.map(card => card.id);

		const plData = {
			cardsInHand: difference(playerCardsIds, cardsToStoreIds),
			cardsInStorage: concat(cardsInStorage, cardsToStoreIds[0]),
			hasStoredCards: true,
			score: currentPlayer.score + cardsToStore[0].amount,
		};

		this._vm.$log.debug('plData -> ', plData);

		dispatch('sound/play', 'store-cards', { root: true });

		return dispatch('update', {
			id: currentPlayer.id,
			data: plData,
		});
	},

	// eslint-disable-next-line
	update({}, payload) {
		this._vm.$log.debug('players/update', payload);

		if (!isString(payload.id)) {
			throw new Error('"payload.id" MUST be a string');
		}

		return api.players.update(payload.id, payload.data);
	},

	updateGame({ dispatch }, payload) {
		if (!payload.id) {
			throw new Error('Missing required "id" property!');
		}

		const playerId = payload.id;
		const gameId = payload.gameId || null;

		return dispatch('update', {
			id: playerId,
			data: {
				gameId,
			},
		});
	},

	async updateLocalPlayer({ commit, state }, payload) {
		if (!payload.id) {
			this._vm.$toasted.info('Did not receive "id" for player!');
			this._vm.$log.info('Missing "id" from payload:', payload);
		}

		commit('UPDATE', payload);

		const playerId = payload.id;
		const $playerStorage = await Vue.$storage.getItem('player');
		const localPlayerId = $playerStorage && $playerStorage.id;

		this._vm.$log.debug('playerMatch?', playerId, localPlayerId);

		if (playerId === localPlayerId) {
			await Vue.$storage.setItem('player', state[playerId]);
			// Send async websocket request for 'whoami' to update
			// cardsInHand for local player
			this._vm.$socket.sendObj({ action: 'getMyCards' });
		}
	},
};

const mutations = {
	DRAW_CARD(state, payload) {
		const myCards = state[payload.id].cardsDrawnIds;

		this._vm.$log.debug('players/DRAW_CARD', payload, state);

		if (
			!Object.prototype.hasOwnProperty.call(
				state[payload.id],
				'cardsDrawnCount',
			)
		) {
			Vue.set(state[payload.id], 'cardsDrawnCount', 0);
		}

		if (
			!Object.prototype.hasOwnProperty.call(state[payload.id], 'cardsDrawnIds')
		) {
			Vue.set(state[payload.id], 'cardsDrawnIds', []);
		}

		myCards.push(payload.cardDrawnId);
		state[payload.id].cardsDrawnCount += 1;

		Vue.set(state[payload.id], 'cardsDrawnIds', [...myCards]);

		this._vm.$log.debug(
			'cardsDrawn',
			state[payload.id].cardsDrawnIds,
			state[payload.id].cardsDrawnCount,
		);
	},

	UPDATE(state, payload) {
		const playerId = payload.id;
		const ids = state.ids;

		this._vm.$log.debug('mutation::players/UPDATE', state, payload);

		if (isString(playerId)) {
			if (!state[playerId]) {
				Vue.set(state, playerId, {});
				ids.push(playerId);
			}

			state.ids = [...ids];

			for (const prop in payload) {
				Vue.set(state[playerId], prop, payload[prop]);
			}
		}
	},

	UPDATE_CARDS(state, payload) {
		const id = payload.id;
		const cards = payload.cardsInHand;

		Vue.set(state[id], 'cardsInHand', [...cards]);
	},
};

export default {
	namespaced: true,
	state,
	getters,
	actions,
	mutations,
};
