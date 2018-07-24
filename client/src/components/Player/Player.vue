<template>
	<div class="sq-player"
	:class="{
		active: isActivePlayer,
		current: isCurrentPlayer,
		'my-turn': isMyTurn,
	}">
		<div class="sq-player-thumbnail">
			<img class="img-circle" src="@/assets/images/squirrel-placeholder.jpg"/>
			<span class="sq-player-card-count">{{player.totalCards}}</span>
		</div>
		<PlayerInfo :player="player"></PlayerInfo>
		<div
			v-if="quarrelCard(player.id)"
			class="sq-player-quarrel"
			:class="{
				flip: showQuarrel,
				winner: isQuarrelWinner
			}">
			<span class="card blank--"></span>
			<Card
				v-if="showQuarrel"
				:card-data="quarrelCard(player.id)"
				card-type="quarrel"
			></Card>
		</div>
		<div v-if="isCurrentPlayer" class="sq-player-cards">
			<div v-if="hasCards" class="cards-group hand">
				<div v-if="player.message" class="message">{{player.message}}</div>
				<transition-group name="cards">
					<Card
						v-for="(card, index) in myCardsSorted"
						:key="card.id"
						:id="card.id"
						:class="{ mine: hasCards }"
						:onClick="onClickCard"
						:card-data="card"
						card-type="hand"
						:matches="findCardMatches(card.amount)"
						:position="{ left: (index * 32) + 'px' }"
						:z-index="index"
					></Card>
				</transition-group>
			</div>
			<div v-else-if="isGameStarted" class="empty"></div>
		</div>
	</div>
</template>

<script>
import { mapGetters, mapState } from 'vuex';

import _ from 'lodash';
import Icon from 'vue-awesome/components/Icon';

import api from '@/api/index';
import Card from '@/components/Card/Card.vue';
import PlayerInfo from '@/components/Player/PlayerInfo.vue';

export default {
	name: 'Player',
	components: {
		Card,
		Icon,
		PlayerInfo,
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
			showQuarrel: state => state.game.showQuarrel,
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
		isQuarrelWinner: function() {
			return this.$store.state.players[this.player.id].isQuarrelWinner;
		},
		isMyTurn: function() {
			return this.isActivePlayer && this.myPlayer.id === this.player.id;
		},
		myCards: function() {
			return this.myPlayer.cardsInHand;
		},
		myCardsSorted: function() {
			return _.sortBy(this.myCardsDetails, ['amount']);
		},
	},
	watch: {
		isMyTurn: function(to, from) {
			if (to && to !== from) {
				this.$toasted.success('YOUR TURN');
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
	mounted: function() {
		if (this.myCards && this.myCards.length) {
			this.getCardDetails();
		}
	},
	methods: {
		discard: function(card) {
			this.$log.debug(card);

			this.$store.dispatch('sound/play', 'discard');

			let deckUpdate = this.$store.dispatch('decks/discard', card);
			let playerUpdate = this.$store.dispatch('players/discard', {
				id: this.myPlayer.id,
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
			let groups = _.groupBy(this.myCardsDetails, c => c.amount);

			if (groups[amount].length >= 3) {
				return groups[amount];
			}

			return [];
		},
		getCardDetails: function() {
			this.$log.debug('getting cards ->', this.myCards);

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
				this.$store
					.dispatch('players/discard', {
						id: this.myPlayer.id,
						card,
					})
					.then(() => {
						this.$store.dispatch('players/selectQuarrelCard', {
							id: this.myPlayer.id,
							card,
						});
					})
					.catch(err => {
						this.$log.error(err);
						this.$toasted.error(err.toString());
					});
			}

			this.$log.debug(this);

			// User can't click card if action card has been drawn
			if (this.actionCard || !this.myPlayer.hasDrawnCard) {
				return false;
			}

			if (this.myPlayer.isActive) {
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
		quarrelCard: function(id) {
			return this.$store.getters['game/getQuarrelCardByPlayer'](id);
		},
		storeCards: function(cardsToStore) {
			this.$log.debug(cardsToStore);

			const cardsInStorage = this.myPlayer.cardsInStorage;
			const cardsInHand = this.myCards;
			const cardsToStoreIds = _.map(cardsToStore, c => c.id);

			let plData = {
				cardsInHand: _.difference(cardsInHand, cardsToStoreIds),
				cardsInStorage: _.concat(cardsInStorage, cardsToStoreIds[0]),
				score: this.myPlayer.score + cardsToStore[0].amount,
			};

			this.$log.debug('plData -> ', plData);

			this.$store
				.dispatch('players/update', {
					id: this.myPlayer.id,
					data: plData,
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

<style lang="scss" src="./player.scss">
</style>
