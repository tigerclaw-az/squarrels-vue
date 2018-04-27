import vm from 'vue';

const state = {

};

const getters = {

};

const actions = {
	create({ commit }, data) {
		vm.$log.debug(data);
	}
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
