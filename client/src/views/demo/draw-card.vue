<template>
	<div class="deck-container">
		<div
			:class="{
				'can-draw': true,
			}"
			class="deck"
		>
			<div class="cards-group" @click="onClick">
				<transition name="cardDrawn" @enter="onTransition.enter">
					<div
						v-show="isDrawingCard"
						ref="card"
						class="card-drawn"
						:class="{ 'flip-card': cardDrawn }"
					>
						<transition-group
							name="card-shown"
							@after-enter="onTransition.afterEnter"
						>
							<div v-if="isDrawingCard" key="blank" class="btn-card card blank--"></div>

							<Card
								v-if="cardDrawn"
								:id="cardDrawn.id"
								key="card"
								:card-data="cardDrawn"
								card-type="deck"
							></Card>
						</transition-group>
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
					this.$log.debug(el.classList, el.childNodes);
					// el.style.transform = 'translate3d(200px, 200px, 0)';
					// el.style.border = '2px solid yellow';
					// done();
				},
				afterEnter: el => {
					this.$log.debug('@afterEnter', el);
					setTimeout(() => {
						this.onCardDrawnAnimationEnd();
					}, 500);
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
				this.cardDrawn = null;
				this.isDrawingCard = false;
			}, 2500);
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
	position: relative;
	z-index: 140;

	&.flip-card {
		@include flip-card($flip-speed: 0.5s, $flip-delay: 0.5s);
	}
}

.cardDrawn-enter-active {
	opacity: 1;
	// transition: opacity, transform 1.75s ease-in-out;
	transform: translate3d(0, 0, 0);
}

.cardDrawn-enter-to {
	transform: translate3d(200px, 0, 0);
}

.cardDrawn-leave-to {
	transition: opacity 1s linear;
	opacity: 0;
	// border: 2px dashed red;
}

.card-shown-enter-active {
	opacity: 1;
}
.card-shown-leave-active {
	transition: opacity 0.55s;
	opacity: 0;
}

.dropdown {
	margin-top: 1rem;

	.dropdown-menu {
		max-height: 200px;
		overflow: auto;
	}
}
</style>
