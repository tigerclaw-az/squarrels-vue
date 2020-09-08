import { isEmpty } from 'lodash';

import mutationTypes from '@/store/mutation-types';

const state = {};

const getters = {};

const actions = {
	actioncard_hoard({ dispatch }, data) {
		this._vm.$log.debug(data);

		dispatch('players/collectHoard', data.nuts, { root: true });
	},

	actioncard_quarrel({ dispatch }, data) {
		this._vm.$log.debug(data);

		const quarrelData = {
			...data.nuts,
		};

		dispatch('game/addQuarrelCard', quarrelData, { root: true });
	},

	// eslint-disable-next-line
	create({}, data) {
		this._vm.$log.debug(data);
	},

	getMyCards({ commit }, data) {
		this._vm.$log.debug('wsPlayers/getMyCards', data);

		const id = data.nuts.id;
		const cardsInHand = data.nuts.cardsInHand;

		commit(
			`players/${mutationTypes.players.UPDATE_CARDS}`,
			{ id, cardsInHand },
			{ root: true },
		);
	},

	async reset({ dispatch }, data) {
		this._vm.$log.debug('ws-players:reset', data);

		const playerObj = {
			...data.nuts,
		};

		try {
			await dispatch('players/updateLocalPlayer', playerObj, { root: true });
		} catch (e) {
			this._vm.$log.error(e);
			throw new Error(e);
		}
	},

	// eslint-disable-next-line
	showMessage({}, data) {
		this._vm.$toasted.error(data.nuts);
	},

	async update({ dispatch }, data) {
		this._vm.$log.debug('wsPlayers/update', data);

		if (!isEmpty(data.nuts)) {
			try {
				await dispatch('players/updateLocalPlayer', data.nuts, { root: true });
			} catch (e) {
				this._vm.$log.error(e);
				throw new Error(e);
			}
		}
	},
};

const mutations = {};

export default {
	namespaced: true,
	state,
	getters,
	actions,
	mutations,
};
