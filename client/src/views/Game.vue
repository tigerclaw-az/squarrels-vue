<template>
	<div id="game">
		<transition tag="div" name="winter">
			<div class="game-overlay--new-game winter" v-if="isWinter"></div>
		</transition>
		<GameResults
			v-if="isWinter"
			:gameId="id"
			:playerIds="playerIds"
		>
			<template slot="newGame">
				<div class="container-button">
					<b-button
						class="btn btn-new-game"
						variant="primary"
						@click="onClickNewGame"
					>
					NEXT ROUND
					</b-button>
				</div>
			</template>
		</GameResults>
		<div v-if="!isStarted" class="game-overlay">
			<div class="game-overlay--start-game" v-cloak v-if="!isLoading && !isWinter">
				<div v-if="needPlayers" class="waiting-message">
					Waiting for other players to join...
				</div>
				<b-button v-else
					class="btn btn-start-game"
					variant="primary"
					@click="onClickStartGame">
					START GAME
				</b-button>
			</div>
		</div>
		<Board
			v-if="isLoaded"
			:deckIds="deckIds"
			:gameId="id"
			:isGameStarted="isStarted"
			:playerIds="playerIds"
		>
			<template slot="action">
				<CardAction v-if="actionCard"></CardAction>
			</template>
		</Board>
	</div>
</template>

<script>
import { mapGetters, mapState } from 'vuex';
import { config } from '@/config';

import CardAction from '@/components/Card/CardAction.vue';
import Board from '@/components/Board/Board.vue';
import GameResults from '@/components/Game/GameResults.vue';

export default {
	name: 'Game',
	components: {
		Board,
		CardAction,
		GameResults,
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
			}
		},
	},
	created: function() {},
	mounted: function() {
		this.$store
			.dispatch({ type: 'game/load', id: this.id })
			.then(() => {
				return this.$store.dispatch({
					type: 'players/load',
					ids: this.playerIds,
				});
			})
			.then(() => {
				if (this.allowMorePlayers && !this.playerExists) {
					this.$store.dispatch({
						type: 'game/addPlayer',
						gameId: this.id,
						playerId: this.currentPlayer.id,
					});
				}
			});

		// Need to unload current game from player if they leave
		window.onbeforeunload = () => {
			this.unload();
		};
	},
	beforeDestroy: function() {
		this.unload();
	},
	computed: {
		...mapGetters({
			currentPlayer: 'players/getMyPlayer',
		}),
		...mapState('game', [
			'actionCard',
			'deckIds',
			'isDealing',
			'isLoaded',
			'isStarted',
			'playerIds',
		]),
		needPlayers: function() {
			return this.playerIds.length < 2;
		},
		allowMorePlayers: function() {
			return this.playerIds.length < config.MAX_PLAYERS;
		},
		playerExists: function() {
			return this.playerIds.filter(pl => pl === this.currentPlayer.id)
				.length;
		},
		isWinter: function() {
			return this.actionCard && this.actionCard.name === 'winter';
		},
	},
	methods: {
		onClickStartGame: function(evt) {
			this.$log.debug('onClickStartGame', evt);
			this.isLoading = true;
			this.$store.dispatch({ type: 'game/start' });
		},
		onClickNewGame: async function(evt) {
			this.$log.debug('onClickNewGame', evt);
			this.isLoading = true;

			try {
				await this.$store.dispatch({ type: 'game/nextRound' });
				this.$store.dispatch({ type: 'game/start' });
			} catch (err) {
				this.$log.error(err);
				this.$toasted.error(err.message);
			}
		},
		unload: function() {
			// Only unload if the current game was valid
			if (this.$store.state.game.id) {
				this.$store.dispatch({ type: 'game/unload' });
			}
		},
	},
};
</script>

<style lang="scss" scoped>
// prettier-ignore
@import "~@/assets/scss/variables";

#game {
	align-items: center;
	display: flex;
	height: 100%;
	justify-content: center;
}

.winter {
	background: url(https://media1.tenor.com/images/cfd482be411aab7af3e5e71c7aa324f5/tenor.gif?itemid=3316293)
		no-repeat;
	background-position: center;
	background-size: cover;
	height: 100%;
	opacity: 0.75;
	position: absolute;
	width: 100%;
	z-index: 100;
}

.winter-enter-active,
.winter-leave-active {
	// position: absolute;
	transition-duration: 0.75s;
	transition-property: opacity, transform;
}

.winter-enter {
	opacity: 0;
	transform: translateX(-100vw);
}

.winter-enter-to {
	opacity: 1;
	transform: translateX(0);
}

.winter-leave-to {
	opacity: 0;
	transform: translateY(100vh);
}

.game-overlay {
	background-color: rgba($black, 0.8);
	height: auto !important;
	margin: 0 auto -20px;
	min-height: 100%;
	position: fixed;
	width: 100%;
	z-index: 110;

	.game-overlay--new-game,
	.game-overlay--start-game {
		color: $white;
		font-size: 2em;
		z-index: 120;
	}

	.game-overlay--start-game {
		@extend %center;

		.waiting-message {
			animation-duration: 1.25s;
			/**
			* This makes sure that the starting style (opacity: .2)
			* of the animation is applied before the animation starts.
			* Otherwise we would see a short flash or would have
			* to set the default styling of the dots to the same
			* as the animation. Same applies for the ending styles.
			*/
			animation-fill-mode: both;
			animation-iteration-count: infinite;
			animation-name: blink;

			transform: translateZ(0);
		}
	}

	.game-overlay--new-game {
		.container-button {
			@extend %center;
		}
	}

	.btn-start-game,
	.btn-new-game {
		@include animation-pulse;

		font-size: inherit;
		z-index: 130;
	}
}

.game-buttons {
	position: absolute;
	z-index: 5;
}
</style>
