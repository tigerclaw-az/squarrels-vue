<template>
	<div class="sq-board-players">
		<!-- <webcam channel="webcam"></webcam> -->
		<div class="sq-players">
			<Player
				v-for="p in playersOrder"
				:key="p.id"
				:player="p">
			</Player>
		</div>
	</div>
</template>

<script>
import _ from 'lodash';
import { mapGetters, mapState } from 'vuex';
import { config } from '@/config';

import Player from '@/components/Player/Player.vue';

export default {
	name: 'BoardPlayers',
	props: {
		isGameStarted: {
			type: Boolean,
			required: true,
		},
		gameId: {
			type: String,
			required: true,
		},
	},
	data: function() {
		return {};
	},
	watch: {
		isGameLoaded: function() {
			if (this.needMorePlayers && !this.playerExists) {
				this.$store.dispatch({
					type: 'game/addPlayer',
					gameId: this.gameId,
					playerId: this.currentPlayer.id,
				});
			}
		},

		playerIdsInGame: function() {
			this.$store.dispatch({
				type: 'players/load',
				ids: this.playerIdsInGame,
			});
		},
	},
	created: function() {},
	mounted: function() {
		this.$log.debug(this);

		// TODO: Remove player from game
		window.addEventListener('beforeunload', () => {
			this.$log.debug('unloaded!', this.playerIdsInGame);
		});
	},
	computed: {
		...mapState({
			currentPlayer: state => state.localPlayer,
			isGameLoaded: state => state.game.isLoaded,
			playerIdsInGame: state => state.game.playerIds,
			allPlayers: state => state.players,
		}),
		needMorePlayers: function() {
			return this.playerIdsInGame.length < config.MAX_PLAYERS;
		},
		playerExists: function() {
			return this.playerIdsInGame.filter(
				pl => pl === this.currentPlayer.id
			).length;
		},
		playersInGame: function() {
			return _.filter(this.allPlayers, pl =>
				_.includes(this.playerIdsInGame, pl.id)
			);
		},
		playersOrder: function() {
			// TODO: Sort by this.currentPlayer.id and then by nextPlayer order
			return _.sortBy(
				this.playersInGame,
				pl => pl.id !== this.currentPlayer.id
			);
		},
	},
	methods: {},
	components: {
		Player,
	},
};
</script>

<style lang="scss" scoped>
.sq-board-players {
	padding: 1rem;

	.sq-players {
		display: flex;
		flex-wrap: wrap;
		flex: 1 0 100%;
	}
}
</style>
