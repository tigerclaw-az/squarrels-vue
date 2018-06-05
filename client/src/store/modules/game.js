import Vue from 'vue';
import router from '@/router';

import _ from 'lodash';

import api from '@/api/index';

const initialState = {
	actionCard: null,
	createdAt: null,
	deckIds: [],
	id: null,
	isDealing: false,
	isLoaded: false,
	isStarted: false,
	playerIds: [],
	quarrelCards: [],
	roundNumber: 1,
	updatedAt: null,
};

const state = Object.assign({}, initialState);

const getters = {
	isActionCard: state => (name = '') => {
		Vue.$log.debug('isActionCard->', state, name);

		let action = state.actionCard;

		if (!name) {
			return action !== null;
		}

		return action && action.name === name;
	},

	isPlayerInGame: state => id => {
		Vue.$log.debug('isPlayerInGame->', state, id);

		return state.playerIds.filter(pl => pl.id === id).length;
	},
};

const actions = {
	async actionCard({ dispatch, state }, actionCard) {
		Vue.$log.debug('game/actionCard->', actionCard, state);

		try {
			let res = await api.games.actionCard(state.id, actionCard.id);

			Vue.$log.debug('gameUpdate:actionCard -> ', res);

			return res;
		} catch (err) {
			return err;
		}
	},
	addQuarrelCard({ commit, state }, card) {
		this._vm.$log.debug(card);

		const newCards = _.concat(state.quarrelCards, card);

		commit('UPDATE', { quarrelCards: newCards });
	},
	addPlayer({ commit, state }, { gameId, playerId }) {
		let newPlayers = _.union(playerId, [...state.playerIds, playerId]);

		Vue.$log.debug('game/addPlayer', gameId, playerId, newPlayers);

		if (newPlayers.length) {
			return api.games
				.updatePlayers(gameId, newPlayers)
				.then(res => {
					Vue.$log.debug('addPlayer()', res);
					let gameData = res.data;

					commit('UPDATE', gameData);
				})
				.catch(err => {
					Vue.$log.error(err);
				});
		}

		return Promise.reject('NO PLAYERS TO ADD');
	},

	load({ commit, dispatch }, { id }) {
		return api.games
			.get(id)
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
				this._vm.$log.error(err);
			});
	},

	start({ commit, dispatch, rootGetters, state }) {
		let dealPromises = [];

		this._vm.$log.debug('game/start', state);

		commit('START_DEAL');

		return api.games
			.dealCards(state.id, state.playerIds)
			.then(() => {
				// Load all deck data into the store
				return dispatch(
					'decks/load',
					{ ids: state.deckIds },
					{ root: true }
				);
			})
			.then(() => {
				// Loop through each player and deal cards
				// Each deal will be saved as a Promise so we can wait
				// for all players to be dealt cards before starting game
				for (let playerId of state.playerIds) {
					dealPromises.push(
						// prettier-ignore
						dispatch(
							'decks/dealCards',
							playerId,
							{ root: true }
						)
					);
				}

				// prettier-ignore
				Promise.all(dealPromises)
					.then(() => {
						const mainDeck = rootGetters['decks/getByType']('main');

						this._vm.$log.debug('dealPromises -> ', mainDeck);

						// After all cards have been dealt, set the starting player
						api.decks
							.update(mainDeck.id, { cards: rootGetters['decks/getCardIds'](mainDeck.id) })
							.then(() => {
								// All players and decks have been updated, game can start
								commit('END_DEAL');
								api.games.start(state.id);
								dispatch('players/nextPlayer', null, { root: true });
							});
					})
					.catch(err => {
						this._vm.$log.error(err);
						this._vm.$toasted.error(
							`Problem dealing cards: ${err}`
						);
					});
			})
			.catch(err => {
				this._vm.$log.error(err);
			});
	},

	reset({ commit, state }) {
		return api.games.reset(state.id).then(() => {
			// commit('INIT');
		});
	},

	async resetAction({ dispatch }) {
		try {
			// Add current action card to the 'action' deck
			await dispatch(
				'decks/addCard',
				{ type: 'action', cardId: state.actionCard.id },
				{ root: true }
			);

			return api.games.actionCard(state.id, null);
		} catch (err) {
			this._vm.$toasted.error(err);
		}
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

		return api.games
			.updatePlayers(state.id, updatedPlayerIds)
			.then(() => {
				commit('INIT');
			})
			.catch(err => {
				this._vm.$log.error(err);
			});
	},

	update({ commit }, data) {},
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

	END_DEAL(state) {
		state.isDealing = false;
	},

	START_DEAL(state) {
		state.isDealing = true;
	},

	UPDATE(state, payload) {
		const prevPlayerCount = state.playerIds.length;

		Vue.$log.debug('mutation::game/update', state, payload);

		if (payload) {
			for (let prop in state) {
				if (payload.hasOwnProperty(prop)) {
					Vue.set(state, prop, payload[prop]);
					if (prop === 'playerIds' && prevPlayerCount > 0) {
						const newPlayerCount = payload[prop].length;
						const countDiff = newPlayerCount - prevPlayerCount;

						if (countDiff !== 0) {
							let msg =
								'Player ' +
								(countDiff > 0 ? 'joined' : 'left') +
								'!';

							this._vm.$toasted.info(msg);
						}
					}
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
