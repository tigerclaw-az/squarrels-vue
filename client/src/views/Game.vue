<template>
	<div id="board">
		<div v-if="!isStarted" class="game-overlay" :class="{ winter: isWinter }">
			<div class="game-overlay--start-game" v-cloak v-if="!isLoading && !isWinter">
				<div v-if="needPlayers" class="waiting-message">
					Waiting for other players to join...
				</div>
				<b-button v-else
					class="btn btn-start-game"
					variant="success"
					@click="onClickStartGame">
					START GAME
				</b-button>
			</div>
			<div class="game-overlay--new-game" v-if="isWinter">
				<div class="container-button">
					<b-button
						class="btn btn-new-game"
						variant="success"
						@click="onClickNewGame"
					>
					NEW GAME
					</b-button>
				</div>
			</div>
		</div>
		<b-container fluid>
			<BoardHeader :is-game-started="isStarted"></BoardHeader>
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
				this.isLoading = false;
				this.$store.dispatch({ type: 'decks/load', ids: this.deckIds });
			}
		},
	},
	mounted: function() {
		this.$store.dispatch({ type: 'game/load', id: this.id });

		// Need to unload current game from player if they leave
		window.onbeforeunload = () => {
			this.unload();
		};
	},
	beforeDestroy: function() {
		this.unload();
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
		onClickStartGame: function(evt) {
			this.$log.debug('onClickStartGame', evt);
			this.isLoading = true;
			this.$store.dispatch({ type: 'game/start' });
		},
		onClickNewGame: async function(evt) {
			this.$log.debug('onClickStartGame', evt);
			this.isLoading = true;

			try {
				await this.$store.dispatch({ type: 'game/reset' });
				this.$store.dispatch({ type: 'game/start' });
			} catch (err) {
				this.$log.error(err);
				this.$toasted.error(err.message);
			}
		},
		unload: function() {
			// Only unload if the current game was valid
			if (this.id) {
				this.$store.dispatch({ type: 'game/unload' });
				this.$store.dispatch({ type: 'decks/unload', gameId: this.id });
			}
		},
	},
};
</script>

<style lang="scss" src="./game.scss">
</style>
