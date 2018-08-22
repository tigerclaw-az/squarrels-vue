<template>
	<div id="board">
		<b-container fluid>
			<BoardHeader></BoardHeader>
			<b-row>
				<b-col>
					<div class="decks-container">
						<Deck v-if="decksLoaded" v-for="deckId in deckIds" :key="deckId" :id="deckId"></Deck>
					</div>
				</b-col>
			</b-row>
			<b-row>
				<b-col>
					<BoardPlayers :gameId="gameId"></BoardPlayers>
				</b-col>
			</b-row>
		</b-container>
		<slot name="action"></slot>
	</div>
</template>

<script>
import { mapState } from 'vuex';

import BoardHeader from '@/components/Board/BoardHeader.vue';
import BoardPlayers from '@/components/Board/BoardPlayers.vue';
import Deck from '@/components/Deck/Deck.vue';

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
	mounted: function() {
		this.$store.dispatch({ type: 'decks/load', ids: this.deckIds });
	},
	computed: {
		...mapState(['isAdmin']),
		...mapState({
			decks: state => state.decks,
		}),
		decksLoaded: function() {
			return this.decks.isLoaded;
		},
		needPlayers: function() {
			return this.playerIds.length < 2;
		},
	},
	unload: function() {
		this.$store.dispatch({ type: 'decks/unload', gameId: this.gameId });
	},
	components: {
		BoardHeader,
		BoardPlayers,
		Deck,
	},
};
</script>

<style lang="scss" scoped>
</style>
