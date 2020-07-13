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
		<BoardHeader :round-number="roundNumber"></BoardHeader>
	</div>
</template>

<script>
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
		return {};
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
