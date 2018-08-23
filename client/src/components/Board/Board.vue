<template>
	<div id="board">
		<b-container fluid>
			<BoardHeader></BoardHeader>
		</b-container>
		<b-container fluid class="container_board">
			<b-row class="align-items-center justify-content-center mt-4">
				<b-col cols="4" lg="3">
					<div class="container_players">
						<Player v-for="p in opponents" :key="p.id" :player="p"></Player>
					</div>
				</b-col>
				<b-col cols="8" lg="9">
					<div class="container_decks">
						<Deck v-if="decksLoaded" v-for="deckId in deckIds" :key="deckId" :id="deckId"></Deck>
					</div>
					<div class="row_current-player">
						<Player :player="currentPlayer"></Player>
					</div>
				</b-col>
			</b-row>
			<slot name="action"></slot>
		</b-container>
	</div>
</template>

<script>
import { mapState, mapGetters } from 'vuex';
import { config } from '@/config';

import BoardHeader from '@/components/Board/BoardHeader.vue';
import Deck from '@/components/Deck/Deck.vue';
import Player from '@/components/Player/Player.vue';

export default {
	name: 'Board',
	props: {
		deckIds: {
			type: Array,
			required: true,
		},
		gameId: {
			type: String,
			required: true,
		},
		playerIds: {
			type: Array,
			required: true,
		},
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
		this.$store.dispatch({ type: 'decks/load', ids: this.deckIds });

		if (this.needMorePlayers && !this.playerExists) {
			this.$store.dispatch({
				type: 'game/addPlayer',
				gameId: this.gameId,
				playerId: this.currentPlayer.id,
			});
		}
	},
	computed: {
		...mapGetters({
			currentPlayer: 'players/getMyPlayer',
		}),
		...mapState(['isAdmin']),
		...mapState({
			allPlayers: state => state.players,
			decks: state => state.decks,
			playerIdsInGame: state => state.game.playerIds,
		}),
		needMorePlayers: function() {
			return this.playerIdsInGame.length < config.MAX_PLAYERS;
		},
		decksLoaded: function() {
			return this.decks.isLoaded;
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
		opponents: function() {
			return _.filter(
				this.playersInGame,
				pl => pl.id !== this.currentPlayer.id
			);
		},
	},
	unload: function() {
		this.$store.dispatch({ type: 'decks/unload', gameId: this.gameId });
	},
	components: {
		BoardHeader,
		Deck,
		Player,
	},
};
</script>

<style lang="scss" scoped>
// prettier-ignore
@import "~@/assets/scss/variables";

#board {
	background-blend-mode: overlay;
	// prettier-ignore
	background-color: color("kenyan-copper");
	// prettier-ignore
	background-image: url("~@/assets/images/board-bg.jpg");
	background-size: 100%;
	display: flex;
	flex-flow: column;
	object-fit: contain;
	object-position: center;
}

.container_board {
	border: 1px solid yellow;
}

.container_players {
	border: 1px solid green;
	display: flex;
	flex-flow: column;
	height: 100%;
}

.container_decks {
	align-content: center;
	align-items: flex-start;
	display: flex;
	flex-flow: row nowrap;
	justify-content: center;
	padding: 0.5rem;
}

.row_current-player {
	align-items: center;
	display: flex;
	justify-content: center;
	margin-top: 6rem;
	width: 100%;
}
</style>
