<template>
	<div id="game">
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
			spinner-type="border"
			variant="dark"
		>
			<div v-if="showOverlay" class="game-overlay--start-game">
				<b-button
					v-if="showStartGame"
					class="btn btn-start-game"
					variant="primary"
					@click="onClickStartGame"
				>
					START GAME
				</b-button>
				<div v-else class="waiting-message">
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
				:players-in-game="playersInGame"
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
import { filter, includes } from 'lodash';

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
		...mapState({
			allPlayers: state => state.players,
			decks: state => state.decks,
		}),
		allowMorePlayers() {
			return this.playerIds.length < config.MAX_PLAYERS;
		},
		decksLoaded() {
			return this.decks.isLoaded;
		},
		isWinter() {
			return this.actionCard && this.actionCard.name === 'winter';
		},
		needPlayers() {
			return this.playerIds.length < 2;
		},
		playerExists() {
			return this.playerIds.filter(pl => pl === this.currentPlayer.id).length;
		},
		playersInGame() {
			return filter(this.allPlayers, pl => includes(this.playerIds, pl.id));
		},
		showOverlay() {
			return (
				(this.needPlayers || !this.isStarted || this.isLoading) &&
				!this.isWinter
			);
		},
		showStartGame() {
			return (
				!this.needPlayers &&
				!this.isDealing &&
				this.createdBy === this.currentPlayer.id
			);
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
			if (this.id) {
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

	.spinner-border {
		height: 8rem;
		width: 8rem;
	}

	.game-overlay--new-game,
	.game-overlay--start-game {
		color: $white;
		font-size: 2em;
		text-align: center;
		width: 100%;
		z-index: 120;
	}

	.game-overlay--start-game {
		@extend %center;

		.waiting-message {
			width: 100%;
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
