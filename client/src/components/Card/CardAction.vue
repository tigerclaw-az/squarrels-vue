<template>
	<div v-if="decksReady"
		id="action-card"
		class="action-card--wrapper"
		:class="[{ shown: hideCard, instant: isInstant }, card.name]"
	>
		<span class="card blank--"></span>
		<Card
			:id="card.id"
			:card-data="card"
			card-type="action"
			ref="card"
		>
		</Card>
	</div>
</template>

<script>
import { mapState } from 'vuex';

import Card from '@/components/Card/Card.vue';

export default {
	name: 'CardAction',
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

			const hoardDeck = this.$store.getters['decks/getByType']('discard');
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
							{ root: true }
						);

						this.$store.dispatch('decks/addCard', {
							type: 'action',
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
	computed: {
		...mapState('game', {
			gameId: 'id',
			card: 'actionCard',
		}),
		...mapState({
			decksLoaded: state => state.decks.isLoaded,
		}),
		isInstant: function() {
			return this.instantAction || this.card.name === 'winter';
		},
	},
};
</script>

<style lang="scss">
// prettier-ignore
@import "~@/components/Card/card";

.action-card--wrapper {
	@extend %playing-cards;

	@include flip-card {
		&.action--whirlwind {
			animation-duration: 2.5s;
			animation-name: action-whirlwind;
		}
	}

	left: 40%;
	opacity: 1;
	position: absolute;
	top: 0;
	transform: scale(2);
	transition-duration: 0.5s;
	transition-property: transform, opacity;
	z-index: 100;

	&.whirlwind {
		transition-delay: 2.5s;
	}

	// Once the card is flipped we need to move it towards the 'action' deck
	&.shown {
		transform: translate(18vw, -32vh);
	}
}
</style>
