import Vue from 'vue';

const state = {
	id: null,
	createdDate: null,
	isSoundEnabled: true,
	roundNumber: 0,
};

const getters = {
	created: (state) => {
		Vue.$log.info(Vue.$storage);
		return state.createdDate;
	},

	isSoundEnabled: (state) => {
		return state.isSoundEnabled;
	},

	round: (state) => {
		return state.roundNumber;
	}
};

const actions = {

};

const mutations = {

};

export default {
	namespaced: true,
	state,
	getters,
	actions,
	mutations,
};
