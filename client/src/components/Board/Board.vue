<template>
	<div id="board">
		<b-container fluid>
			<BoardHeader></BoardHeader>
		</b-container>
		<b-container fluid class="container_board">
			<b-row class="align-items-center justify-content-center mt-5">
				<b-col cols="3">
					<div class="container_players container_players-left">
						<Player
							v-for="(p, index) in opponents"
							v-if="index % 2 === 0"
							:key="p.id"
							:player="p"
						>
						</Player>
					</div>
				</b-col>
				<b-col cols="6">
					<div class="container_decks">
						<Deck v-if="decksLoaded" v-for="deckId in deckIds" :key="deckId" :id="deckId"></Deck>
					</div>
				</b-col>
				<b-col cols="3">
					<div class="container_players container_players-right">
						<Player
							v-for="(p, index) in opponents"
							v-if="index % 2 !== 0"
							:key="p.id"
							:player="p"
						>
						</Player>
					</div>
				</b-col>
			</b-row>
			<div class="row_current-player">
				<Player :player="currentPlayer"></Player>
			</div>
			<slot name="action"></slot>
		</b-container>
	</div>
</template>

<script>
import { mapState } from 'vuex';
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
		...mapState(['isAdmin']),
		...mapState({
			allPlayers: state => state.players,
			currentPlayer: state => state.localPlayer,
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
#board {
	display: flex;
	flex-flow: column;
}

.container_board {
	border: 1px solid yellow;
}

.container_players {
	border: 1px solid green;
	display: flex;
	flex-flow: column;
	height: 100%;

	.sq-player-thumbnail {
		order: 0;
	}

	.sq-player-info {
		order: 1;
	}

	&.container_players-left {
		.sq-player-thumbnail {
			order: 1;
		}

		.sq-player-info {
			order: 0;
		}
	}
}

.container_decks {
	align-content: center;
	align-items: flex-start;
	border: 1px solid #888;
	display: flex;
	flex-flow: row nowrap;
	justify-content: center;
	padding: 0.5rem;
}

.row_current-player {
	align-items: center;
	display: flex;
	justify-content: center;
	margin-top: 4rem;
	width: 100%;
}
</style>
