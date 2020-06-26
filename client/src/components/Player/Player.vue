<template>
	<div
		:class="{
			'active': isActivePlayer,
			'current': isCurrentPlayer,
			'my-turn': isMyTurn,
		}"
		class="sq-player"
	>
		<div class="sq-player-thumbnail">
			<img class="img-circle" src="@/assets/images/squirrel-placeholder.jpg" />
			<PlayerStorage :player="player" />
		</div>
		<div class="sq-player-name">{{ player.name }}</div>
		<div class="sq-player-cards">
			<PlayerQuarrel :player="player" />
			<div v-if="isCurrentPlayer && player.message" class="sq-quarrel-message">
				{{ player.message }}
			</div>
			<div class="cards-group hand">
				<transition-group
					v-if="isCurrentPlayer"
					tag="div"
					class="transition"
					name="cards"
				>
					<Card
						v-for="(card, index) in myCards"
						:id="card.id"
						:key="card.id"
						:on-click="onClickCard"
						:card-data="card"
						:card-style="cardStyle(index)"
						:matches="
							card.cardType === 'special' ? [] : findCardMatches(card.amount)
						"
						card-type="hand"
					/>
				</transition-group>
				<transition-group
					v-if="!isCurrentPlayer"
					tag="div"
					class="transition"
					name="cards"
				>
					<Card
						v-for="n in player.totalCards"
						:key="n"
						:card-style="cardStyle(n)"
						card-type="hand"
					/>
				</transition-group>
			</div>
		</div>
		<player-storage-modal :player="player"></player-storage-modal>
	</div>
</template>

<script>
import { mapGetters, mapState } from 'vuex';

import { filter, groupBy, sampleSize } from 'lodash';

import Card from '@/components/Card/Card.vue';
import PlayerQuarrel from '@/components/Player/PlayerQuarrel.vue';
import PlayerStorage from '@/components/Player/PlayerStorage.vue';
import PlayerStorageModal from '@/components/Player/PlayerStorageModal.vue';

export default {
	name: 'player',
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
			// myCardsDetails: [],
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
			const cards = this.myCards;

			return cards && cards.length ? true : false;
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
		// myCardsSorted: function() {
		// 	// return sortBy(this.myCardsDetails, ['amount']);
		// 	return this.myCardsDetails;
		// },
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
		// myCards: function(newCards, oldCards) {
		// 	const diff1 = difference(newCards, oldCards);
		// 	const diff2 = difference(oldCards, newCards);

		// 	if (!this.myCards.length) {
		// 		this.myCardsDetails = [];

		// 		return;
		// 	} else if (!diff1.length && !diff2.length) {
		// 		return;
		// 	}

		// 	this.getCardDetails();
		// },
	},
	// beforeMount: function() {
	// 	if (this.myCards && this.myCards.length) {
	// 		this.getCardDetails();
	// 	}
	// },
	methods: {
		cardStyle: function(index) {
			const cardsCount = this.isCurrentPlayer
				? this.myCards.length
				: this.player.totalCards;

			const styles = {
				'z-index': index + 1,
			};

			const halfCardsCount = cardsCount / 2;
			// const rotate = 90 / cardsCount + 20;
			const spacing = (this.isCurrentPlayer ? 240 : 100) / cardsCount;
			const spacingMultiplier = index - halfCardsCount;

			styles.left = spacing * spacingMultiplier + 'px';
			// styles.transform = `rotate(${rotateBy * rotateMultiplier}deg)`;

			return styles;
		},
		discard: function(card) {
			this.$log.debug(card);

			this.$store.dispatch('sound/play', 'discard');

			const deckUpdate = this.$store.dispatch('decks/discard', card);
			const playerUpdate = this.$store.dispatch('players/discard', {
				card,
			});

			Promise.all([deckUpdate, playerUpdate])
				.then(() => {
					this.$store.dispatch('players/nextPlayer');
				})
				.catch(err => {
					this.$log.error(err);
					this.$toasted.error(`ERROR: Unable to discard card: ${card.name}`);
				});
		},
		findCardMatches: function(amount) {
			const groups = groupBy(this.myCards, c => c.amount);

			if (groups[5] && groups[5].length) {
				groups[5] = filter(groups[5], c => c.cardType !== 'special');
			}

			if (groups[amount].length >= 3) {
				return groups[amount];
			}

			return [];
		},
		// getCardDetails: function() {
		// 	api.cards
		// 		.get(this.myCards.join(','))
		// 		.then(res => {
		// 			if (res.status === 200) {
		// 				this.myCards = res.data;
		// 			}
		// 		})
		// 		.catch(err => {
		// 			this.$log.error('myCards->get', err);
		// 		});
		// },
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
				if (card.cardType === 'special' && this.myPlayer.totalCards > 1) {
					this.$toasted.error(
						'You cannot discard this card unless it is your ONLY card.',
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
					cardsToStore = sampleSize(cardsToStore, 3);

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
	small: 113,
	medium: 138,
);

$card-width: (
	small: 80,
	medium: 100,
);

// prettier-ignore
@import "~@/components/Card/card";

.sq-player {
	color: $white;
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
					transform: translateY(-15%) scale(2);
				}
			}
		}
	}

	&.active {
		// prettier-ignore
		color: color("desert");
	}

	.sq-quarrel-message {
		color: $white;
		font-size: 1.25em;
		left: -20%;
		position: absolute;

		&::after {
			// prettier-ignore
			content: "->";
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

			.transition {
				top: 0;
			}

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
				position: absolute;
				transform: translateY(3rem);
			}
		}
	}

	&:not(.current) {
		.sq-player-cards {
			.cards-group {
				left: 25%;
				position: absolute;
			}
		}
	}

	@include media-breakpoint-up(lg) {
		.sq-quarrel-message {
			left: 20%;
		}
	}
}
</style>
