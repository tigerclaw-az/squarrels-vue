<template>
	<transition-group tag="div" class="cards-group hand" name="cards">
		<Card
			v-for="(card, index) in cards"
			:id="card.id"
			:key="card.id"
			:on-click="onClickCard"
			:card-data="card"
			:card-style="cardStyle(index)"
			:is-active-player="isMyTurn"
			:matches="card.cardType === 'special' ? [] : findCardMatches(card.amount)"
			:my-player="player"
			card-type="hand"
		/>
	</transition-group>
</template>

<script>
import { filter, groupBy, sampleSize } from 'lodash';

import Card from '@/components/Card/Card.vue';

export default {
	components: {
		Card,
	},
	props: {
		actionCard: {
			type: Object,
			default: () => ({}),
		},
		isMyTurn: {
			type: Boolean,
			required: true,
		},
		player: {
			type: Object,
			required: true,
		},
	},
	computed: {
		cards() {
			return this.player.cardsInHand;
		},
	},
	methods: {
		cardStyle(index) {
			const cardsCount = this.cards.length;

			const styles = {
				'z-index': index + 1,
			};

			const spacing = 240 / cardsCount;
			const spacingMultiplier = index;

			styles.left = spacing * spacingMultiplier + 'px';

			return styles;
		},
		async discard(card) {
			this.$log.debug(card);

			try {
				await this.$store.dispatch('players/discard', {
					card,
				});
				await this.$store.dispatch('decks/discard', card);
				this.$store.dispatch('sound/play', this.$sounds.discard);
			} catch (err) {
				this.$log.error(err);
				this.$toasted.error(`ERROR: Unable to discard card: ${card.name}`);
			}

			try {
				await this.$store.dispatch('players/nextPlayer');
			} catch (err) {
				// TODO: Handle reverting "discard" for current player
				this.$log.error(err);
				this.$toasted.error('ERROR: Unable to notify next player');
			}
		},
		findCardMatches(amount) {
			const groups = groupBy(this.cards, c => c.amount);

			if (groups[5] && groups[5].length) {
				groups[5] = filter(groups[5], c => c.cardType !== 'special');
			}

			if (groups[amount].length >= 3) {
				return groups[amount];
			}

			return [];
		},
		onClickCard(card, cardsToStore, evt) {
			this.$log.debug(card, cardsToStore, evt);

			if (this.player.selectQuarrelCard) {
				this.$store
					.dispatch('players/selectQuarrelCard', {
						id: this.player.id,
						card,
					})
					.then(() => {
						this.$store
							.dispatch('players/discard', {
								card,
								isQuarrel: true,
							})
							.catch(err => {
								this.$log.error(err);
								this.$toasted.error(err.toString());
							});
					})
					.catch(err => {
						this.$log.error(err);
						this.$toasted.error(err.toString());
					});
			}

			// User can't click card if action card has been drawn
			if (this.actionCard || !this.player.hasDrawnCard) {
				return false;
			}

			if (this.isMyTurn) {
				if (card.cardType === 'special' && this.player.totalCards > 1) {
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
		storeCards(cardsToStore) {
			this.$log.debug(cardsToStore);

			this.$store
				.dispatch('players/storeCards', {
					id: this.player.id,
					cards: cardsToStore,
					cardsInHand: this.cards,
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

<style></style>
