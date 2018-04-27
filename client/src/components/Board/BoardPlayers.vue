<template>
	<div class="sq-players-wrapper">
		<!-- <webcam channel="webcam"></webcam> -->
		<div class="sq-players" v-if="players.length >= 2">
			<Player
				v-for="p in playersOrder"
				:key="p.id"
				:class="{ current: p.isCurrent }"
				:player="p"
			></Player>
		</div>
		<div v-else>
			Waiting for other players to join...
		</div>
	</div>
</template>

<script>
// import _ from 'lodash';
import { mapGetters, mapState } from 'vuex';

import Player from '@/components/Player/Player.vue';

export default {
	name: 'BoardPlayers',
	components: {
		Player,
	},
	props: ['isGameStarted'],
	data: function() {
		return {
		}
	},
	mounted: function() {
		this.$log.debug(this);
	},
	computed: {
		...mapState('game', ['isStarted']),
		...mapState('players', ['players']),
		playersOrder: function() {
			return this.players;
		},
	},
	methods: {

	}
}
</script>

<style lang="scss">
	.sq-players {
		display: flex;
		flex-wrap: wrap;
	}
</style>
