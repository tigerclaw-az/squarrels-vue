import Vue from 'vue';

const state = {
	createdDate: {
		type: Date,
		required: false,
	},
	isSoundEnabled: {
		type: Boolean,
		required: false,
		default: false,
	},
	roundNumber: {
		type: Number,
		required: false,
		default: 0,
	},
};

const getters = {
	created: () => {
		Vue.$log.info(Vue.$storage);
		return this.createdDate;
	},

	isSoundEnabled: () => {
		return this.isSoundEnabled;
	},

	round: () => {
		return this.roundNumber;
	}
};

const actions = {

};

const mutations = {

};

export default {
	state,
	getters,
	actions,
	mutations,
};
