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
			<transition name="cardDrawn" @enter="onTransitionEnter">
				<div
					v-show="isDrawingCard"
					ref="card"
					:class="{ 'flip-card': cardDrawn }"
					class="card-drawn"
				>
					<transition-group name="card-shown" @after-enter="afterCardShown">
						<div key="blank" class="btn-card card blank--"></div>

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
import { isEmpty } from 'lodash';
import { mapGetters, mapState } from 'vuex';

import Icon from 'vue-awesome/components/Icon';

import Card from '@/components/Card/Card.vue';
import { GAME_STATUS } from '@/constants';
import mutationTypes from '@/store/mutation-types';

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
			// isCardDrawn: false,
			cardDrawn: null,
			cardPositions: [],
			cardStyles: [],
		};
	},
	computed: {
		...mapGetters({
			canDrawCard: 'players/canDrawCard',
			myPlayer: 'players/getMyPlayer',
		}),
		...mapState(['isAdmin']),
		...mapState('decks', ['isCardDrawn']),
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

			// Only valid for current player drawing card
			if (
				this.$store.state.game.status !== GAME_STATUS.DEALING &&
				this.myPlayer.isActive &&
				!this.isCardDrawn
			) {
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
				transform: `translate3d(0px, ${pos}px, 0)`,
				zIndex: i,
			});
		}
	},
	methods: {
		onTransitionEnter(el) {
			this.$log.debug(el);
			// el.style.transform = 'translate(-200px, 200px)';
		},
		afterCardShown(el) {
			this.$log.debug('@afterEnter', el);
			setTimeout(() => {
				this.onCardDrawnAnimationEnd();
			}, 500);
		},
		async onCardDrawn(cardDrawn) {
			this.$log.debug(cardDrawn);

			const cardAction = cardDrawn.action;

			let dispatchAction = 'players/addCards';
			let cardData = { cards: [cardDrawn] };

			this.$log.debug(cardDrawn, cardAction, this);

			if (cardAction) {
				cardData = cardDrawn;
				dispatchAction = 'game/actionCard';
			}

			try {
				await this.$store.dispatch('game/update', { isDrawingCard: false });
				await this.$store.dispatch(dispatchAction, cardData);
				this.$store.commit(`decks/${mutationTypes.decks.CARD_DRAWN}`, false);
				this.cardDrawn = null;
			} catch (e) {
				this.$log.error(e);
				this.$toasted.error(e);
			}
		},
		// This will get triggered after the card flip animation is completed,
		// it will NOT trigger for cards being dealt to players
		onCardDrawnAnimationEnd: function() {
			this.$log.debug('animation ended -> ', this.cardDrawn);

			this.onCardDrawn(this.cardDrawn);
		},
		onClick: function() {
			if (this.canDrawCard) {
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

	&.flip-card {
		@include flip-card($flip-speed: 0.5s, $flip-delay: 0.5s);
	}
}

.cardDrawn-enter-active,
.cardDrawn-leave-active {
	transition: opacity, transform 1.75s ease-in-out;
	transform: translate3d(0, 0, 0);
}

.cardDrawn-enter-to {
	transform: translate3d(-200px, 200px, 0);
}

.cardDrawn-leave-to {
	opacity: 0;
}

.card-shown-leave-active {
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
