<template>
	<div
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
		hoardCards() {
			return this.hoardDeck.cards;
		},
		hoardDeck() {
			return this.$store.getters['decks/getByType']('hoard');
		},
		isInstant: function() {
			return (
				this.isActivePlayer || this.instantAction || this.card.name === 'winter'
			);
		},
	},
	mounted: function() {
		this.$store.dispatch('sound/play', this.$sounds.actionCard);

		this.$nextTick(() => {
			this.$el
				.querySelector('.card')
				.addEventListener('animationend', this.onAnimationEnd.bind(this));
		});

		if (!this.hoardCards.length) {
			this.instantAction = true;
		}
	},
	methods: {
		onAnimationEnd() {
			const cardId = this.card.id;
			const cardName = this.card.name;
			const sound = this.$sounds[`actionCard${cardName}`];

			this.hideCard = true;

			if (sound) {
				this.$store.dispatch('sound/play', sound);
			}

			switch (cardName) {
				case 'ambush':
				case 'whirlwind':
					this.$store.dispatch(
						'players/actionCard',
						{ name: cardName, gameId: this.gameId },
						{ root: true },
					);

					break;

				case 'hoard':
					if (!this.hoardCards.length) {
						this.$toasted.success('No cards to Hoard', {
							duration: 1000,
						});
						this.$store.dispatch('game/resetAction');
					}

					// Wait for player to click the "Hoard" deck

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
					this.$toasted.error('A rogue action card has appeared!');
					break;
			}
		},
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
			animation-duration: 2s;
			animation-name: action-whirlwind;
		}
	}

	left: 0;
	opacity: 1;
	position: absolute;
	transform: scale(2);
	transition-duration: 0.5s;
	transition-property: transform, opacity;
	z-index: 100;

	&.whirlwind {
		transition-delay: 2.5s;
	}

	// Once the card is flipped we need to move it towards the 'action' deck
	&.shown {
		transform: scale(1);
	}

	@include media-breakpoint-up(lg) {}
}
</style>
