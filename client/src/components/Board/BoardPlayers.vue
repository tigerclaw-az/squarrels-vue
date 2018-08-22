<template>
	<div class="sq-board-players">
		<!-- <webcam channel="webcam"></webcam> -->
		<div class="sq-players">
			<Player
				v-for="p in playersOrder"
				:key="p.id"
				:player="p">
			</Player>
			<player-storage-modal v-for="(p, index) in playersOrder"
				:key="index" :player="p"></player-storage-modal>
		</div>
	</div>
</template>

<script>
import _ from 'lodash';
import { mapState } from 'vuex';
import { config } from '@/config';

import Player from '@/components/Player/Player.vue';
import PlayerStorageModal from '@/components/Player/PlayerStorageModal.vue';

export default {
	name: 'BoardPlayers',
	props: {
		gameId: {
			type: String,
			required: true,
		},
	},
	data: function() {
		return {};
	},
	watch: {
		playerIdsInGame: function() {
			this.$store.dispatch({
				type: 'players/load',
				ids: this.playerIdsInGame,
			});
		},
	},
	mounted: function() {
		this.$log.debug(this);

		if (this.needMorePlayers && !this.playerExists) {
			this.$store.dispatch({
				type: 'game/addPlayer',
				gameId: this.gameId,
				playerId: this.currentPlayer.id,
			});
		}
	},
	computed: {
		...mapState({
			currentPlayer: state => state.localPlayer,
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
		'player-storage-modal': PlayerStorageModal,
	},
};
</script>

<style lang="scss" scoped>
.sq-board-players {
	.sq-players {
		display: flex;
		flex: 1 0 100%;
		flex-wrap: wrap;
	}
}
</style>
