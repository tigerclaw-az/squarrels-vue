<template>
	<div id="board">
		<div v-if="!isStarted && !isDealing" class="overlay-text" v-cloak>
			<div v-if="needPlayers" class="waiting-message">
				Waiting for other players to join...
			</div>
			<button v-else
				class="btn btn-info btn-start-game"
				@click="onClickStartGame">
				START GAME
			</button>
		</div>
		<div v-if="!isStarted && !isDealing" class="start-game-overlay"></div>
		<BoardHeader v-if="isStarted"></BoardHeader>
		<canvas v-if="actionCard && actionCard.name === 'winter'" class="winter-snow"></canvas>
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
				<transition>
					<ActionCard v-if="actionCard"></ActionCard>
				</transition>
			</b-col>
		</b-row>
		<b-row>
			<b-col>
				<div class="admin-options" v-if="isAdmin && isStarted">
					<b-dropdown id="dropdown-options" variant="info" text="Option">
						<b-dropdown-item @click="onClickAdminOption('reset-game')">Reset Game</b-dropdown-item>
						<b-dropdown-item @click="onClickAdminOption('reset-hoard')">Reset Hoard</b-dropdown-item>
						<b-dropdown-item @click="onClickAdminOption('reset-player-cards')">Reset Player Cards</b-dropdown-item>
						<b-dropdown-item @click="onClickAdminOption('skip-player')">Skip Player</b-dropdown-item>
					</b-dropdown>
				</div>
			</b-col>
		</b-row>
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
		return {};
	},
	watch: {
		actionCard: function() {
			let hoardDeck = this.$store.getters['decks/getByType']('discard');

			this.$store.dispatch('sound/play', 'action-card');

			switch (this.actionCard) {
				case 'communism':
					break;

				case 'quarrel':
					break;

				case 'winter':
					break;
			}
		},
		isStarted: function() {
			this.$store.dispatch({ type: 'decks/load', ids: this.deckIds });
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
			'instantAction',
			'playerIds',
		]),
		...mapState(['isAdmin']),
		needPlayers: function() {
			return this.playerIds.length < 2;
		},
	},
	methods: {
		onClickAdminOption: function(name) {
			this.$log.debug(name);
		},
		onClickStartGame: function(e) {
			this.$log.debug('onClickStartGame', e);
			this.$store.dispatch({ type: 'game/start' });
		},
	},
};
</script>

<style lang="scss" src="./game.scss">
</style>
