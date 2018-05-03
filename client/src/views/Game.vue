<template>
	<div id="board">
		<button v-if="!isStarted"
			class="btn btn-info btn-start-game"
			@click="onClickStartGame">
			START GAME
		</button>
		<div v-if="players.length < 2">
			Waiting for other players to join...
		</div>
		<div v-if="!isStarted" class="start-game-overlay"></div>
		<BoardHeader v-if="isLoaded"></BoardHeader>
		<canvas v-if="actionCard && actionCard.name === 'winter'" class="winter-snow"></canvas>
		<b-row>
			<b-col>
				<div class="decks-container">
					<Deck v-for="deckId in decks" :key="deckId" :deckId="deckId"></Deck>
				</div>
			</b-col>
		</b-row>
		<b-row>
			<b-col>
				<BoardPlayers :isGameStarted="isStarted" :gameId="id"></BoardPlayers>
				<ActionCard></ActionCard>
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
import { mapGetters, mapState } from 'vuex';

import bDropdown from 'bootstrap-vue/es/components/dropdown/dropdown'

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
		}
	},
	data: function() {
		return {
		};
	},
	watch: {
		isLoaded: function() {
			this.$store.dispatch({ type: 'decks/load', ids: this.decks });
		}
	},
	beforeDestroy: function() {
		this.$store.dispatch({ type: 'game/unload', id: this.id });
		this.$store.dispatch({ type: 'decks/unload', id: this.id });
	},
	mounted: function() {
		this.$store.dispatch({ type: 'game/load', id: this.id });
	},
	computed: {
		...mapState('game', [
			'actionCard',
			'decks',
			'isLoaded',
			'isStarted',
			'instantAction',
			'players',
		]),
		...mapState([ 'isAdmin' ]),
	},
	methods: {
		onClickAdminOption: function(name) {
			this.$log.debug(name);
		},
		onClickStartGame: function() {
			this.$store.dispatch({ type: 'game/start' });
		}
	},
};
</script>

<style lang="scss">
	@import '~@/assets/scss/variables';

	.winter-snow {
		background-image: linear-gradient(bottom, get-color('danube') 0%, get-color('matisse') 84%);
		left: 0;
		position: absolute;
		top: 0;
	}

	.start-game-overlay {
		background-color: get-color('mine-shaft');
		height: auto !important;
		height: 100%;
		margin: 0 auto -20px;
		min-height: 100%;
		opacity: .7;
		position: fixed;
		width: 100%;
		z-index: 60;
	}

	.btn-start-game {
		position: absolute;
		z-index: 80;
	}

	.decks-container {
		// @include clearfix;

		display: flex;
		flex-direction: columns;
		margin-bottom: 1.5rem;
		margin-top: 2.5rem;
		padding: 1rem;
	}

	.game-buttons {
		position: absolute;
		z-index: 5;
	}
</style>
