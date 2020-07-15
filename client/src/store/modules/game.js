import Vue from 'vue';
import router from '@/routes';

import {
	concat,
	groupBy,
	keys,
	map,
	max,
	union,
	without,
	isEmpty,
} from 'lodash';

import api from '@/api/index';
import mutationTypes from '@/store/mutation-types';

const newRoundState = {
	actionCard: null,
	createdBy: null,
	isDealing: false,
	isLoaded: false,
	isDrawingCard: false,
	isStarted: false,
	quarrelCards: {
		current: [],
		saved: [],
	},
	quarrelCount: 0,
	showQuarrel: false,
};

const initialState = Object.assign({}, newRoundState, {
	deckIds: [],
	id: null,
	playerIds: [],
	startDate: null,
	roundNumber: 1,
	updatedAt: null,
});

const state = Object.assign({}, initialState);

const getters = {
	getQuarrelCardByPlayer: state => playerId => {
		Vue.$log.debug(
			'quarrelCardByPlayer->',
			state.quarrelCards.current,
			playerId,
		);

		if (!state.quarrelCards.current.length) {
			return null;
		}

		const quarrelObj = state.quarrelCards.current.find(obj => {
			return obj.playerId === playerId;
		});

		Vue.$log.debug('playerQuarrelCard->', quarrelObj);

		if (
			!quarrelObj ||
			!Object.prototype.hasOwnProperty.call(quarrelObj, 'card')
		) {
			return null;
		}

		return quarrelObj.card;
	},
	isActionCard: state => (name = '') => {
		Vue.$log.debug('isActionCard->', state, name);

		const action = state.actionCard;

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
	async actionCard({ state }, actionCard) {
		Vue.$log.debug('game/actionCard->', actionCard, state);

		try {
			const res = await api.games.actionCard(state.id, actionCard.id);

			Vue.$log.debug('gameUpdate:actionCard -> ', res);

			return res;
		} catch (err) {
			return err;
		}
	},
	addQuarrelCard({ commit, dispatch, state }, card) {
		this._vm.$log.debug(card);

		const newCards = concat(state.quarrelCards.current, card);
		const savedCards = concat(state.quarrelCards.saved, card);
		const quarrelCards = {
			current: newCards,
			saved: savedCards,
		};

		commit(mutationTypes.game.UPDATE, { quarrelCards });

		this._vm.$log.debug('addQuarrelCard', newCards, state.quarrelCount);

		// All players have selected a card
		if (newCards.length === state.quarrelCount) {
			dispatch('quarrelWinner');
		}
	},
	async addPlayer({ commit, dispatch, state }, { gameId, playerId }) {
		if (!playerId) {
			return Promise.reject('ERROR: Missing "playerId" parameter');
		}

		const newPlayers = union(playerId, [...state.playerIds, playerId]);

		Vue.$log.debug('game/addPlayer', gameId, playerId, newPlayers);

		if (newPlayers.length) {
			const res = await api.games.updatePlayers(gameId, newPlayers);

			Vue.$log.debug('updatePlayers()', res);
			const gameData = res.data;

			commit(mutationTypes.game.UPDATE, gameData);

			await dispatch(
				'players/updateGame',
				{
					id: playerId,
					gameId,
				},
				{ root: true },
			);

			return Promise.resolve(gameData);
		}

		return Promise.reject('NO PLAYERS TO ADD');
	},

	load({ commit }, { id }) {
		return new Promise((resolve, reject) => {
			api.games
				.get(id)
				.then(res => {
					Vue.$log.debug('game/load', res);

					if (res.status === 200) {
						const gameData = res.data[0];

						commit(mutationTypes.game.UPDATE, gameData);
						commit(mutationTypes.game.LOADED);

						resolve(gameData);
					} else {
						router.push('/');
					}
				})
				.catch(err => {
					this._vm.$log.error(err);
					reject(err);
				});
		});
	},

	async nextRound({ dispatch, state }) {
		this._vm.$log.debug('game/nextRound');

		await dispatch('decks/unload', {}, { root: true });

		return api.games.nextRound(state.id);
	},

	async quarrelWinner({ commit, dispatch, state }) {
		if (!state.quarrelCards.current.length) {
			try {
				await dispatch('resetAction');
			} catch (err) {
				throw new Error(err);
			}

			return false;
		}

		const quarrelGroup = groupBy(state.quarrelCards.current, data => {
			// User had no cards, so the card property will be 'null'
			if (!data.card) {
				return -1;
			}

			return data.card.name === 'golden' ? 6 : data.card.amount;
		});
		const winningCard = max(keys(quarrelGroup));
		const winners = quarrelGroup[winningCard];

		this._vm.$log.debug(quarrelGroup, winners);

		commit(mutationTypes.game.UPDATE, { showQuarrel: true });

		if (winners.length === 1) {
			const cards = map(state.quarrelCards.saved, obj => {
				return obj.card;
			});

			const winner = winners[0].playerId;

			this._vm.$log.debug('cards -> ', cards);

			// Wait until cards are shown to display winner
			// prettier-ignore
			setTimeout(async() => {
				try {
					await dispatch(
						'players/setQuarrelWinner',
						{
							id: winner,
							cards,
						},
						{ root: true },
					);

					// Wait some time after winner has been set before resetting
					commit(mutationTypes.game.UPDATE, {
						showQuarrel: false,
						quarrelCards: { current: [], saved: [] },
					});

					await dispatch('resetAction');

					await dispatch(
						'players/resetQuarrelWinner',
						{ id: winner },
						{ root: true },
					);
				} catch (err) {
					throw new Error(err);
				}
			}, 3500);
		} else {
			const players = map(winners, obj => obj.playerId);

			setTimeout(() => {
				// Reset current quarrelCards
				commit(mutationTypes.game.UPDATE, {
					quarrelCards: {
						current: [],
						saved: state.quarrelCards.saved,
					},
					showQuarrel: false,
				});

				dispatch('players/startQuarrel', { players }, { root: true });
			}, 4000);
		}
	},

	async reset({ dispatch, state }) {
		try {
			await dispatch('decks/unload', {}, { root: true });

			return api.games.reset(state.id);
		} catch (err) {
			throw new Error(err);
		}
	},

	async resetAction({ state }) {
		this._vm.$log.debug(state);

		try {
			// const actionCardId = state.actionCard.id;

			await api.games.actionCard(state.id, null);

			// Add current action card to the 'discard' deck
			// await dispatch(
			// 	'decks/addCard',
			// 	{ type: 'discard', cardId: actionCardId },
			// 	{ root: true },
			// );
		} catch (err) {
			this._vm.$toasted.error(err);
			throw new Error(err);
		}
	},

	async start({ dispatch, state }) {
		const dealPromises = [];

		this._vm.$log.debug('game/start', state);

		await api.games.update(state.id, { isDealing: true });

		await api.games
			// Returns after all decks have been initialized
			.shuffleDecks(state.id, state.playerIds)
			.then(async res => {
				this._vm.$log.debug('game/shuffleDecks -> ', res);
				const gameData = res.data;

				try {
					await dispatch(
						'decks/load',
						{ ids: gameData.deckIds },
						{ root: true },
					);
				} catch (err) {
					throw new Error(err);
				}

				// Loop through each player and deal cards
				// Each deal will be saved as a Promise so we can wait
				// for all players to be dealt cards before starting game
				for (const playerId of state.playerIds) {
					dealPromises.push(
						// prettier-ignore
						dispatch(
							'decks/dealCards',
							playerId,
							{ root: true },
						),
					);
				}

				// prettier-ignore
				Promise.all(dealPromises)
					.then(() => {
						dispatch('decks/cardsDealt', null, { root: true })
							.then(async() => {
								// All players and decks have been updated, game can start
								await api.games.update(state.id, { isDealing: false });
								await api.games.start(state.id);
								dispatch('players/nextPlayer', null, { root: true });
							});
					})
					.catch(err => {
						throw new Error(err);
					});
			})
			.catch(err => {
				throw new Error(err);
			});
	},

	setQuarrelCount({ commit }, count) {
		commit(mutationTypes.game.UPDATE, { quarrelCount: count });
	},

	/**
	 * Unload the current local game state, this will
	 * only affect current player. Since the player is
	 * being removed, we need to add their cards back into
	 * the main deck.
	 *
	 * @returns {Object} 	Promise
	 */
	unload({ commit, dispatch, state, rootState }) {
		const playerIds = state.playerIds;
		const updatedPlayerIds = without(playerIds, rootState.localPlayer.id);

		return api.games
			.updatePlayers(state.id, updatedPlayerIds)
			.then(async() => {
        // eslint-disable-line
				await dispatch(
					'players/updateGame',
					{
						id: rootState.localPlayer.id,
						gameId: null,
					},
					{ root: true },
				);

				commit(mutationTypes.game.INIT);
			})
			.catch(err => {
				this._vm.$log.error(err);
			});
	},

	// eslint-disable-next-line
  update({}, data) {
		return api.games.update(state.id, data);
	},
};

const mutations = {
	[mutationTypes.game.INIT](state) {
		for (const prop in initialState) {
			Vue.set(state, prop, initialState[prop]);
		}

		Vue.set(state, 'isLoaded', false);
	},

	[mutationTypes.game.LOADED](state) {
		state.isLoaded = true;
	},

	[mutationTypes.game.TOGGLE_DRAW_CARD](state, toggle) {
		Vue.$log.debug('TOGGLE_DRAW_CARD', state.isDrawingCard, toggle);
		state.isDrawingCard = toggle;
	},

	[mutationTypes.game.UPDATE](state, payload) {
		Vue.$log.debug('mutation::game/update', state, payload);

		if (isEmpty(payload)) {
			Vue.$log.warn('Empty payload for "UPDATE"!');
		}

		const prevPlayerCount = state.playerIds.length;

		for (const prop in payload) {
			if (Object.prototype.hasOwnProperty.call(state, prop)) {
				if (Array.isArray(state[prop])) {
					state[prop] = [...payload[prop]];
				} else {
					Vue.set(state, prop, payload[prop]);
				}

				if (prop === 'playerIds') {
					const newPlayerCount = payload[prop].length;
					const countDiff = newPlayerCount - prevPlayerCount;

					if (countDiff !== 0) {
						const msg = 'Player ' + (countDiff > 0 ? 'joined' : 'left') + '!';

						this._vm.$toasted.info(msg, { duration: 500 });
					}
				}
			}
		}

		state.startDate = state.updatedAt;
	},
};

export default {
	namespaced: true,
	state,
	getters,
	actions,
	mutations,
};
