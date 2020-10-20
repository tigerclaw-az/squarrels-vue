<template>
	<div class="container_decks">
		<div class="deck-container">
			<div
				:class="{
					'can-draw': true,
				}"
				class="deck"
			>
				<div class="cards-group" @click="onClick">
					<transition
						name="cardDrawn"
						@enter="onTransition.enter"
						@leave="onTransition.leave"
					>
						<div
							v-show="isDrawingCard"
							ref="card"
							class="card-drawn"
							:class="{ 'flip-card': cardDrawn }"
						>
							<div class="btn-card card blank--"></div>
							<transition
								name="card-shown"
								@after-enter="onTransition.afterEnter"
							>
								<Card
									v-if="cardDrawn"
									:id="cardDrawn.id"
									key="card"
									:card-data="cardDrawn"
									card-type="deck"
								></Card>
							</transition>
						</div>
					</transition>
					<Card
						v-for="(n, index) in 120"
						:key="index"
						ref="deck"
						:card-style="cardPositions[index]"
						card-type="deck"
					/>
				</div>
			</div>
		</div>
	</div>
</template>

<script>
import { mapGetters, mapState } from 'vuex';

import Card from '@/components/Card/Card.vue';

export default {
	components: {
		Card,
	},
	props: {
		// cards: {
		// 	type: Array,
		// 	required: true,
		// },
	},
	data: function() {
		return {
			// isCardDrawn: false,
			isDrawingCard: false,
			cardDrawn: null,
			cardPositions: [],
			cardStyles: [],
			onTransition: {
				enter: (el, done) => {
					this.$log.debug('enter', el);
				},
				afterEnter: el => {
					this.$log.debug('@afterEnter2', el);
					setTimeout(() => {
						this.$log.debug(this.isDrawingCard, this.cardDrawn);
						this.onCardDrawnAnimationEnd();
					}, 2000);
				},
				leave: el => {
					this.$log.debug('leave', el, this.cardDrawn, this.isDrawingCard);
				},
			},
		};
	},
	computed: {
		...mapGetters({
			canDrawCard: 'players/canDrawCard',
			myPlayer: 'players/getMyPlayer',
		}),
		...mapState(['isAdmin']),
		...mapState('decks', ['isCardDrawn']),
	},
	watch: {
		isDrawingCard(val) {
			this.$log.debug(val);

			// Animate card draw for all players
			// window.requestAnimationFrame(this.moveCard);

			// Only valid for current player drawing card
		},
	},
	mounted: function() {
		// Setup position of cards in deck
		for (let i = 0; i < 120; i++) {
			const pos = i * -0.25;

			this.$set(this.cardStyles, i, {
				left: 0,
				right: 0,
				top: pos,
				zIndex: i,
			});
			this.$set(this.cardPositions, i, {
				transform: `translate(0px, ${pos}px)`,
				zIndex: i,
			});
		}

		// this.$cardDrawnEl = this.$el.querySelector('.card-drawn');
		// this.$nextTick(() => {
		// 	this.$cardFlipEl = this.$refs.cardFlip;
		// 	this.$cardFlipEl.addEventListener(
		// 		'animationend',
		// 		this.onCardDrawnAnimationEnd,
		// 	);
		// });
	},
	methods: {
		onCardDrawn: function(cardDrawn) {
			this.$log.debug(cardDrawn);
			setTimeout(() => {
				this.isDrawingCard = false;
				this.cardDrawn = null;
			}, 800);
		},
		// This will get triggered after the card flip animation is completed,
		// it will NOT trigger for cards being dealt to players
		onCardDrawnAnimationEnd: function() {
			this.$log.debug('animation ended -> ', this.cardDrawn);

			// this.$store.dispatch('game/update', { isDrawingCard: false });

			this.onCardDrawn(this.cardDrawn);
		},
		onClick: function() {
			this.isDrawingCard = true;
			setTimeout(() => {
				this.cardDrawn = {
					id: '5ef4bef4f8f186003ca9d91d',
					name: '1',
					amount: 1,
					cardType: 'number',
				};
			}, 1000);
		},
	},
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style lang="scss">
// @import '~@/assets/scss/variables';
@import '~@/components/Deck/deck';

.container_decks {
	display: flex;
	flex: 0 1 100%;
	flex-flow: row wrap;
	place-content: center flex-end;
	position: relative;
	min-height: 0;
	min-width: 425px;
}

.deck-container {
	width: 18%;
	.deck .cards-group {
		justify-content: flex-end !important;
	}
}

.count {
	bottom: 0;
	color: $black;
	font-size: 1.25rem;
	font-weight: $font-weight-bold;
	position: absolute;
	z-index: 1;
}

.overlay {
	display: flex;
	width: 100%;
	z-index: 130;

	.icon {
		color: theme-color('primary');
		display: inherit;
		height: 100%;
		margin: 0 auto;
	}
}

.card-drawn {
	transition: transform 1.75s ease-in-out;
	border: 4px solid black;
	width: rem-calc(map-get($card-width, 'small'));
	height: rem-calc(map-get($card-height, 'small'));
	left: 0;
	position: absolute;
	top: 0;
	z-index: 140;

	&.flip-card {
		@include flip-card($flip-speed: 0.5s, $flip-delay: 1.5s);
	}
}

.cardDrawn-enter-active {
	opacity: 1;
	animation: draw-card 1s forwards cubic-bezier(0.68, 1.5, 1, 0.35);
	animation-delay: 0.1s;
	transform-style: preserve-3d;
}

// .cardDrawn-enter {
// 	transform: translate3d(0, 0, 0) scale(1);
// }

.cardDrawn-leave-active {
	transition: opacity, transform 0.25s linear;
	transform: translate3d(-40vw, 10vh, 0);
	opacity: 1;
}

.cardDrawn-leave-to {
	opacity: 0;
	transform: translate3d(-75vw, 25vh, 0) scale(1);
}

.dropdown {
	margin-top: 1rem;

	.dropdown-menu {
		max-height: 200px;
		overflow: auto;
	}
}
</style>
