<template>
	<div id="board">
		<div class="container_board">
			<div class="container_players">
				<Player v-for="p in playersInGame" :key="p.id" :player="p" />
			</div>
			<div v-if="gameStatus === 'SHUFFLE'" class="container_shuffle">
				<DeckShuffle
					:cards="shuffleDeck.cards"
					@update:cards-shuffled="cardsShuffled($event)"
				/>
			</div>
			<div v-else class="container_decks">
				<Deck v-for="deckId in deckIds" :id="deckId" :key="deckId" />
				<slot name="action"></slot>
			</div>
		</div>
		<BoardHeader :round-number="roundNumber"></BoardHeader>
	</div>
</template>

<script>
import BoardHeader from '@/components/Board/BoardHeader.vue';
import Deck from '@/components/Deck/Deck.vue';
import DeckShuffle from '@/components/Deck/DeckShuffle.vue';
import Player from '@/components/Player/Player.vue';

export default {
	name: 'board',
	components: {
		BoardHeader,
		Deck,
		DeckShuffle,
		Player,
	},
	props: {
		deckIds: {
			type: Array,
			required: true,
		},
		gameStatus: {
			type: String,
			default: null,
		},
		playersInGame: {
			type: Array,
			required: true,
		},
		roundNumber: {
			type: Number,
			required: true,
		},
	},
	data() {
		return {
			shuffleDeck: {
				cards: Array(120),
			},
		};
	},
	methods: {
		cardsShuffled(val) {
			this.$log.debug('cards-shuffled:Board -> ', val, this);
			this.$store.dispatch('decks/cardsShuffled');
		},
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
	height: 100vh;
	object-fit: contain;
	object-position: center;
	overflow: hidden;
	position: relative;
}

.container_board {
	display: flex;
	flex-direction: row;
	height: 100%;
	place-content: center space-between;
	position: relative;
}

.container_players {
	align-items: flex-start;
	display: flex;
	flex: 1 0 50%;
	flex-flow: column;
	height: calc(100% - 2rem);
	place-content: start space-between;
	padding-left: 1rem;
}

.container_shuffle {
	left: 50%;
	position: absolute;
	top: 25%;
}

.container_decks {
	display: flex;
	flex: 0 1 100%;
	flex-flow: row wrap;
	place-content: center center;
	position: relative;
	min-height: 0;
	min-width: 425px;
}
</style>
