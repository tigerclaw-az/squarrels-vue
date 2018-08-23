<template>
	<div id="game">
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
			<transition name="winter">
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
			</transition>
		</div>
		<Board v-if="isStarted && isLoaded" :gameId="id" :deckIds="deckIds" :playerIds="playerIds">
			<template slot="action">
				<CardAction v-if="actionCard"></CardAction>
			</template>
		</Board>
	</div>
</template>

<script>
import { mapState } from 'vuex';

import CardAction from '@/components/Card/CardAction.vue';
import Board from '@/components/Board/Board.vue';

export default {
	name: 'Game',
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
				this.$store.dispatch({ type: 'game/unload' });
			}
		},
	},
	components: {
		CardAction,
		Board,
	},
};
</script>

<style lang="scss">
// prettier-ignore
@import "~@/assets/scss/variables";

#game {
	position: relative;
}

.game-overlay {
	height: auto !important;
	margin: 0 auto -20px;
	min-height: 100%;
	position: fixed;
	width: 100%;
	z-index: 110;

	&.winter {
		background: url(https://media.giphy.com/media/gvKru3mU4wLFm/giphy.gif)
			no-repeat;
		background-position: center;
		background-size: cover;
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
