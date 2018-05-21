<template>
	<b-container fluid class="header">
		<b-row>
			<b-col class="header-item game-start">Started @ {{createdAt}}</b-col>
			<b-col class="header-item game-round">ROUND: {{roundNumber}}</b-col>
			<b-col class="header-item settings">
				<b-dropdown id="dropdown-settings" variant="info" no-caret>
					<template slot="button-content">
						<span class="icon icon-settings glyphicon glyphicon-cog"></span>
					</template>
					<b-dropdown-item @click="onSettingClick('toggleSound')">
						<i class="icon icon-mute glyphicon"
							v-bind:class="{
								'glyphicon-volume-off': sound.isEnabled,
								'glyphicon-volume-down': !sound.isEnabled
							}">
						</i>
						<span v-if="sound.isEnabled">Disable Sounds</span>
						<span v-else>Enable Sounds</span>
					</b-dropdown-item>
				</b-dropdown>
			</b-col>
		</b-row>
	</b-container>
</template>

<script>
import { mapState } from 'vuex';

import bDropdown from 'bootstrap-vue/es/components/dropdown/dropdown';

export default {
	name: 'BoardHeader',
	components: {
		'b-dropdown': bDropdown,
	},
	props: ['isGameStarted'],
	data: function() {
		return {};
	},
	computed: {
		...mapState('game', ['createdAt', 'roundNumber']),
		...mapState({
			// This is required for nested modules
			// @see https://github.com/vuejs/vuex/issues/459
			sound: state => state.sound,
		}),
	},
	methods: {
		onSettingClick: function(event) {
			this.$log.debug(event);
		},
	},
};
</script>

<style lang="scss">
header {
	background-image: linear-gradient(
			94deg,
			rgba(91, 33, 5, 0.1) 0%,
			rgba(83, 29, 4, 0.32) 23%,
			rgba(74, 24, 3, 0.41) 47%,
			rgba(80, 27, 5, 0.44) 70%,
			rgba(81, 27, 5, 0.59) 74%,
			rgba(93, 33, 4, 0.2) 83%,
			rgba(115, 43, 3, 0.5) 100%
		),
		linear-gradient(90deg, get-color('cioccolato') 50%, transparent 50%),
		linear-gradient(
			90deg,
			get-color('red-beech') 50%,
			get-color('carnaby-tan') 50%
		);

	background-size: 40px 160px, 60px 29px, 27px 27px;
	color: get-color(white);
	height: 4rem;
	line-height: 2;
	margin: 0 -1rem;
	padding: 0.5rem 1rem;

	.btn-dropdown {
		padding: 0.25rem 0.75rem;
		vertical-align: baseline;
	}
}
</style>
