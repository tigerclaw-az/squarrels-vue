<template>
	<div class="sq-players-wrapper">
		<!-- <webcam channel="webcam"></webcam> -->
		<div class="sq-players" v-if="playersInGame.length >= 2">
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
import { config } from '@/config';
import Player from '@/components/Player/Player.vue';

export default {
	name: 'BoardPlayers',
	components: {
		Player,
	},
	props: ['isGameStarted', 'gameId'],
	data: function() {
		return {
		}
	},
	watch: {
		isGameLoaded() {
			// TODO: If current player doesn't exist in game.players, then
			if (this.needMorePlayers() && !this.playerExists()) {
				this.$store.dispatch({
					type: 'game/addPlayer',
					gameId: this.gameId,
					playerId: this.currentPlayer.id,
				});
			}
		}
	},
	created: function() {

	},
	mounted: function() {
		this.$log.debug(this);

		// TODO: Remove player from game
		window.addEventListener('beforeunload', () => {
			this.$log.debug('unloaded!', this.players);
		});
	},
	computed: {
		...mapGetters({
			getPlayerByProp: 'players/get',
		}),
		...mapState({
			currentPlayer: state => state.localPlayer,
			isGameLoaded: state => state.game.isLoaded,
			playersInGame: state => state.game.players,
		}),
		playersOrder: function() {
			// TODO: Sort by this.currentPlayer.id and then by nextPlayer order
			return this.playersInGame;
		},
	},
	methods: {
		needMorePlayers: function() {
			return this.playersInGame.length < config.MAX_PLAYERS;
		},
		playerExists: function() {
			return this.playersInGame.filter(pl => pl === this.currentPlayer.id ).length;
		},
	}
}
</script>

<style lang="scss">
	.sq-players {
		display: flex;
		flex-wrap: wrap;
	}
</style>
