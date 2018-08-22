<template>
	<div id="board">
		<b-container fluid>
			<BoardHeader></BoardHeader>
			<b-row>
				<b-col cols="2">
					<div class="container_players-left">
						<Player
							v-for="(p, index) in opponents"
							v-if="index % 2 === 0"
							:key="p.id"
							:player="p"
						>
						</Player>
					</div>
				</b-col>
				<b-col cols="8">
					<div class="container_decks">
						<Deck v-if="decksLoaded" v-for="deckId in deckIds" :key="deckId" :id="deckId"></Deck>
					</div>
				</b-col>
				<b-col cols="2">
					<div class="container_players-right">
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
			<b-row>
				<Player :player="currentPlayer"></Player>
			</b-row>
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
.container_decks {
	align-content: center;
	align-items: flex-start;
	display: flex;
	flex-flow: row nowrap;
	justify-content: center;
	padding: 0.5rem;
}
</style>
