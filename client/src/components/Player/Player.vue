<template>
	<div
		:class="{
			'active': player.isActive,
			'current': isCurrentPlayer,
			'my-turn': isMyTurn,
		}"
		class="sq-player"
	>
		<div v-if="isCurrentPlayer && player.message" class="sq-quarrel-message">
			{{ player.message }}
		</div>
		<div v-else class="sq-player-avatar">
			<b-img-lazy
				src="@/assets/images/squirrel-placeholder.jpg"
				rounded="circle"
			></b-img-lazy>
			<div class="sq-player-name">{{ player.name }}</div>
			<PlayerStorage :player="player" />
		</div>
		<div class="sq-player-cards">
			<PlayerQuarrel :action-card="actionCard" :player="player" />
			<PlayerCards
				v-if="isCurrentPlayer"
				:action-card="actionCard"
				:is-my-turn="isMyTurn"
				:player="myPlayer"
			></PlayerCards>
			<transition-group
				v-if="!isCurrentPlayer"
				tag="div"
				class="cards-group hand"
				name="cards"
			>
				<Card
					v-for="n in player.totalCards"
					:key="n"
					:card-style="cardStyle(n)"
					card-type="hand"
				/>
			</transition-group>
		</div>
		<player-storage-modal :player="player"></player-storage-modal>
	</div>
</template>

<script>
import { mapGetters, mapState } from 'vuex';

import Card from '@/components/Card/Card.vue';
import PlayerCards from '@/components/Player/PlayerCards.vue';
import PlayerQuarrel from '@/components/Player/PlayerQuarrel.vue';
import PlayerStorage from '@/components/Player/PlayerStorage.vue';
import PlayerStorageModal from '@/components/Player/PlayerStorageModal.vue';

export default {
	name: 'player',
	components: {
		Card,
		PlayerCards,
		PlayerQuarrel,
		PlayerStorage,
		'player-storage-modal': PlayerStorageModal,
	},
	props: {
		player: {
			type: Object,
			required: true,
		},
	},
	data: function() {
		return {};
	},
	computed: {
		...mapGetters({
			myPlayer: 'players/getMyPlayer',
		}),
		...mapState({
			actionCard: state => state.game.actionCard,
			isGameStarted: state => state.game.isStarted,
		}),
		isCurrentPlayer() {
			return this.myPlayer.id === this.player.id;
		},
		isMyTurn() {
			return this.player.isActive && this.myPlayer.id === this.player.id;
		},
	},
	watch: {
		isMyTurn(to, from) {
			if (to && to !== from) {
				this.$toasted.success('YOUR TURN', {
					duration: 1000,
				});
				this.$store.dispatch('sound/play', this.$sounds.activePlayer);
			}
		},
	},
	methods: {
		cardStyle(index) {
			const cardsCount = this.player.totalCards;

			const styles = {
				'z-index': index + 1,
			};

			const spacing = 140 / cardsCount;
			const spacingMultiplier = index;

			styles.left = spacing * spacingMultiplier + 'px';

			return styles;
		},
	},
};
</script>

<style lang="scss">
// prettier-ignore
@import "~@/assets/scss/variables";
// prettier-ignore
@import "~@/../node_modules/bootstrap/scss/mixins/breakpoints";

// prettier-ignore
@import "~@/components/Card/card";

.sq-player {
	color: $white;
	display: flex;
	flex-flow: row nowrap;
	margin-top: 1rem;
	min-height: 160px;
	position: relative;
	text-align: center;
	width: 100%;

	.sq-player-avatar,
	.sq-quarrel-message {
		align-items: flex-end;
		align-self: flex-end;
		display: flex;
		position: absolute;
		z-index: 9;

		> img {
			width: 6.5rem;
		}

		.sq-player-name {
			bottom: -12px;
			color: inherit;
			font-size: 1.5em;
			font-weight: $font-weight-bold;
			left: 15%;
			position: absolute;
		}
	}

	.sq-quarrel-message {
		color: $white;
		font-size: 1.25em;
	}

	.sq-player-cards {
		height: 100%;
		order: 1;
		transform: translateX(0);
		width: 100%;

		.cards-group {
			@extend %playing-cards;

			align-items: center;
			display: flex;
			height: 100%;
			justify-content: center;
			width: 100%;

			.btn-card,
			.card {
				transition: transform 0.75s ease-in-out;
				top: 0;
			}

			.btn-card {
				&:hover {
					.card {
						transform: translateY(25px) scale(1.25);
					}
				}
			}

			.cards-enter-active,
			.cards-leave-active {
				position: absolute;
				transition-duration: 0.75s;
				transition-property: opacity, transform;
			}

			.cards-enter {
				opacity: 0;
				transform: translateY(-3rem);
			}

			.cards-enter-to {
				opacity: 1;
				transform: translateY(0);
			}

			.cards-leave-to {
				opacity: 0;
				position: absolute;
				transform: translateY(3rem);
			}
		}
	}

	&.current {
		// Pushes player to end of "container"
		margin-top: auto;
		justify-content: center;
		order: 5;

		.sq-player-avatar {
			bottom: -20px;
		}

		.sq-player-cards {
			.cards-group {
				.btn-card {
					&:not(.disabled) {
						cursor: pointer;
					}

					&.selected,
					&:hover {
						.card {
							transform: translateY(-75px) scale(1.5);
						}
					}
				}
			}
		}
	}

	&.active {
		color: color('gold-light');
	}

	@include media-breakpoint-up(lg) {
		.sq-quarrel-message {
			left: 20%;
		}
	}
}
</style>
