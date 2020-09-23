<template>
	<div id="game">
		<GameResults
			v-if="isWinter && !needPlayers"
			:game-id="id"
			:my-player="myPlayer"
			:players="playersInGame"
			:round-number="roundNumber"
		>
			<template slot="newGame">
				<div class="container-button">
					<b-button
						class="btn btn-new-game"
						size="lg"
						variant="primary"
						@click="onClickNewGame()"
					>
						NEXT ROUND
					</b-button>
				</div>
			</template>
			<template slot="gameOver">
				<div class="container-button">
					<b-button
						class="btn btn-new-game"
						size="lg"
						variant="primary"
						@click="onClickNewGame($event, true)"
					>
						NEW GAME
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
					@click="onClickStartGame()"
				>
					START GAME
				</b-button>
				<div v-else class="waiting-message">
					<span v-if="needPlayers">
						Waiting for other players to join...
					</span>
					<span v-else>
						Waiting for game to start...
					</span>
				</div>
			</div>
			<Board
				v-if="isLoaded"
				:decks="decks"
				:game-status="status"
				:players-in-game="playersInGame"
				:round-number="roundNumber"
			>
				<template slot="action">
					<CardAction
						v-if="actionCard"
						:game-id="id"
						:card="actionCard"
					></CardAction>
				</template>
			</Board>
		</b-overlay>
	</div>
</template>

<script>
import { mapGetters, mapState } from 'vuex';
import { filter, includes, isEmpty } from 'lodash';

import { config } from '@/config';
import { GAME_STATUS } from '@/constants';

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
			isLoaded: false,
		};
	},
	beforeRouteLeave(to, from, next) {
		if (this.$store.state.websocket.isConnected) {
			this.unload(this.id)
				.then(() => {
					next();
				})
				.catch(err => {
					this.$log.error(err);
					this.$toasted.error(err);
					next();
				});
		}
	},
	computed: {
		...mapGetters({
			myPlayer: 'players/getMyPlayer',
		}),
		...mapState('game', [
			'actionCard',
			'createdBy',
			'deckIds',
			'playerIds',
			'roundNumber',
			'status',
		]),
		...mapState({
			allPlayers: state => state.players,
			decks: state => state.decks,
		}),
		allowMorePlayers() {
			return (
				this.roundNumber === 1 &&
				this.status === 'INIT' &&
				this.playerIds.length < config.MAX_PLAYERS
			);
		},
		isWinter() {
			return this.actionCard && this.actionCard.name === 'winter';
		},
		needPlayers() {
			return this.playerIds.length < 2;
		},
		isCreator() {
			let createdById = this.createdBy;

			if (createdById && typeof createdById !== 'string') {
				createdById = createdById.id;
			}

			return createdById === this.myPlayer.id;
		},
		playerExists() {
			return this.playerIds.filter(pl => pl === this.myPlayer.id).length;
		},
		playersInGame() {
			return filter(this.allPlayers, pl => includes(this.playerIds, pl.id));
		},
		showOverlay() {
			return (
				(!this.isLoaded || this.needPlayers || this.status === 'INIT') &&
				!this.isWinter
			);
		},
		showStartGame() {
			return (
				this.roundNumber === 1 &&
				this.isCreator &&
				!this.needPlayers &&
				this.status === 'INIT'
			);
		},
	},
	watch: {
		deckIds: {
			handler: async function(ids) {
				this.$log.debug('Game::deckIds -> ', ids, this);

				if (isEmpty(ids) || this.decks.isLoaded) {
					return;
				}

				try {
					await this.$store.dispatch('decks/load', { ids }, { root: true });
				} catch (err) {
					this.$log.error(err);
					this.$toasted.error(err);
				}
			},
		},
		decks: {
			deep: true,
			handler: async function(decksState) {
				this.$log.debug('Game::decks -> ', decksState, this);

				if (
					isEmpty(decksState.ids) ||
					!decksState.isLoaded ||
					!decksState.isShuffled
				) {
					return;
				}

				if (this.isCreator && this.status === GAME_STATUS.SHUFFLE) {
					try {
						await this.$store.dispatch({ type: 'game/start' });
					} catch (err) {
						throw new Error(err);
					}
				}
			},
		},
		// myPlayer: {
		// 	immediate: true,
		// 	handler: async function(player) {
		// 		this.$log.info('Game:myPlayer :: ', player);

		// 		if (!player.id) {
		// 			return;
		// 		}

		// 		if (this.playerExists && player.gameId === this.id) {
		// 			return Promise.resolve();
		// 		}

		// 		await this.$store.dispatch({
		// 			type: 'game/addPlayer',
		// 			gameId: this.id,
		// 			playerId: player.id,
		// 		});

		// 		this.isLoaded = true;
		// 	},
		// },
	},
	mounted: function() {
		this.$store
			.dispatch({ type: 'game/load', id: this.id })
			.then(async data => {
				this.$log.debug('Game:load :: ', data);

				if (!isEmpty(data.playerIds)) {
					await this.$store.dispatch({
						type: 'players/load',
						ids: data.playerIds,
					});
				}
			})
			.then(() => {
				if (this.playerExists && this.myPlayer.gameId === this.id) {
					return Promise.resolve();
				}

				return this.$store.dispatch({
					type: 'game/addPlayer',
					gameId: this.id,
					playerId: this.myPlayer.id,
				});
			})
			.then(() => {
				if (this.myPlayer.id) {
					this.isLoaded = true;
				}
			})
			.catch(err => {
				this.$log.error(err);
				this.$toasted.error(err);
			});
	},
	methods: {
		onClickStartGame: async function(evt) {
			this.$log.debug('onClickStartGame', evt);

			try {
				await this.startGame();
			} catch (err) {
				this.$log.error(err);
				this.$toasted.error(err.message);
			}
		},
		onClickNewGame: async function(evt, resetGame) {
			this.$log.debug('onClickNewGame', evt, resetGame);

			try {
				if (resetGame) {
					await this.$store.dispatch({ type: 'game/reset' });
				} else {
					await this.$store.dispatch({ type: 'game/nextRound' });
				}
			} catch (err) {
				this.$log.error(err);
				this.$toasted.error(err.message);
			}

			await this.startGame();
		},
		async startGame() {
			try {
				await this.$store.dispatch({ type: 'game/createDecks' });
			} catch (err) {
				this.$log.error(err);
				this.$toasted.error(err.message);
				// await this.$store.dispatch({ type: 'game/reset' });
				throw new Error(err);
			}
		},
		unload: function(id) {
			if (id) {
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
		z-index: 200;
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
		z-index: 210;
	}
}

.game-buttons {
	position: absolute;
	z-index: 5;
}
</style>
