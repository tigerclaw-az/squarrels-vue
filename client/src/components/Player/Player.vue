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
		<div class="sq-player-info">
			<div class="sq-player-name">{{player.name}}</div>
			<a
				href="#"
				class="sq-player-info-item sq-player-storage"
				title="View or Store Nuts"
				@click="onClickStorage($event)"
			>
				<icon name="tree" scale="6" class="icon icon-storage"></icon>
				<span class="sq-player-score">{{player.score}}</span>
			</a>
			<a
				v-if="isCurrentPlayer"
				href="#"
				class="sq-player-info-item sq-player-storage-auto"
				title="Auto Storage of Nuts"
				@click="onClickStorageAuto($event)"
				:class="{ disabled: !player.isActive }"
			>
				<icon name="download" scale="2" class="icon icon-storage-auto"></icon>
			</a>
			<div
				v-if="player.quarrel"
				class="sq-player-quarrel animated"
				:class="{
					flip: player.showQuarrel,
					winner: player.isQuarrelWinner
				}">
				<span class="card blank--"></span>
				<card
					v-if="player.showQuarrel"
					:card-id="player.quarrel.id"
					:card-type="quarrel"
				></card>
			</div>
		</div>
		<div v-if="isCurrentPlayer" class="sq-player-cards">
			<div v-if="myCards.length" class="cards-group hand">
				<div v-if="player.message" class="message">{{player.message}}</div>
				<card
					v-for="cardId in myCardsSorted"
					:key="cardId"
					:class="{ mine: myCards.length }"
					:card-id="cardId"
					:card-type="hand"
				></card>
			</div>
			<div v-else-if="isGameStarted" class="empty"></div>
		</div>
	</div>
</template>

<script>
import { mapState } from 'vuex';

import _ from 'lodash';
import Icon from 'vue-awesome/components/Icon';

export default {
	name: 'Player',
	props: {
		player: {
			type: Object,
			required: true,
		}
	},
	components: {
		Icon
	},
	data: function() {
		return {
		}
	},
	mounted: function() {

	},
	computed: {
		isCurrentPlayer: function(id) {
			return this.currentPlayer.id === this.player.id;
		},
		...mapState({
			currentPlayer: state => state.localPlayer,
			isGameStarted: state => state.game.isStarted,
		})
	},
	methods: {
		myCards: function() {
			return this.currentPlayer.cardsInHand;
		},
		myCardsSorted: function() {
			return _.sortBy(this.myCards(), ['amount']);
		},
		onClickStorage: function(e) {
			this.$log.debug(e);
		},
		onClickStorageAuto: function(e) {
			this.$log.debug(e);
		},
	}
}
</script>

<style lang="scss" scoped src="./player.scss"></style>
