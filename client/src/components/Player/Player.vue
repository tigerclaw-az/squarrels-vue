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
					v-for="(cardId, index) in myCardsSorted"
					:key="cardId"
					:id="cardId"
					:cardType="'hand'"
					:class="{ mine: hasCards }"
					:position="{ left: (index * 32) + 'px' }"
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

import Card from '@/components/Card/Card.vue';
import PlayerInfo from '@/components/Player/PlayerInfo.vue';

export default {
	name: 'Player',
	props: {
		player: {
			type: Object,
			required: true,
		},
	},
	data: function() {
		return {};
	},
	mounted: function() {},
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
			let cards = this.myPlayer.cardsInHand;
			return cards && cards.length;
		},
		myCardsSorted: function() {
			this.$log.debug('myPlayer', this.myPlayer);
			// return _.sortBy(this.myPlayer.cardsInHand, ['amount']);
			return this.myPlayer.cardsInHand;
		},
	},
	methods: {},
	components: {
		Card,
		Icon,
		PlayerInfo,
	},
};
</script>

<style lang="scss" scoped src="./player.scss"></style>
