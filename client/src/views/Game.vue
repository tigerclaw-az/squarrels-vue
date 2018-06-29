<template>
	<div id="board">
		<div v-if="!isStarted && !isLoading" class="start-game-overlay">
			<div class="overlay-text" v-cloak>
				<div v-if="needPlayers" class="waiting-message">
					Waiting for other players to join...
				</div>
				<button v-else
					class="btn btn-info btn-start-game"
					@click="onClickStartGame">
					START GAME
				</button>
			</div>
		</div>
		<b-container fluid>
			<BoardHeader :is-game-started="isStarted"></BoardHeader>
			<img v-if="isWinter" class="winter-snow" src="https://media.giphy.com/media/gvKru3mU4wLFm/giphy.gif">
			<b-row>
				<b-col>
					<div class="decks-container">
						<Deck v-for="deckId in deckIds" :key="deckId" :id="deckId"></Deck>
					</div>
				</b-col>
			</b-row>
			<b-row>
				<b-col>
					<BoardPlayers :isGameStarted="isStarted" :gameId="id"></BoardPlayers>
					<ActionCard v-if="actionCard"></ActionCard>
				</b-col>
			</b-row>
		</b-container>
	</div>
</template>

<script>
import { mapState } from 'vuex';

import bDropdown from 'bootstrap-vue/es/components/dropdown/dropdown';

import ActionCard from '@/components/Card/ActionCard.vue';
import Deck from '@/components/Deck/Deck.vue';
import BoardHeader from '@/components/Board/BoardHeader.vue';
import BoardPlayers from '@/components/Board/BoardPlayers.vue';

// TODO: Validate player can join if there are less than 6 players
export default {
	name: 'Game',
	components: {
		'b-dropdown': bDropdown,
		ActionCard,
		BoardHeader,
		BoardPlayers,
		Deck,
	},
	props: {
		id: {
			type: String,
			required: true,
		},
	},
	data: function() {
		return {
			isLoading: false,
		};
	},
	watch: {
		isStarted: function(to) {
			if (to) {
				this.$store.dispatch({ type: 'decks/load', ids: this.deckIds });
			}
		},
	},
	mounted: function() {
		this.$store.dispatch({ type: 'game/load', id: this.id });
	},
	beforeDestroy: function() {
		// Only unload if the current game was valid
		if (this.id) {
			this.$store.dispatch({ type: 'game/unload' });
			this.$store.dispatch({ type: 'decks/unload', gameId: this.id });
		}
	},
	computed: {
		...mapState('game', [
			'actionCard',
			'deckIds',
			'isDealing',
			'isLoaded',
			'isStarted',
			'playerIds',
		]),
		...mapState(['isAdmin']),
		isWinter: function() {
			return this.actionCard && this.actionCard.name === 'winter';
		},
		needPlayers: function() {
			return this.playerIds.length < 2;
		},
	},
	methods: {
		onClickStartGame: function(e) {
			this.$log.debug('onClickStartGame', e);
			this.isLoading = true;
			this.$store.dispatch({ type: 'game/start' });
		},
	},
};
</script>

<style lang="scss" src="./game.scss">
</style>
