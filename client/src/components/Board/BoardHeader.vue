<template>
	<b-container fluid class="header" v-if="isGameStarted">
		<b-row class="align-items-center">
			<b-col class="header-item game-start">{{startDate}}</b-col>
			<b-col class="header-item game-settings">
				<game-settings></game-settings>
				<admin-options v-if="isAdmin"></admin-options>
			</b-col>
			<b-col class="header-item game-round">ROUND: {{roundNumber}}</b-col>
		</b-row>
	</b-container>
</template>

<script>
import { mapState } from 'vuex';
import moment from 'moment';

import bDropdown from 'bootstrap-vue/es/components/dropdown/dropdown';

import Icon from 'vue-awesome/components/Icon';

import AdminOptions from '@/components/AdminOptions.vue';
import GameSettings from '@/components/GameSettings.vue';

export default {
	name: 'BoardHeader',
	components: {
		'admin-options': AdminOptions,
		'b-dropdown': bDropdown,
		'game-settings': GameSettings,
		Icon,
	},
	props: {
		isGameStarted: {
			type: Boolean,
			required: true,
		},
	},
	data: function() {
		return {};
	},
	computed: {
		...mapState(['isAdmin']),
		...mapState('game', ['roundNumber']),
		startDate: function() {
			return moment(this.$store.state.game.startDate).format(
				'dddd, MMMM Do YYYY, h:mm:ss a'
			);
		},
	},
};
</script>

<style scoped lang="scss">
// prettier-ignore
@import "~@/assets/scss/variables";

.header /deep/ {
	// prettier-ignore
	background-image: linear-gradient(
		94deg,
		rgba(91, 33, 5, 0.1) 0%,
		rgba(83, 29, 4, 0.32) 23%,
		rgba(74, 24, 3, 0.41) 47%,
		rgba(80, 27, 5, 0.44) 70%,
		rgba(81, 27, 5, 0.59) 74%,
		rgba(93, 33, 4, 0.2) 83%,
		rgba(115, 43, 3, 0.5) 100%
	),	// prettier-ignore
	linear-gradient(90deg, color("cioccolato") 50%, transparent 50%), // prettier-ignore
	linear-gradient(
		90deg,
		color("red-beech") 50%,
		color("carnaby-tan") 50%
	);

	background-size: 40px 160px, 60px 29px, 27px 27px;
	color: $white;
	padding: 0.5rem 1rem;

	.header-item {
		&.game-settings {
			text-align: center;
		}

		&.game-round {
			text-align: right;
		}
	}

	.btn-dropdown {
		padding: 0.25rem 0.75rem;
		vertical-align: baseline;
	}
}
</style>
