<template>
	<b-modal
		v-model="showModal"
		centered
		hide-backdrop
		hide-footer
		hide-header
		no-close-on-backdrop
		no-close-on-esc
		size="sm"
		@shown="showCard"
		@hidden="onModalClosed"
	>
		<template v-slot:default>
			<b-container fluid>
				<div
					id="action-card"
					:class="[{ shown: isCardVisible, instant: isInstant }, card.name]"
					class="action-card--wrapper"
				>
					<span ref="card" class="card blank--"></span>
					<Card :id="card.id" :card-data="card" card-type="action" />
				</div>
			</b-container>
		</template>
	</b-modal>
</template>

<script>
import { mapGetters } from 'vuex';

import { BModal } from 'bootstrap-vue';
import Card from '@/components/Card/Card.vue';

export default {
	name: 'card-action',
	components: {
		'b-modal': BModal,
		Card,
	},
	props: {
		card: {
			type: Object,
			required: true,
		},
		gameId: {
			type: String,
			required: true,
		},
	},
	data: function() {
		return {
			isCardVisible: false,
			instantAction: false,
			showModal: true,
		};
	},
	computed: {
		...mapGetters({
			isActivePlayer: 'players/isActivePlayer',
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

		// this.showCard();
		// this.$nextTick(() => {
		// 	this.$el
		// 		.querySelector('.card')
		// 		.addEventListener('animationend', this.onAnimationEnd.bind(this));
		// });

		if (!this.hoardCards.length) {
			this.instantAction = true;
		}
	},
	methods: {
		async onModalClosed() {
			const cardId = this.card.id;

			if (this.isActivePlayer) {
				try {
					await this.$store.dispatch('decks/addCard', {
						type: 'discard',
						cardId,
					});
				} catch (err) {
					this.$toasted.error(err);
				}
			}
		},
		showCard() {
			this.$refs.card.addEventListener(
				'animationend',
				this.onAnimationEnd.bind(this),
			);
		},
		async onAnimationEnd() {
			const cardName = this.card.name;
			const sound = this.$sounds[`actionCard${cardName}`];

			this.isCardVisible = true;

			if (sound) {
				this.$store.dispatch('sound/play', sound);
			}

			switch (cardName) {
				case 'ambush':
				case 'whirlwind':
					await this.$store.dispatch(
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

						if (this.isActivePlayer) {
							await this.$store.dispatch('game/resetAction');
						}
					}

					// Wait for player to click the "Hoard" deck
					this.showModal = false;

					break;

				case 'quarrel':
					await this.$store.dispatch('players/startQuarrel');
					this.showModal = false;
					break;

				case 'winter':
					this.showModal = false;

					await this.$store.dispatch('game/update', {
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

	@include flip-card(0.5s) {
		&.action--whirlwind {
			animation-duration: 2s;
			animation-name: action-whirlwind;
		}
	}

	left: 0;
	opacity: 1;
	// position: absolute;
	transform: scale(2);
	transition-duration: 0.25s;
	transition-property: transform, opacity;
	z-index: 100;

	&.whirlwind {
		transition-delay: 2.5s;
	}

	&.shown {
		transform: scale(1);
	}

	@include media-breakpoint-up(lg) {
	}
}
</style>
