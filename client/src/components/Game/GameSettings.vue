<template>
	<b-dropdown id="dropdown-game-settings" variant="primary">
		<template slot="button-content">
			<icon name="cog" class="icon icon-settings" label="Settings" />
		</template>
		<b-dropdown-item @click="onClickSetting('toggleSound')">
			<icon :name="getIcon('sound')" class="icon icon-sound" label="Sound" />
			<span v-if="sound.isEnabled">Sounds Off</span>
			<span v-else>Sounds On</span>
		</b-dropdown-item>
		<b-dropdown-item>
			<router-link to="/">
				Leave Game
			</router-link>
		</b-dropdown-item>
	</b-dropdown>
</template>

<script>
import { mapState } from 'vuex';

import Icon from 'vue-awesome/components/Icon';
import { BDropdown } from 'bootstrap-vue';

export default {
	name: 'game-settings',
	components: {
		'b-dropdown': BDropdown,
		'icon': Icon,
	},
	computed: {
		...mapState({
			// This is required for nested modules
			// @see https://github.com/vuejs/vuex/issues/459
			sound: state => state.sound,
		}),
	},
	methods: {
		getIcon: function(name) {
			switch (name) {
				case 'sound':
					return 'volume-' + (this.sound.isEnabled ? 'up' : 'off');
			}
		},
		onClickSetting: function(name) {
			switch (name) {
				case 'toggleSound':
					this.$store.dispatch('sound/toggle');
					break;

				default:
					this.$log.warn('Option not configured!');
					break;
			}
		},
	},
};
</script>
