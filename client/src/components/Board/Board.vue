<template>
	<div id="board">
		<BoardHeader></BoardHeader>
		<b-container fluid class="container_board">
			<div class="container_players">
				<Player v-for="p in playersInGame" :key="p.id" :player="p" />
			</div>
			<div class="container_decks">
				<Deck v-for="deckId in deckIds" :id="deckId" :key="deckId" />
			</div>
			<slot name="action"></slot>
		</b-container>
	</div>
</template>

<script>
import { mapState, mapGetters } from 'vuex';
import { filter, includes } from 'lodash';

import BoardHeader from '@/components/Board/BoardHeader.vue';
import Deck from '@/components/Deck/Deck.vue';
import Player from '@/components/Player/Player.vue';

export default {
	name: 'board',
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
		playerIds: {
			type: Array,
			required: true,
		},
	},
	data() {
		return {};
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
			return filter(this.allPlayers, pl =>
				includes(this.playerIdsInGame, pl.id),
			);
		},
		opponents: function() {
			return filter(this.playersInGame, pl => pl.id !== this.currentPlayer.id);
		},
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
	position: relative;
}

.container_board {
	align-content: center;
	display: flex;
	height: 100%;
	justify-content: center;
	position: relative;
}

.container_players {
	align-items: flex-start;
	display: flex;
	height: 100%;
	position: absolute;
	width: 100%;
	// display: flex;
	// flex-flow: column;
	// height: 100%;
	// margin-top: 6rem;
}

.container_decks {
	align-content: center;
	// align-items: flex-start;
	display: flex;
	flex-flow: row nowrap;
	justify-content: center;
	padding: 0.5rem;
	min-width: 30rem;
}

.row_current-player {
	// Put player container at very bottom of <Board> container
	bottom: 0;
	display: flex;
	// position: absolute;
	width: 100%;
}
</style>
