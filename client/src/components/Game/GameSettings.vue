<template>
	<b-button-toolbar>
		<b-button-group class="mx-1">
			<b-button class="mx-1" @click="onClickSetting('toggleSound')">
				<icon :name="getIcon('sound')" class="icon icon-sound" label="Sound" />
				<!-- <span v-if="sound.isEnabled">Sounds Off</span>
				<span v-else>Sounds On</span> -->
			</b-button>
			<b-button variant="danger" to="/">
				Quit
			</b-button>
		</b-button-group>
	</b-button-toolbar>
</template>

<script>
import { mapState } from 'vuex';

import Icon from 'vue-awesome/components/Icon';

export default {
	name: 'game-settings',
	components: {
		icon: Icon,
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
