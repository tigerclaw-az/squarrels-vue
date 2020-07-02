<template>
	<div id="game">
		<transition
			v-if="isWinter"
			tag="div"
			class="game-overlay--new-game winter"
			name="winter"
		></transition>
		<GameResults v-if="isWinter" :game-id="id" :player-ids="playerIds">
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
		<b-overlay
			:show="showOverlay"
			class="game-overlay"
			blur="2px"
			opacity="0.75"
			variant="dark"
		>
			<div
				v-cloak
				v-if="!isStarted && !isLoading && !isWinter"
				class="game-overlay--start-game"
			>
				<b-button
					v-if="showStartGame"
					class="btn btn-start-game"
					variant="primary"
					@click="onClickStartGame"
				>
					START GAME
				</b-button>
				<div v-else class="waiting-message">
					<b-spinner></b-spinner>
					<span v-if="needPlayers">
						Waiting for other players to join...
					</span>
					<span v-else>
						Waiting for player to start the game...
					</span>
				</div>
			</div>
			<Board
				v-if="deckIds.length && decksLoaded"
				:deck-ids="deckIds"
				:game-id="id"
				:player-ids="playerIds"
			>
				<template slot="action">
					<CardAction v-if="actionCard"></CardAction>
				</template>
			</Board>
		</b-overlay>
	</div>
</template>

<script>
import { mapGetters, mapState } from 'vuex';
import { config } from '@/config';

import CardAction from '@/components/Card/CardAction.vue';
import Board from '@/components/Board/Board.vue';
import GameResults from '@/components/Game/GameResults.vue';

export default {
	name: 'game',
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
	beforeRouteLeave(to, from, next) {
		if (to.name === 'start') {
			this.unload()
				.then(() => {
					next();
				})
				.catch(err => {
					this.$log.error(err);
					this.$toasted.error(err);
					next(false);
				});
		}
	},
	computed: {
		...mapGetters({
			currentPlayer: 'players/getMyPlayer',
		}),
		...mapState('game', [
			'actionCard',
			'createdBy',
			'deckIds',
			'isDealing',
			'isLoaded',
			'isStarted',
			'playerIds',
		]),
		allowMorePlayers: function() {
			return this.playerIds.length < config.MAX_PLAYERS;
		},
		decksLoaded() {
			return this.$store.state.decks.isLoaded;
		},
		needPlayers: function() {
			return this.playerIds.length < 2;
		},
		playerExists: function() {
			return this.playerIds.filter(pl => pl === this.currentPlayer.id).length;
		},
		isWinter: function() {
			return this.actionCard && this.actionCard.name === 'winter';
		},
		showOverlay() {
			return !this.isStarted || this.isLoading;
		},
		showStartGame() {
			return !this.isDealing && this.createdBy === this.currentPlayer.id;
		},
	},
	watch: {
		isStarted: function(to) {
			if (to) {
				this.isLoading = false;
				this.$store
					.dispatch('decks/load', { ids: this.deckIds }, { root: true })
					.then(() => {
						// this.decksLoaded = true;
					});
			}
		},
	},
	mounted: function() {
		this.$store
			.dispatch({ type: 'game/load', id: this.id })
			.then(data => {
				if (data.playerIds.length) {
					return this.$store.dispatch({
						type: 'players/load',
						ids: data.playerIds,
					});
				}
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
	},
	methods: {
		onClickStartGame: async function(evt) {
			this.$log.debug('onClickStartGame', evt);
			this.isLoading = true;

			try {
				await this.$store.dispatch({ type: 'game/start' });
			} catch (err) {
				this.$log.error(err);
				this.$toasted.error(err.message);
				await this.$store.dispatch('game/update', {
					isDealing: false,
					isStarted: false,
				});
			}
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
				return this.$store.dispatch({ type: 'game/unload' });
			}

			return Promise.resolve();
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
	min-height: 100%;
	width: 100%;

	.game-overlay--new-game,
	.game-overlay--start-game {
		color: $white;
		font-size: 2em;
		z-index: 120;
	}

	.game-overlay--start-game {
		@extend %center;
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
