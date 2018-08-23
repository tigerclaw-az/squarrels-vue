<template>
	<div class="sq-player"
	:class="{
		active: isActivePlayer,
		current: isCurrentPlayer,
		'my-turn': isMyTurn,
	}">
		<div class="sq-player-thumbnail">
			<img class="img-circle" src="@/assets/images/squirrel-placeholder.jpg"/>
			<PlayerStorage :player="player"></PlayerStorage>
		</div>
		<div class="sq-player-name">{{player.name}}</div>
		<PlayerQuarrel :player="player"></PlayerQuarrel>
		<div v-if="isCurrentPlayer" class="sq-player-cards">
			<div v-if="player.message" class="sq-quarrel-message">{{player.message}}</div>
			<div v-if="hasCards" class="cards-group hand">
				<transition-group name="cards">
					<Card
						v-for="(card, index) in myCardsSorted"
						:key="card.id"
						:id="card.id"
						:class="{ mine: hasCards }"
						:onClick="onClickCard"
						:card-data="card"
						card-type="hand"
						:cardStyle="cardStyle(index)"
						:matches="card.cardType === 'special' ? [] : findCardMatches(card.amount)"
					></Card>
				</transition-group>
			</div>
		</div>
		<player-storage-modal :player="player"></player-storage-modal>
	</div>
</template>

<script>
import { mapGetters, mapState } from 'vuex';

import _ from 'lodash';

import api from '@/api/index';
import Card from '@/components/Card/Card.vue';
import PlayerQuarrel from '@/components/Player/PlayerQuarrel.vue';
import PlayerStorage from '@/components/Player/PlayerStorage.vue';
import PlayerStorageModal from '@/components/Player/PlayerStorageModal.vue';

export default {
	name: 'Player',
	components: {
		Card,
		PlayerQuarrel,
		PlayerStorage,
		'player-storage-modal': PlayerStorageModal,
	},
	props: {
		player: {
			type: Object,
			required: true,
		},
	},
	data: function() {
		return {
			myCardsDetails: [],
		};
	},
	computed: {
		...mapGetters({
			myPlayer: 'players/getMyPlayer',
		}),
		...mapState({
			actionCard: state => state.game.actionCard,
			isGameStarted: state => state.game.isStarted,
		}),
		hasCards: function() {
			let cards = this.myCards;

			return cards && cards.length;
		},
		isActivePlayer: function() {
			return this.player.isActive;
		},
		isCurrentPlayer: function() {
			return this.myPlayer.id === this.player.id;
		},
		isMyTurn: function() {
			return this.isActivePlayer && this.myPlayer.id === this.player.id;
		},
		myCards: function() {
			return this.myPlayer.cardsInHand;
		},
		myCardsSorted: function() {
			// return _.sortBy(this.myCardsDetails, ['amount']);
			return this.myCardsDetails;
		},
	},
	watch: {
		isMyTurn: function(to, from) {
			if (to && to !== from) {
				this.$toasted.success('YOUR TURN', {
					duration: 1000,
				});
				this.$store.dispatch('sound/play', 'active-player');
			}
		},
		myCards: function(newCards, oldCards) {
			const diff1 = _.difference(newCards, oldCards);
			const diff2 = _.difference(oldCards, newCards);

			if (!this.myCards.length || (!diff1.length && !diff2.length)) {
				return;
			}

			this.getCardDetails();
		},
	},
	beforeMount: function() {
		if (this.myCards && this.myCards.length) {
			this.getCardDetails();
		}
	},
	methods: {
		cardStyle: function(index) {
			let cardsCount = this.myCards.length;
			let styles = {
				'z-index': index + 1,
			};
			const halfCardsCount = cardsCount / 2;
			// const rotate = 90 / cardsCount + 20;
			const spacing = 400 / cardsCount;
			let spacingMultiplier = index - halfCardsCount;

			if (index > halfCardsCount) {
				spacingMultiplier = Math.abs(halfCardsCount - index);
				// styles.top = index * Math.abs(halfCardsCount - index) + 'px';
			}

			styles.left = spacing * spacingMultiplier + 'px';
			// styles.left = `${spacing * spacingMultiplier}px`;
			// styles.transform = `rotate(${rotateBy * rotateMultiplier}deg)`;

			return styles;
		},
		discard: function(card) {
			this.$log.debug(card);

			this.$store.dispatch('sound/play', 'discard');

			let deckUpdate = this.$store.dispatch('decks/discard', card);
			let playerUpdate = this.$store.dispatch('players/discard', {
				card,
			});

			Promise.all([deckUpdate, playerUpdate])
				.then(() => {
					this.$store.dispatch('players/nextPlayer');
				})
				.catch(err => {
					this.$log.error(err);
					this.$toasted.error(
						`ERROR: Unable to discard card: ${card.name}`
					);
				});
		},
		findCardMatches: function(amount) {
			const groups = _.groupBy(this.myCardsDetails, c => c.amount);

			if (groups[5] && groups[5].length) {
				groups[5] = _.filter(groups[5], c => c.cardType !== 'special');
			}

			if (groups[amount].length >= 3) {
				return groups[amount];
			}

			return [];
		},
		getCardDetails: function() {
			api.cards
				.get(this.myCards.join(','))
				.then(res => {
					if (res.status === 200) {
						this.myCardsDetails = res.data;
					}
				})
				.catch(err => {
					this.$log.error('myCards->get', err);
				});
		},
		onClickCard: function(card, cardsToStore, evt) {
			this.$log.debug(card, cardsToStore, evt);

			if (this.myPlayer.quarrel) {
				this.$store.dispatch('players/selectQuarrelCard', {
					id: this.myPlayer.id,
					card,
				});

				this.$store
					.dispatch('players/discard', {
						card,
					})
					.catch(err => {
						this.$log.error(err);
						this.$toasted.error(err.toString());
					});
			}

			// User can't click card if action card has been drawn
			if (this.actionCard || !this.myPlayer.hasDrawnCard) {
				return false;
			}

			if (this.myPlayer.isActive) {
				if (
					card.cardType === 'special' &&
					this.myPlayer.totalCards > 1
				) {
					this.$toasted.error(
						'You cannot discard this card unless it is your ONLY card.'
					);

					return false;
				}

				// If the card selected doesn't have at least 3 matching cards
				// then we are just discarding the selected card
				if (cardsToStore.length < 3) {
					return this.discard(card);
				}

				// If the card selected has at least 3 matching cards
				// then we are storing the cards for end of game
				if (cardsToStore.length >= 3) {
					cardsToStore = _.sampleSize(cardsToStore, 3);

					return this.storeCards(cardsToStore);
				}
			}
		},
		storeCards: function(cardsToStore) {
			this.$log.debug(cardsToStore);

			this.$store
				.dispatch('players/storeCards', {
					id: this.myPlayer.id,
					cards: cardsToStore,
					cardsInHand: this.myCards,
				})
				.then(res => {
					this.$log.debug(res);
				})
				.catch(err => {
					this.$log.error(err);
				});
		},
	},
};
</script>

<style lang="scss">
// prettier-ignore
@import "~@/assets/scss/variables";
// prettier-ignore
@import "~@/../node_modules/bootstrap/scss/mixins/breakpoints";

$card-height: (
	small: 150,
	medium: 150,
);

$card-width: (
	small: 100,
	medium: 100,
);

// prettier-ignore
@import "~@/components/Card/card";

.sq-player {
	align-content: center;
	align-items: center;
	display: flex;
	flex-flow: column nowrap;
	position: relative;
	text-align: center;
	width: 100%;
	z-index: 10;

	.sq-player-thumbnail {
		position: relative;
		z-index: 60;

		img {
			width: 6.5rem;
		}
	}

	.sq-player-name {
		color: inherit;
		font-size: 1.5em;
		font-weight: $font-weight-bold;
	}

	&.current {
		.btn-card {
			&:not(.disabled) {
				cursor: pointer;
			}

			&.selected,
			&:hover {
				.card {
					transform: translateY(-15%);
				}
			}
		}
	}

	&.active {
		// prettier-ignore
		color: color("zest");
	}

	.sq-quarrel-message {
		color: $white;
		font-size: 1.25em;
		left: 20%;
		position: absolute;

		&::after {
			content: '->';
		}
	}

	.sq-player-cards {
		align-items: center;
		display: flex;
		height: 100%;
		justify-content: center;
		position: absolute;
		top: -3.5rem;
		width: 100%;
		z-index: 5;

		.cards-group {
			@extend %playing-cards;
			height: 100%;

			.cards-enter-active,
			.cards-leave-active {
				position: absolute;
				transition-duration: 0.75s;
				transition-property: opacity, transform;
			}

			.cards-enter {
				opacity: 0;
				transform: translateY(-3rem);
			}

			.cards-enter-to {
				opacity: 1;
				transform: translateY(0);
			}

			.cards-leave-to {
				opacity: 0;
				transform: translateY(3rem);
			}

			.btn-card {
				width: rem-calc($card-width-stack);
			}
		}
	}
}
</style>
