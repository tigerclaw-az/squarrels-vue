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
		myCards: function() {
			this.$log.debug('myCards->changed');
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
		findCardMatches: function(amount) {
			let groups = _.groupBy(this.myCardsDetails, c => c.amount);

			if (groups[amount].length >= 3) {
				return groups[amount];
			}

			return [];
		},
	},
};
</script>

<style lang="scss" scoped src="./player.scss"></style>
