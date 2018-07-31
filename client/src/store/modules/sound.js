const SOUNDS_PATH = '/sounds/';
const SOUND_EFFECTS = {
	'action-card': 'action-card.mp3',
	'active-player': 'active-player.mp3',
	discard: 'discard.mp3',
	'draw-card': 'draw-card.mp3',
	'hoard-taken': 'hoard-taken.mp3',
	'new-player': 'new-player.mp3',
	'store-cards': 'store-cards.mp3',
};

let audio = {};

for (const effect in SOUND_EFFECTS) {
	audio[effect] = new Audio(SOUNDS_PATH + SOUND_EFFECTS[effect]);
}

const state = {
	isEnabled: true,
};

const getters = {};

const actions = {
	play({ commit }, name) {
		let soundToPlay = audio[name];

		soundToPlay.play();
	},
	toggle: ({ commit }) => {
		commit('toggle');
	},
};

const mutations = {
	toggle: state => {
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
