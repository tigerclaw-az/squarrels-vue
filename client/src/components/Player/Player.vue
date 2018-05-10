<template>
	<div class="sq-player"
	:class="{
		active: player.isActive,
		current: isCurrentPlayer
	}">
		<div class="sq-player-thumbnail">
			<!-- <img class="img-circle" :src="player.img"/> -->
			<img class="img-circle" src="@/assets/images/squirrel-placeholder.jpg"/>
			<span class="sq-player-card-count">{{player.totalCards}}</span>
		</div>
		<PlayerInfo :player="player"></PlayerInfo>
		<div v-if="isCurrentPlayer" class="sq-player-cards">
			<div v-if="hasCards" class="cards-group hand">
				<div v-if="player.message" class="message">{{player.message}}</div>
				<transition-group>
				<Card
					v-for="(card, index) in myCardsSorted"
					:key="card.id"
					:id="card.id"
					:class="{ mine: hasCards }"
					:onClick="onClickCard"
					:cardData="card"
					:cardType="'hand'"
					:matches="findCardMatches(card.amount)"
					:position="{ left: (index * 32) + 'px' }"
					:zIndex="index"
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
			isActionCard: 'game/isActionCard',
		}),
		...mapState({
			isGameStarted: state => state.game.isStarted,
		}),
		isCurrentPlayer: function() {
			this.$log.debug('isCurrentPlayer', this.myPlayer, this.player);
			return this.myPlayer.id === this.player.id;
		},
		hasCards: function() {
			let cards = this.myCards;
			return cards && cards.length;
		},
		myCards: function() {
			return this.myPlayer.cardsInHand;
		},
		myCardsSorted: function() {
			this.$log.debug('myPlayer', this.myPlayer);
			return _.sortBy(this.myCardsDetails, ['amount']);
			// return this.myPlayer.cardsInHand;
		},
	},
	watch: {
		myCards: function(newCards, oldCards) {
			this.$log.debug('myCards->changed', newCards, oldCards);

			if (!this.myCards.length) {
				return;
			}

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
	},
	mounted: function() {},
	methods: {
		discard: function(card) {
			this.$log.debug(card);
			// Don't allow 'special' cards to be discarded unless it's the only card
			let deckUpdate = this.$store.dispatch('decks/discard', card);
			let playerUpdate = this.$store.dispatch('players/discard', {
				id: this.myPlayer.id,
				card,
			});

			Promise.all([deckUpdate, playerUpdate])
				.then(res => {
					this.$store.dispatch('sound/play', 'discard');
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
		onClickCard: function(card, cardsToStore, evt) {
			this.$log.debug(card, cardsToStore, evt);

			if (this.isActionCard()) {
				return;
			}

			if (cardsToStore.length !== 3) {
				this.discard(card);
			} else {
				this.storeCards(cardsToStore);
			}
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

			if (this.myPlayer.isActive && this.myPlayer.hasDrawnCard) {
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
			}
		},
	},
};
</script>

<style lang="scss" scoped src="./player.scss"></style>
