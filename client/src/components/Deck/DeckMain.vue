<template>
	<div
		:class="{
			'can-draw': canDrawCard && !isCardDrawn,
			'disabled': isDisabled,
			'empty': !totalCards,
		}"
		class="deck"
	>
		<div class="cards-group" @click="onClick">
			<div v-show="!canDrawCard || isCardDrawn" class="overlay">
				<icon name="ban" scale="8" class="icon" />
			</div>
			<div
				v-show="isDrawingCard"
				ref="card"
				:class="{ 'has-card': cardDrawn }"
				class="card-drawn"
			>
				<span class="btn-card card blank--"></span>
				<Card
					v-if="cardDrawn"
					:id="cardDrawn.id"
					:card-data="cardDrawn"
					card-type="deck"
				></Card>
			</div>
			<Card
				v-for="(n, index) in totalCards"
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
		totalCards() {
			return this.cards.length;
		},
	},
	watch: {
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
	},
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style lang="scss">
@import '~@/assets/scss/variables';

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
	left: 0;
	position: absolute;
	top: 0;
	z-index: 140;

	&.has-card {
		@include flip-card($flip-speed: 1s, $flip-delay: 0.75s);
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
