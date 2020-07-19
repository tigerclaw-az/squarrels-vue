<template>
	<div class="deck-container">
		<label>Shuffle</label>
		<input v-model="isShuffling" type="checkbox" />
		<div
			:class="{
				'can-draw': true,
			}"
			class="deck"
		>
			<div class="cards-group" @click="onClick">
				<div
					v-show="isDrawingCard"
					ref="card"
					:class="{ 'has-card': cardDrawn }"
					class="card-drawn"
				>
					<div class="btn-card card blank--"></div>
					<Card
						v-if="cardDrawn"
						:id="cardDrawn.id"
						:card-data="cardDrawn"
						card-type="deck"
					></Card>
				</div>
				<Card
					v-for="(n, index) in 120"
					:key="index"
					ref="deck"
					:card-style="cardPosition[index]"
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
			isDealing: false,
			isDrawingCard: false,
			isShuffling: false,
			cardDrawn: {},
			cards: [],
			cardPosition: [],
			cardStyle: [],
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

			this.$set(this.cardStyle, i, {
				left: 0,
				right: 0,
				top: pos,
				zIndex: i,
			});
			this.$set(this.cardPosition, i, this.getStyle(i));
		}
	},
	methods: {
		getStyle(index) {
			const style = this.cardStyle[index];

			const xPos = style.left === 0 ? style.right * -1 : style.left;
			const yPos = style.top;

			return {
				transform: `translate(${xPos}px, ${yPos}px)`,
				zIndex: style.zIndex,
			};
		},
		onClick() {
			this.isDrawingCard = true;
		},
		shuffleCards() {
			const cards = this.$refs.deck;

			const left = [];
			const right = [];

			this.cardsShuffled = 0;

			for (let i = 0; i < cards.length; ++i) {
				const start = 0;
				// const end = Math.ceil(60 * Math.random() + 120);
				const end = 105;

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

			left.forEach(c => {
				setTimeout(() => {
					this.animateCard(c);
				}, 120 * Math.random());
			});
			right.forEach(c => {
				setTimeout(() => {
					this.animateCard(c);
				}, 120 * Math.random());
			});
		},
		animateCard(c) {
			// this.$log.debug(c);

			c.start -= c.speed;

			this.$set(this.cardStyle[c.index], c.direction, c.start);
			const style = this.cardStyle[c.index];

			const xPos = style.left === 0 ? style.right * -1 : style.left;
			const yPos = style.top;

			// this.$set(this.cardPosition, c.index, this.getStyle(c.index));
			this.$set(
				this.cardPosition[c.index],
				'transform',
				`translate(${xPos}px, ${yPos}px)`,
			);

			if (Math.abs(c.start) < c.end) {
				c.req = requestAnimationFrame(this.animateCard.bind(this, c));
			} else if (c.start < 0) {
				this.$set(
					this.cardPosition[c.index],
					'zIndex',
					Math.ceil(this.cards.length * Math.random()),
				);

				c.end = 0;

				if (c.speed > 0) {
					c.speed *= -1;
				}

				c.speed += 1;
				c.req = requestAnimationFrame(this.animateCard.bind(this, c));
			} else {
				this.$set(this.cardStyle[c.index], c.direction, 0);
				// this.$set(this.cardPosition, c.index, this.getStyle(c.index));
				this.$set(
					this.cardPosition[c.index],
					'transform',
					`translate(0px, ${yPos}px)`,
				);
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
}
.card-drawn {
	left: 0;
	position: absolute;
	top: 0;
	z-index: 99;

	&.has-card {
		@include flip-card($flip-speed: 1s, $flip-delay: 0.5s);
	}
}
</style>
