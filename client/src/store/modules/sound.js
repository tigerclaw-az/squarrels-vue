import mutationTypes from '@/store/mutation-types';

const SOUNDS_PATH = '/sounds/';
const SOUND_EFFECTS = {
	'action-card': 'action-card.mp3',
	'action-card--whirlwind': 'action-card--whirlwind.mp3',
	'active-player': 'active-player.mp3',
	'cards-shuffle': 'cards-shuffle.mp3',
	'discard': 'discard.mp3',
	'draw-card': 'draw-card.mp3',
	'hoard-taken': 'hoard-taken.mp3',
	'new-player': 'new-player.mp3',
	'store-cards': 'store-cards.mp3',
};

const audio = {};

for (const effect in SOUND_EFFECTS) {
	audio[effect] = new Audio(`${SOUNDS_PATH}${SOUND_EFFECTS[effect]}`);
}

const state = {
	isEnabled: true,
};

const getters = {};

const actions = {
	play({ state }, name) {
		if (!audio[name]) {
			return;
		}

		const soundToPlay = audio[name];

		if (state.isEnabled) {
			soundToPlay.play();
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
