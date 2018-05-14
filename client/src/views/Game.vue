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

<style lang="scss">
@import '~@/assets/scss/variables';

#board {
	padding: ($grid-gutter-width / 2);
}

.winter-snow {
	background-image: linear-gradient(
		bottom,
		get-color('danube') 0%,
		get-color('matisse') 84%
	);
	left: 0;
	position: absolute;
	top: 0;
}

.overlay-text {
	@extend %center;

	color: $white;
	font-size: 2em;
	z-index: 100;

	.waiting-message {
		animation-name: blink;
		animation-duration: 1.4s;
		animation-iteration-count: infinite;
		/**
			* This makes sure that the starting style (opacity: .2)
			* of the animation is applied before the animation starts.
			* Otherwise we would see a short flash or would have
			* to set the default styling of the dots to the same
			* as the animation. Same applies for the ending styles.
			*/
		animation-fill-mode: both;
		transform: translateZ(0);
	}

	.btn-start-game {
		// @extend %center;
		@include animation-pulse;

		font-size: inherit;
		z-index: 80;
	}
}

.start-game-overlay {
	background-color: get-color('mine-shaft');
	height: auto !important;
	height: 100%;
	margin: 0 auto -20px;
	min-height: 100%;
	opacity: 0.9;
	position: fixed;
	width: 100%;
	z-index: 60;
}

.decks-container {
	align-content: center;
	align-items: center;
	display: flex;
	flex-direction: row;
	flex-flow: row wrap;
	justify-content: center;
	padding: 1rem;
}

.game-buttons {
	position: absolute;
	z-index: 5;
}
</style>
