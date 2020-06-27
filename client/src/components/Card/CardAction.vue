<template>
	<div
		v-if="decksReady"
		id="action-card"
		:class="[{ shown: hideCard, instant: isInstant }, card.name]"
		class="action-card--wrapper"
	>
		<span class="card blank--"></span>
		<Card :id="card.id" ref="card" :card-data="card" card-type="action" />
	</div>
</template>

<script>
import { mapGetters, mapState } from 'vuex';

import Card from '@/components/Card/Card.vue';

export default {
	name: 'card-action',
	components: {
		Card,
	},
	data: function() {
		return {
			decksReady: false,
			hideCard: false,
			instantAction: false,
		};
	},
	computed: {
		...mapGetters({
			isActivePlayer: 'players/isActivePlayer',
		}),
		...mapState('game', {
			gameId: 'id',
			card: 'actionCard',
		}),
		...mapState({
			decksLoaded: state => state.decks.isLoaded,
		}),
		isInstant: function() {
			return (
				this.isActivePlayer || this.instantAction || this.card.name === 'winter'
			);
		},
	},
	watch: {
		decksLoaded: function(to, from) {
			this.$log.debug('decksLoaded', to, from);

			if (to) {
				this.decksReady = true;
			}
		},
		decksReady: function(to) {
			if (!to) {
				return;
			}

			const hoardDeck = this.$store.getters['decks/getByType']('hoard');
			const hoardCards = hoardDeck.cards;

			const onAnimationEnd = () => {
				const cardId = this.card.id;
				const cardName = this.card.name;

				this.hideCard = true;

				this.$store.dispatch('sound/play', `action-card--${cardName}`);

				switch (cardName) {
					case 'ambush':
					case 'whirlwind':
						this.$store.dispatch(
							'players/actionCard',
							{ name: cardName, gameId: this.gameId },
							{ root: true },
						);

						this.$store.dispatch('decks/addCard', {
							type: 'discard',
							cardId,
						});

						break;

					case 'hoard':
						if (!hoardCards.length) {
							this.$toasted.success('No cards to Hoard', {
								duration: 250,
							});
							this.$store.dispatch('game/resetAction');
						}

						break;

					case 'quarrel':
						this.$store.dispatch('players/startQuarrel');
						break;

					case 'winter':
						this.$store.dispatch('decks/addCard', {
							type: 'action',
							cardId,
						});

						this.$store.dispatch('game/update', {
							isStarted: false,
						});

						break;

					default:
						this.$store.dispatch('game/resetAction');
						break;
				}
			};

			this.$nextTick(() => {
				this.$el
					.querySelector('.card')
					.addEventListener('animationend', onAnimationEnd);
			});

			if (!hoardCards.length) {
				this.instantAction = true;
			}
		},
	},
	mounted: function() {
		this.$store.dispatch('sound/play', 'action-card');

		this.$nextTick(() => {
			if (this.decksLoaded) {
				this.decksReady = true;
			}
		});
	},
};
</script>

<style lang="scss">
// prettier-ignore
@import "~@/components/Card/card";

.action-card--wrapper {
	@extend %playing-cards;

	.btn-card,
	.card {
		position: relative;
	}

	@include flip-card {
		&.action--whirlwind {
			animation-duration: 2.5s;
			animation-name: action-whirlwind;
		}
	}

	left: 25%;
	opacity: 1;
	position: absolute;
	top: 40%;
	transform: scale(2);
	transition-duration: 0.5s;
	transition-property: transform, opacity;
	z-index: 100;

	&.whirlwind {
		transition-delay: 2.5s;
	}

	// Once the card is flipped we need to move it towards the 'action' deck
	&.shown {
		transform: translate(280px, -45px) scale(1);
	}

	@include media-breakpoint-up(lg) {
		&.shown {
			transform: translate(620px, -60px) scale(1);
		}
	}
}
</style>
