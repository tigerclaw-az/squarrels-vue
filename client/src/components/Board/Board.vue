<template>
	<div id="board">
		<div class="container_board">
			<div class="container_players">
				<Player v-for="p in playersInGame" :key="p.id" :player="p" />
			</div>
			<div class="container_decks">
				<Deck v-for="deckId in deckIds" :id="deckId" :key="deckId" />
				<slot name="action"></slot>
			</div>
		</div>
		<BoardHeader></BoardHeader>
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
	background-color: color("mine-shaft");
	// prettier-ignore
	background-image: url("~@/assets/images/board-bg.jpg");
	background-size: 100%;
	display: flex;
	flex: 1 1 0;
	flex-direction: column;
	height: 100%;
	object-fit: contain;
	object-position: center;
	overflow: hidden;
	position: relative;
}

.container_board {
	align-items: center;
	display: flex;
	flex-direction: row;
	height: 100%;
	position: relative;
}

.container_players {
	align-items: flex-start;
	display: flex;
	flex: 1 0 50%;
	height: 100%;
	padding-left: 1rem;
	flex-flow: column;
}

.container_decks {
	align-items: center;
	display: flex;
	flex: 0 1 100%;
	flex-flow: row wrap;
	justify-content: center;
	position: relative;
	min-height: 0;
	min-width: 425px;
	z-index: 99;
}
</style>
