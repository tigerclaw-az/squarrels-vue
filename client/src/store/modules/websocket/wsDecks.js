import { isEmpty } from 'lodash';

import mutationTypes from '@/store/mutation-types';

const state = {};

const getters = {};

const actions = {
	actioncard_winter({ dispatch }) {
		dispatch('game/end');
	},
	update({ commit }, data) {
		if (data.nuts && !isEmpty(data.nuts)) {
			commit(`decks/${mutationTypes.decks.UPDATE}`, data.nuts, { root: true });
		}
	},
	reset({ dispatch }) {
		dispatch('decks/unload', {}, { root: true });
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
