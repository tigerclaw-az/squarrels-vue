<template>
	<div
		:class="{
			'can-draw': canDrawCard && !isCardDrawn,
			'disabled': isDisabled,
			'empty': !numCards,
		}"
		class="deck"
	>
		<div class="cards-group" @click="onClick">
			<div v-show="!canDrawCard || isCardDrawn" class="overlay">
				<icon name="ban" scale="10" class="icon" />
			</div>
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
				v-for="index in numCards"
				:key="index"
				ref="deck"
				:card-style="cardPositions[index]"
				card-type="deck"
			/>
		</div>
		<div v-if="isAdmin" uib-dropdown>
			<b-dropdown id="dropdown-settings" text="Choose Card" variant="primary">
				<b-dropdown-item
					v-for="(item, index) in dropdownList"
					:key="index"
					:data-id="item.id"
					:data-type="item.cardType"
					:data-name="item.name"
					@click="onClickDrawCard(item)"
				>
					{{ item.name }}
				</b-dropdown-item>
			</b-dropdown>
		</div>
	</div>
</template>

<script>
import { mapGetters, mapState } from 'vuex';

import Icon from 'vue-awesome/components/Icon';

import Card from '@/components/Card/Card.vue';

export default {
	name: 'deck-main',
	components: {
		Card,
		icon: Icon,
	},
	props: {
		cards: {
			type: Array,
			required: true,
		},
		isShuffling: {
			type: Boolean,
			default: false,
		},
		numCards: {
			type: Number,
			required: true,
		},
	},
	data: function() {
		return {
			isCardDrawn: false,
			cardDrawn: null,
			cardPositions: [],
			cardStyles: [],
			cardsShuffled: 0,
		};
	},
	computed: {
		...mapGetters({
			canDrawCard: 'players/canDrawCard',
			myPlayer: 'players/getMyPlayer',
		}),
		...mapState(['isAdmin']),
		...mapState({
			decks: state => state.decks,
		}),
		...mapState('game', ['isDrawingCard']),
		dropdownList: function() {
			return this.cards;
		},
		isDisabled: function() {
			return !this.canDrawCard;
		},
	},
	watch: {
		cardsShuffled(val) {
			if (val === this.cards.length) {
				this.$log.debug('CARDS SHUFFLED!');
			}
		},
		isDrawingCard(val) {
			this.$log.debug(val);

			if (!val) {
				return;
			}

			this.$cardDrawnEl.style.left = '0px';

			// Animate card draw for all players
			window.requestAnimationFrame(this.moveCard);

			// Only valid for current player drawing card
			if (this.isCardDrawn) {
				this.$store
					.dispatch('decks/drawCard')
					.then(card => {
						this.cardDrawn = card;
					})
					.catch(err => {
						this.$log.error(err);
						this.$toasted.error(`Error drawing card! ${err}`);
					});
			}
		},
		isShuffling() {
			this.shuffleCards();
		},
	},
	mounted: function() {
		// Setup position of cards in deck
		for (let i = 0; i < this.cards.length; i++) {
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
			this.$cardDrawnEl = this.$refs.card;
			this.$cardDrawnEl.addEventListener(
				'animationend',
				this.onCardDrawnAnimationEnd,
			);
		});
	},
	methods: {
		onCardDrawn: function(cardDrawn) {
			const cardAction = cardDrawn.action;

			let dispatchAction = 'players/addCards';
			let cardData = { cards: [cardDrawn] };

			this.$log.debug(cardDrawn, cardAction, this);

			if (cardAction) {
				cardData = cardDrawn;
				dispatchAction = 'game/actionCard';
			}

			this.$store.dispatch(dispatchAction, cardData).then(() => {
				this.isCardDrawn = false;
				this.cardDrawn = null;
			});
		},
		onCardDrawnAnimationEnd: function() {
			this.$log.debug('animation ended -> ', this.cardDrawn);

			// this.$store.commit(`game/${mutationTypes.game.TOGGLE_DRAW_CARD}`, false);
			this.$store.dispatch('game/update', { isDrawingCard: false });

			this.onCardDrawn(this.cardDrawn);
		},
		onClick: function() {
			if (this.canDrawCard) {
				this.isCardDrawn = true;

				this.$store.dispatch('players/drawCard', this.myPlayer);
			}
		},
		onClickDrawCard: function(adminCard) {
			this.$log.debug(adminCard);

			this.$store
				.dispatch('decks/drawCard', { adminCard })
				.then(card => {
					this.onCardDrawn(card);
				})
				.catch(err => {
					this.$log.error(err);
					this.$toasted.error(`Error drawing card! ${err}`);
				});
		},
		moveCard: function() {
			const left = parseInt(this.$cardDrawnEl.style.left);

			this.$cardDrawnEl.style.left = left - 10 + 'px';

			if (!this.cardDrawn && this.isDrawingCard) {
				window.requestAnimationFrame(this.moveCard);
			}
		},
		shuffleCards() {
			const left = [];
			const right = [];

			this.cardsShuffled = 0;

			for (let i = 0; i < this.cards.length; ++i) {
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

			this.$set(this.cardStyles[c.index], c.direction, c.start);
			const style = this.cardStyles[c.index];

			const xPos = style.left === 0 ? style.right * -1 : style.left;
			const yPos = style.top;

			// this.$set(this.cardPositions, c.index, this.getStyle(c.index));
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
					c.speed *= -1;
				}

				c.speed += 1;
				c.req = requestAnimationFrame(this.animateCard.bind(this, c));
			} else {
				this.$set(this.cardStyles[c.index], c.direction, 0);
				// this.$set(this.cardPositions, c.index, this.getStyle(c.index));
				this.$set(
					this.cardPositions[c.index],
					'transform',
					`translate(0px, ${yPos}px)`,
				);
				this.cardsShuffled++;
			}
		},
	},
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style lang="scss" scoped>
// prettier-ignore
@import "~@/assets/scss/variables";

.count {
	bottom: 0;
	color: $black;
	font-size: 1.25rem;
	font-weight: $font-weight-bold;
	position: absolute;
	z-index: 1;
}

.overlay {
	left: 0;
	position: absolute;
	top: 0;
	width: 100%;
	z-index: 130;

	.icon {
		color: theme-color('primary');
		display: flex;
		height: 100%;
		margin: 0 auto;
	}
}

.card-drawn {
	left: 0;
	position: absolute;
	top: 0;
	z-index: 140;

	&.has-card {
		@include flip-card($flip-speed: 1s, $flip-delay: 0.5s);
	}
}

.dropdown ::v-deep {
	margin-top: 1rem;

	.dropdown-menu {
		max-height: 200px;
		overflow: auto;
	}
}
</style>
