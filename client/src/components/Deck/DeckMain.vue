<template>
	<div
		class="deck"
		:class="{
			'can-draw': canDrawCard && !isCardDrawn,
			'empty': !numCards,
		}"
	>
		<div class="count">{{numCards}}</div>
		<div v-show="!canDrawCard || isCardDrawn" class="overlay">
			<icon name="ban" scale="7" class="icon"></icon>
		</div>
		<div
			class="cards-group"
			:class="{ disabled: isDisabled }"
			role="button"
			@click.prevent="onClick"
		>
			<div v-show="isCardDrawn" class="card-drawn" :style="cardDrawnStyle(numCards)">
				<span class="card blank--"></span>
				<Card
					v-if="cardDrawn"
					:id="cardDrawn.id"
					:card-data="cardDrawn"
					card-type="deck"
					ref="card"
				>
				</Card>
			</div>
			<span
				v-for="(card, index) in numCards"
				:key="index"
				class="card blank--"
				:style="cardStyle(index)"
			>
			</span>
		</div>
		<div v-if="isAdmin" uib-dropdown>
			<b-dropdown
				id="dropdown-settings"
				text="Choose Card"
				variant="danger"
			>
				<b-dropdown-item
					v-for="(item, index) in dropdownList"
					:key="index"
					:data-id="item.id"
					:data-type="item.cardType"
					:data-name="item.name"
					@click="onClickDrawCard(item)"
				>
				{{item.name}}
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
	name: 'DeckMain',
	props: {
		cards: {
			type: Array,
			required: true,
		},
		numCards: {
			type: Number,
			required: true,
		},
	},
	data: function() {
		return {};
	},
	mounted: function() {
		this.$nextTick(() => {
			this.$cardDrawnEl = this.$el.querySelector('.card-drawn');
			this.$cardDrawnEl.addEventListener(
				'animationend',
				this.onCardDrawnAnimationEnd
			);
		});
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
		cardDrawn: function() {
			return this.decks.cardDrawn;
		},
		dropdownList: function() {
			return this.cards;
		},
		isCardDrawn: function() {
			return this.decks.isCardDrawn;
		},
		isDisabled: function() {
			return !this.canDrawCard;
		},
	},
	methods: {
		cardDrawnStyle: function(val) {
			const pos = val * -0.25;

			return {
				left: `${pos}px`,
				top: `${pos}px`,
			};
		},
		cardStyle: function(index) {
			const pos = index * -0.25;

			return {
				transform: `translate(${pos}px, ${pos}px)`,
			};
		},
		handleCardDrawn: function(cardDrawn) {
			const cardAction = cardDrawn.action;

			let dispatchAction = 'players/addCards';
			let cardData = { cards: [cardDrawn] };

			this.$log.debug(cardDrawn, cardAction, this);

			this.$store.commit('decks/TOGGLE_CARD_DRAWN');
			this.$store.commit('decks/UPDATE_CARD_DRAWN', null);

			if (cardAction) {
				cardData = cardDrawn;
				dispatchAction = 'game/actionCard';
			}

			this.$store.dispatch(dispatchAction, cardData);
		},
		onCardDrawnAnimationEnd: function() {
			this.$log.debug('animation ended -> ', this.cardDrawn);

			if (this.cardDrawn) {
				this.handleCardDrawn(this.cardDrawn);
			}
		},
		onClick: function() {
			if (this.canDrawCard) {
				this.$store.dispatch('players/drawCard', this.myPlayer);

				let timer = setInterval(() => {
					let left = parseInt(this.$cardDrawnEl.style.left);

					this.$cardDrawnEl.style.left = left - 15 + 'px';
				}, 20);

				this.$store
					.dispatch('decks/drawCard')
					.then(card => {
						// this.handleCardDrawn(card);
						timer.clearInterval();
					})
					.catch(err => {
						this.$log.error(err);
						this.$toasted.error(`Error drawing card! ${err}`);
					});
			}
		},
		onClickDrawCard: function(adminCard) {
			this.$log.debug(adminCard);

			this.$store
				.dispatch('decks/drawCard', { adminCard })
				.then(card => {
					this.handleCardDrawn(card);
				})
				.catch(err => {
					this.$log.error(err);
					this.$toasted.error(`Error drawing card! ${err}`);
				});
		},
	},
	components: {
		Card,
		icon: Icon,
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
	left: 50%;
	position: absolute;
	transform: translateX(-50%);
	z-index: 1;
}

.can-draw {
	.cards-group {
		// prettier-ignore
		border: 2px dashed get-color("zest");
		// prettier-ignore
		box-shadow: 0 0 15px 10px theme-color("success");
	}
}

.overlay {
	height: 100%;
	position: absolute;
	width: 100%;
	z-index: 5;

	.icon {
		// prettier-ignore
		color: theme-color("danger");
		display: flex;
		height: 100%;
		margin: 0 auto;
	}
}

.card-drawn {
	@include flip-card;

	position: absolute;
	transform: translateX(0);
	transition-duration: 5.5s;
	transition-property: transform;
	z-index: 99;
}

.dropdown {
	margin-top: 1rem;

	.dropdown-menu {
		max-height: 200px;
		overflow: auto;
	}
}
</style>
