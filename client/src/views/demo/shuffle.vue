<template>
	<div class="deck-container">
		<b-row>
			<label>Shuffle</label>
			<input v-model="isShuffling" type="checkbox" />
		</b-row>
		<div class="deck">
			<div class="cards-group">
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
import Card from '@/components/Card/Card.vue';

export default {
	components: {
		Card,
	},
	data() {
		return {
			isShuffling: false,
			cards: [],
			cardPositions: [],
			cardStyles: [],
			cardsShuffled: 0,
		};
	},
	watch: {
		isShuffling() {
			this.shuffleCards();
		},
		cardsShuffled(val) {
			if (val === this.cards.length) {
				this.$log.debug('CARDS SHUFFLED!');
			}
		},
	},
	mounted() {
		this.cards = this.$refs.deck;
		for (let i = 0; i < this.cards.length; i++) {
			const pos = i * -0.25;

			this.$set(this.cardStyles, i, {
				left: 0,
				right: 0,
				top: pos,
				zIndex: i,
			});
			this.$set(this.cardPositions, i, this.getStyle(i));
		}
	},
	methods: {
		getStyle(index) {
			const style = this.cardStyles[index];

			const xPos = style.left === 0 ? style.right * -1 : style.left;
			const yPos = style.top;

			return {
				transform: `translate3d(${xPos}px, ${yPos}px, 0)`,
				zIndex: style.zIndex,
			};
		},
		setCardStyle(card, styleObj) {
			this.$set(this.cardPositions[card.index], 'transform', styleObj.transform);

			this.$set(this.cardPositions[card.index], 'zIndex', styleObj.zIndex);
		},
		shuffleCards() {
			const cards = this.$refs.deck;

			const left = [];
			const right = [];

			this.cardsShuffled = 0;

			for (let i = 0; i < cards.length; ++i) {
				const start = 0;
				const end = 90;

				const card = {
					index: i,
					speed: 15,
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

			this.$log.debug(left, right);

			left.forEach((c, idx) => {
				setTimeout(() => {
					this.animateCard(c);
				}, (25 * idx) * 0.16);
			});
			right.forEach((c, idx) => {
				setTimeout(() => {
					this.animateCard(c);
				}, (25 * idx) * 0.16);
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

				this.cardsShuffled++;
			}
		},
	},
};
</script>

<style lang="scss" scoped>
@import '~@/components/Deck/deck';
@import '~@/assets/scss/variables';

.deck-container {
	margin: 0 auto;
	margin-top: 4rem;
	max-width: 25%;

	.cards-group .btn-card {
		transition: transform 0.5s ease-in-out;
	}
}
</style>
