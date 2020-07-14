import { Howl } from 'howler';
import Vue from 'vue';

import audiospriteConfig from '@/assets/sounds/audiosprite.json';
import mutationTypes from '@/store/mutation-types';

const howlConfig = Object.assign({}, audiospriteConfig, {
	// pool: 1,
	onload: function() {
		Vue.$log.info('audio::onload', this.state());
	},
	onloaderror: function(error) {
		Vue.$log.info('audio::onload', this.state(), error);
	},
	onplayerror: function(id, err) {
		Vue.$log.error('audio::onplayerror -> ', id, err);
	},
	onplay: function(id) {
		Vue.$log.info('audio::onplay -> ', id);
	},
	onend: id => {
		Vue.$log.info('audio::onend -> ', id);
	},
});

const audio = new Howl(howlConfig);

const state = {
	isEnabled: true,
};

const getters = {};

const actions = {
	play({ state }, name) {
		if (!audiospriteConfig.sprite[name]) {
			throw new Error(`Unknown sprite sound for '${name}'`);
		}

		this._vm.$log.debug('audio::play', state, audio, name);

		if (state.isEnabled) {
			const id = audio.play(name);

			this._vm.$log.info('audio::id -> ', id);
		}
	},
	toggle: ({ commit }) => {
		commit(mutationTypes.sounds.TOGGLE);
	},
};

const mutations = {
	[mutationTypes.sounds.TOGGLE]: state => {
		state.isEnabled = !state.isEnabled;
	},
};

export default {
	namespaced: true,
	state,
	getters,
	actions,
	mutations,
};
