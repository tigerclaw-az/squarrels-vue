<template>
	<div
		:class="{
			'can-draw': canDrawCard && !isCardDrawn,
			'empty': !numCards,
		}"
		class="deck"
	>
		<div v-show="!canDrawCard || isCardDrawn" class="overlay">
			<icon name="ban" scale="7" class="icon" />
		</div>
		<div
			:class="{ disabled: isDisabled }"
			class="cards-group"
			role="button"
			@click.prevent="onClick"
		>
			<div
				v-show="isCardDrawn"
				:class="{ 'has-card': cardDrawn }"
				:style="cardDrawnStyle(numCards)"
				class="card-drawn"
			>
				<div
					class="btn-card card blank-- disabled"
					role="button"
					disabled
				></div>
				<Card
					v-if="cardDrawn"
					:id="cardDrawn.id"
					ref="card"
					:card-data="cardDrawn"
					card-type="deck"
				></Card>
			</div>
			<Card
				v-for="index in numCards"
				:key="index"
				:card-style="cardStyle(index)"
				card-type="deck"
			/>
		</div>
		<div class="count">{{ numCards }}</div>
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
		numCards: {
			type: Number,
			required: true,
		},
	},
	data: function() {
		return {
			isCardDrawn: false,
			cardDrawn: null,
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
		dropdownList: function() {
			return this.cards;
		},
		isDisabled: function() {
			return !this.canDrawCard;
		},
	},
	created: function() {
		this.$nextTick(() => {
			this.$cardDrawnEl = this.$el.querySelector('.card-drawn');
			this.$cardDrawnEl.addEventListener(
				'animationend',
				this.onCardDrawnAnimationEnd,
			);
		});
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

			if (cardAction) {
				cardData = cardDrawn;
				dispatchAction = 'game/actionCard';
			}

			this.$store.dispatch(dispatchAction, cardData).then(() => {
				this.$cardDrawnEl.style.left = '0px';
				this.isCardDrawn = false;
				this.cardDrawn = null;
			});
		},
		onCardDrawnAnimationEnd: function() {
			this.$log.debug('animation ended -> ', this.cardDrawn);

			setTimeout(() => {
				if (this.cardDrawn) {
					this.handleCardDrawn(this.cardDrawn);
				}
			}, 500);
		},
		onClick: function() {
			if (this.canDrawCard) {
				this.isCardDrawn = true;

				this.$store.dispatch('players/drawCard', this.myPlayer);

				window.requestAnimationFrame(this.moveCard);

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
		moveCard: function() {
			const left = parseInt(this.$cardDrawnEl.style.left);

			this.$cardDrawnEl.style.left = left - 2.5 + 'px';

			if (left > -100) {
				window.requestAnimationFrame(this.moveCard);
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

.can-draw {
	.cards-group {
		// prettier-ignore
		box-shadow: 0 0 15px 10px color("desert");
	}
}

.overlay {
	height: 100%;
	position: absolute;
	width: 100%;
	z-index: 5;

	.icon {
		// prettier-ignore
		color: theme-color("primary");
		display: flex;
		height: 100%;
		margin: 0 auto;
	}
}

.card-drawn {
	position: absolute;
	z-index: 99;

	&.has-card {
		@include flip-card($flip-speed: 1s, $flip-delay: 1s);
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
