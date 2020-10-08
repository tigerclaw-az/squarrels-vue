<template>
	<div class="deck-container">
		<div class="deck">
			<div class="cards-group">
				<Card
					v-for="(n, index) in totalCards"
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
import Card from '@/components/Card/Card.vue';

export default {
	components: {
		Card,
	},
	props: {
		cards: {
			type: Array,
			required: true,
		},
		cardsShuffled: {
			type: Boolean,
			default: false,
		},
	},
	data() {
		return {
			cardPositions: [],
			cardStyles: [],
			cardsAnimated: 0,
			shuffleCount: 0,
		};
	},
	computed: {
		totalCards() {
			return this.cards.length;
		},
	},
	watch: {
		cardsAnimated(val) {
			if (val === this.cards.length) {
				if (this.shuffleCount >= 2) {
					setTimeout(() => {
						this.$emit('update:cards-shuffled', true);
					}, 750);
				} else {
					this.shuffleCount++;
					setTimeout(() => {
						this.shuffleCards();
					}, 600);
				}
			}
		},
	},
	mounted() {
		for (let i = 0; i < this.totalCards; i++) {
			const pos = i * -0.25;

			this.$set(this.cardStyles, i, {
				left: 0,
				right: 0,
				top: pos,
				zIndex: i,
			});
			this.$set(this.cardPositions, i, {
				transform: `translate3d(0, ${pos}px, 0)`,
				zIndex: i,
			});
		}

		this.shuffleCards();
		// this.shuffleCount = 2;
		// this.cardsAnimated = this.cards.length;
	},
	methods: {
		setCardStyle(card, styleObj) {
			this.$set(this.cardPositions[card.index], 'transform', styleObj.transform);
			this.$set(this.cardPositions[card.index], 'zIndex', styleObj.zIndex);
		},
		shuffleCards() {
			this.cardsAnimated = 0;

			this.$store.dispatch('sound/play', this.$sounds.cardsShuffle, {
				root: true,
			});

			const left = [];
			const right = [];

			for (let i = 0; i < this.totalCards; ++i) {
				const start = 0;
				const end = 110;

				const card = {
					index: i,
					speed: 1000 / 60,
					start,
					end,
				};

				if (Math.random() <= 0.5) {
					card.direction = 'left';
					left.push(card);
				} else {
					card.direction = 'right';
					right.push(card);
				}
			}

			left.forEach((c, idx) => {
				setTimeout(() => {
					this.animateCard(c);
				}, 25 * idx * 0.16);
			});
			right.forEach((c, idx) => {
				setTimeout(() => {
					this.animateCard(c);
				}, 25 * idx * 0.16);
			});
		},
		animateCard(c) {
			// this.$log.debug(c);

			c.start -= c.speed;

			this.$set(this.cardStyles[c.index], c.direction, c.start);
			const style = this.cardStyles[c.index];

			const xPos = style.left === 0 ? style.right * -1 : style.left;
			const yPos = style.top;

			if (Math.abs(c.start) < c.end) {
				c.req = requestAnimationFrame(this.animateCard.bind(this, c));
			} else if (c.start < 0) {
				if (c.end !== 0) {
					this.setCardStyle(c, {
						transform: `translate3d(${xPos}px, ${yPos}px, 0)`,
						zIndex: Math.ceil(this.cards.length * Math.random()),
					});
				}

				c.end = 0;

				if (c.speed > 0) {
					c.speed *= -1;
				}

				c.speed += 1;
				c.req = requestAnimationFrame(this.animateCard.bind(this, c));
			} else {
				this.$set(this.cardStyles[c.index], c.direction, 0);

				this.setCardStyle(c, {
					transform: `translate3d(0px, ${yPos}px, 0)`,
					zIndex: c.index,
				});

				this.cardsAnimated++;
			}
		},
	},
};
</script>

<style lang="scss">
@import '~@/components/Deck/deck';

.cards-group .btn-card {
	transition: transform 0.65s ease-in-out;
}
</style>
