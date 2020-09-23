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
		@hide="onModalClosed"
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

import { GAME_STATUS } from '@/constants';

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
		discardDeck() {
			return this.$store.getters['decks/getByType']('discard');
		},
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

		// if (!this.hoardCards.length) {
		// 	this.instantAction = true;
		// }

		this.instantAction = true;
	},
	methods: {
		onModalClosed() {
			this.$log.debug(
				'onModalClosed',
				this.isActivePlayer,
				this.discardDeck,
				this.card,
			);

			if (this.isActivePlayer) {
				this.$socket.sendObj({
					action: 'discard',
					namespace: 'decks',
					payload: {
						deckId: this.discardDeck.id,
						cardId: this.card.id,
					},
				});
			}
		},
		showCard() {
			const animationend = () => {
				setTimeout(this.onAnimationEnd.bind(this), 1500);
			};

			this.$refs.card.addEventListener('animationend', animationend.bind(this));
		},
		async onAnimationEnd() {
			const cardName = this.card.name;
			const sound = this.$sounds[`actionCard${cardName}`];

			this.isCardVisible = true;

			if (sound) {
				this.$store.dispatch('sound/play', sound);
			}

			this.$log.debug('CardAction:onAnimationEnd -> ', cardName, this);

			this.showModal = false;

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

					break;

				case 'quarrel':
					await this.$store.dispatch('players/startQuarrel');
					break;

				case 'winter':
					await this.$store.dispatch('game/update', {
						status: GAME_STATUS.ROUND_ENDED,
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

	@include flip-card(2s) {
		&.action--whirlwind {
			animation-duration: 3s;
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
