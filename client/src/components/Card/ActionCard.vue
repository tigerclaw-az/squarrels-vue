<template>
	<div id="action-card">
		<transition appear mode="in-out">
			<span
				v-if="decksReady"
				card-type="action"
				class="action-card"
				:class="{ fadeout: hideCard, instant: isInstant }"
			>
				<span class="card blank--"></span>
				<Card
					:id="card.id"
					:card-data="card"
					card-type="action"
					ref="card"
				>
				</Card>
			</span>
		</transition>
	</div>
</template>

<script>
import { mapState } from 'vuex';

import Card from '@/components/Card/Card.vue';

export default {
	name: 'ActionCard',
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
		decksReady: function(to, from) {
			if (!to) {
				return;
			}

			const hoardDeck = this.$store.getters['decks/getByType']('discard');
			const hoardCards = hoardDeck.cards;

			const onAnimationEnd = () => {
				this.hideCard = true;

				switch (this.card.name) {
					case 'ambush':
						this.$socket.sendObj({
							action: this.card.name,
							gameId: this.gameId,
						});

						this.$store.dispatch('decks/addCard', {
							type: 'action',
							cardId: this.card.id,
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
							cardId: this.card.id,
						});
						break;

					default:
						this.$store.dispatch('game/resetAction');
						break;
				}
			};

			this.$nextTick(() => {
				this.$log.debug('ActionCard.mounted', hoardDeck, hoardCards);

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

.action-card {
	@extend %playing-cards;

	@include flip-card {
		&.action--whirlwind {
			animation-name: action-whirlwind;
		}
	}

	left: 40%;
	opacity: 1;
	position: absolute !important;
	top: -20%;
	transform: scale(2);
	transition-duration: 1s;
	z-index: 100;

	&.fadeout {
		opacity: 0;
		transform: scale(0);
	}
}
</style>
