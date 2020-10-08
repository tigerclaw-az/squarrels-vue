<template>
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
					@after-enter="onTransition.afterEnter"
					@leave="onTransition.leave"
				>
					<div
						v-show="isDrawingCard"
						ref="card"
						:class="{ 'flip-card': cardDrawn }"
						class="card-drawn"
					>
						<span ref="cardFlip" class="btn-card card blank--"></span>
						<Card
							v-if="cardDrawn"
							:id="cardDrawn.id"
							:card-data="cardDrawn"
							card-type="deck"
						></Card>
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
					// el.style.transform = 'translate3d(200px, 200px, 0)';
					// done();
				},
				afterEnter: el => {
					this.$log.debug('after-enter', el);
				},
				leave: el => {
					// el.style.transform = 'translate3d(0, 0, 0)';
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
		this.$nextTick(() => {
			this.$cardFlipEl = this.$refs.cardFlip;
			this.$cardFlipEl.addEventListener(
				'animationend',
				this.onCardDrawnAnimationEnd,
			);
		});
	},
	methods: {
		onCardDrawn: function(cardDrawn) {
			this.$log.debug(cardDrawn);
			setTimeout(() => {
				this.isDrawingCard = false;
				this.cardDrawn = null;
			}, 1500);
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
			}, 3000);
		},

		// moveCard: function() {
		// 	const xPos = (this.cardDrawnPosition.left -= 20);
		// 	const yPos = (this.cardDrawnPosition.top += 10);

		// 	this.$cardDrawnEl.style.transform = `translate(${xPos}px, ${yPos}px)`;

		// 	this.$log.debug('x: ', `${xPos} < ${(window.innerWidth / 2) * -1}`);
		// 	this.$log.debug('y: ', `${yPos} < ${window.innerHeight / 2}`);

		// 	if (
		// 		xPos < (window.innerWidth / 2) * -1 ||
		// 		yPos > window.innerHeight / 2
		// 	) {
		// 		this.$log.debug(
		// 			'! STOP !',
		// 			this.isDrawingCard &&
		// 				(isEmpty(this.cardDrawn) ||
		// 					xPos > (window.innerWidth / 2) * -1 ||
		// 					yPos < window.innerHeight / 2),
		// 		);
		// 	}

		// 	if (this.isDrawingCard) {
		// 		if (this.myPlayer.isActive && isEmpty(this.cardDrawn)) {
		// 			window.requestAnimationFrame(this.moveCard);
		// 		} else if (
		// 			xPos < (window.innerWidth / 2) * -1 ||
		// 			yPos < window.innerHeight
		// 		) {
		// 			window.requestAnimationFrame(this.moveCard);
		// 		}
		// 	}
		// },
		moveCard() {
			// const xPos = -200;
			// const yPos = 300;
			// this.$refs.card.style.transform = `translate(${xPos}px, ${yPos}px)`;
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
	// left: 0;
	// position: absolute;
	// top: 0;
	// transition: transform 1.75s ease-in-out;
	z-index: 140;

	&.flip-card {
		@include flip-card($flip-speed: 1s, $flip-delay: 0.75s);
	}
}

.cardDrawn-enter-active,
.cardDrawn-leave-active {
	transition: transform 1.75s ease-in-out;
}

.cardDrawn-enter-to {
	transform: translate3d(200px, 200px, 0);
}

.cardDrawn-leave-to {
	.card.btn-card {
		opacity: 0;
	}
}

.dropdown {
	margin-top: 1rem;

	.dropdown-menu {
		max-height: 200px;
		overflow: auto;
	}
}
</style>
