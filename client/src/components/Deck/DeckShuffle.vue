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
				if (this.shuffleCount >= 1) {
					this.$emit('update:cards-shuffled', true);
				} else {
					this.shuffleCount++;
					this.shuffleCards();
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
				transform: `translate(0px, ${pos}px)`,
				zIndex: i,
			});
		}

		this.shuffleCards();
		// this.shuffleCount = 2;
		// this.cardsAnimated = this.cards.length;
	},
	methods: {
		shuffleCards() {
			this.cardsAnimated = 0;

			this.$store.dispatch('sound/play', this.$sounds.cardsShuffle, {
				root: true,
			});

			const left = [];
			const right = [];

			for (let i = 0; i < this.totalCards; ++i) {
				const start = 0;
				// const end = Math.ceil(60 * Math.random() + 120);
				const end = 80;

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

			left.forEach(c => {
				setTimeout(() => {
					requestAnimationFrame(this.animateCard.bind(this, c));
				});
			});
			right.forEach(c => {
				setTimeout(() => {
					requestAnimationFrame(this.animateCard.bind(this, c));
				});
			});
		},
		animateCard(c) {
			c.start -= c.speed;

			this.$set(this.cardStyles[c.index], c.direction, c.start);
			const style = this.cardStyles[c.index];

			const xPos = style.left === 0 ? style.right * -1 : style.left;
			const yPos = style.top;

			this.$set(
				this.cardPositions[c.index],
				'transform',
				`translate(${xPos}px, ${yPos}px)`,
			);

			if (Math.abs(c.start) < c.end) {
				c.req = requestAnimationFrame(this.animateCard.bind(this, c));
			} else if (c.start < 0) {
				this.$set(
					this.cardPositions[c.index],
					'zIndex',
					Math.ceil(this.cards.length * Math.random()),
				);

				c.end = 0;

				if (c.speed > 0) {
					c.speed *= -0.84;
				}

				c.speed++;
				c.req = requestAnimationFrame(this.animateCard.bind(this, c));
			} else {
				this.$set(this.cardStyles[c.index], c.direction, 0);
				this.$set(
					this.cardPositions[c.index],
					'transform',
					`translate(0px, ${yPos}px)`,
				);
				this.cardsAnimated++;
			}
		},
	},
};
</script>

<style lang="scss">
@import '~@/components/Deck/deck';
</style>
