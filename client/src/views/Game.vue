<template>
	<div id="board">
		<BoardHeader :isGameStarted="isStarted"></BoardHeader>
		<canvas v-if="actionCard && actionCard.name === 'winter'" class="winter-snow"></canvas>
		<b-row>
			<b-col>
				<div class="decks-container">
					<Deck v-for="deck in decks" :key="deck.id"></Deck>
				</div>
			</b-col>
		</b-row>
		<b-row>
			<b-col>
				<BoardPlayers :isGameStarted="isStarted"></BoardPlayers>
				<ActionCard></ActionCard>
			</b-col>
		</b-row>
		<b-row>
			<b-col>
				<div class="admin-options" v-if="isAdmin && isStarted">
					<b-dropdown id="dropdown-options" variant="info" text="Option">
						<b-dropdown-item @click="onAdminOption('reset-game')">Reset Game</b-dropdown-item>
						<b-dropdown-item @click="onAdminOption('reset-hoard')">Reset Hoard</b-dropdown-item>
						<b-dropdown-item @click="onAdminOption('reset-player-cards')">Reset Player Cards</b-dropdown-item>
						<b-dropdown-item @click="onAdminOption('skip-player')">Skip Player</b-dropdown-item>
					</b-dropdown>
				</div>
			</b-col>
		</b-row>
	</div>
</template>

<script>
import { mapState } from 'vuex';

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
	props: ['id'],
	data: function() {
		return {
		};
	},
	mounted: function() {
		// TODO: Remove player from game
		window.addEventListener('beforeunload', () => {
			this.$log.debug('unloaded!', this.players);
		});
		this.$store.dispatch({ type: 'game/load', id: this.id });
		// See watch: https://vuejs.org/v2/guide/computed.html

		// TODO: If current player doesn't exist in game.players, then
		// 		this.$store.dispatch({ type: 'game/addPlayer', id: this.id });
	},
	computed: {
		...mapState('game', [
			'actionCard',
			'decks',
			'isStarted',
			'instantAction',
		]),
		...mapState([ 'isAdmin' ]),
	},
	methods: {
		onAdminOption(name) {
			this.$log.debug(name);
		},
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
