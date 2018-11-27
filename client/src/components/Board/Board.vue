<template>
	<div id="board">
		<b-container fluid>
			<BoardHeader v-if="isGameStarted"></BoardHeader>
		</b-container>
		<b-container
			fluid
			class="container_board"
		>
			<b-row class="align-items-center justify-content-center mt-2">
				<b-col
					cols="4"
					lg="3"
				>
					<div class="container_players">
						<Player
							v-for="p in opponents"
							:key="p.id"
							:player="p"
						/>
					</div>
				</b-col>
				<b-col
					cols="8"
					lg="9"
				>
					<div
						v-if="isGameStarted && decksLoaded"
						class="container_decks"
					>
						<Deck
							v-for="deckId in deckIds"
							:key="deckId"
							:id="deckId"
						/>
					</div>
				</b-col>
			</b-row>
			<slot name="action"></slot>
		</b-container>
		<div class="row_current-player">
			<Player :player="currentPlayer"></Player>
		</div>
	</div>
</template>

<script>
import { mapState, mapGetters } from 'vuex';

import BoardHeader from '@/components/Board/BoardHeader.vue';
import Deck from '@/components/Deck/Deck.vue';
import Player from '@/components/Player/Player.vue';

export default {
	name: 'Board',
	components: {
		BoardHeader,
		Deck,
		Player,
	},
	props: {
		deckIds: {
			type: Array,
			required: true,
		},
		gameId: {
			type: String,
			required: true,
		},
		isGameStarted: {
			type: Boolean,
			required: true,
			default: false,
		},
		playerIds: {
			type: Array,
			required: true,
		},
	},
	data() {
		return {
			decksLoaded: false,
		};
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
	watch: {
		isGameStarted: function(from, to) {
			if (to === false) {
				this.decksLoaded = false;
			}
		},
	},
	mounted: function() {
		this.$store
			.dispatch({ type: 'decks/load', ids: this.deckIds })
			.then(() => {
				this.decksLoaded = true;
			});
	},
	unload: function() {
		this.$store.dispatch({ type: 'decks/unload', gameId: this.gameId });
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
	flex: 1 1 0;
	height: 100%;
	// Make sure current player has some space above it, regardless
	// of screen height
	min-height: 560px;
	object-fit: contain;
	object-position: center;
	overflow: hidden;
	padding: 0.5rem;
	position: relative;
}

.container_board {
	position: relative;
}

.container_players {
	display: flex;
	flex-flow: column;
	height: 100%;
	margin-top: 6rem;
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
	// Put player container at very bottom of <Board> container
	bottom: 0;
	display: flex;
	position: absolute;
	width: 100%;
}
</style>
