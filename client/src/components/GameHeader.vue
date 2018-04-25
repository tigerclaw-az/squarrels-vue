<template>
	<b-container class="header">
		<b-row>
			<b-col class="header-item game-start">Started @ {{created}}</b-col>
			<b-col class="header-item game-round">ROUND: {{round}}</b-col>
			<b-col class="header-item settings">
				<b-dropdown id="dropdown-settings" class="btn btn-default btn-dropdown" type="button">
					<!-- <i class="icon icon-settings glyphicon glyphicon-cog"></i> -->
					<b-dropdown-item>
						<i class="icon icon-mute glyphicon"
							v-bind:class="{
								'glyphicon-volume-off': isSoundEnabled,
								'glyphicon-volume-down': !isSoundEnabled
							}">
						</i>
						<span v-if="isSoundEnabled">Disable Sounds</span>
						<span v-if="!isSoundEnabled">Enable Sounds</span>
					</b-dropdown-item>
				</b-dropdown>
			</b-col>
		</b-row>
	</b-container>
</template>

<script>
import { mapGetters } from 'vuex';
import bDropdown from 'bootstrap-vue/es/components/dropdown/dropdown'

export default {
	name: 'GameHeader',
	components: {
		'b-dropdown': bDropdown,
	},
	created() {
		// this.$log.debug(this);
	},
	computed: {
		...mapGetters({
			created: 'game/created',
			isSoundEnabled: 'game/isSoundEnabled',
			round: 'game/round'
		})
	},
	methods: {
		onSettingClick: function(event) {
			this.$log.debug(event);
		},
	},
};
</script>
