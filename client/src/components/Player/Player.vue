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
			<div ng-else class="empty"></div>
		</div>
	</div>
</template>

<script>
import { mapState } from 'vuex';

import _ from 'lodash';
import Icon from 'vue-awesome/components/Icon';

export default {
	name: 'Player',
	props: ['player'],
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

<style lang="scss" scoped>
	@import '~@/components/Card/card';

	.sq-player {
		align-items: center;
		display: flex;
		margin-bottom: 5rem;
		position: relative;
		text-align: center;

		&.current {
			flex: 1 0 100%;

			card {
				top: 0;

				&.selected {
					transform: translateY(-15%);

					.card {
						border: 2px solid get-color('zest');
						border-radius: .75rem;
						transform: scale(1.5);
					}
				}
			}
		}

		&.active {
			.sq-player-info {
				color: get-color('zest');
				font-weight: $font-weight-bold;
			}
		}

		.sq-player-thumbnail {
			margin-right: 1rem;
			position: relative;

			img {
				width: 7.5rem;
			}

			.sq-player-card-count {
				@include center-horizontal;
				color: get-color('alabaster');
				font-size: 5rem;
				line-height: 1;
				top: -30%;
			}
		}

		.sq-player-info {
			@include clearfix;

			align-items: center;
			display: flex;
			flex-wrap: wrap;
			justify-content: center;
			margin-right: 1rem;
			max-width: 10rem;

			.sq-player-info-item {
				color: inherit;
				font-size: 2.5rem;
				position: relative;
			}

			.sq-player-name {
				flex: 1 0 100%;
			}

			.sq-player-storage {
				font-size: 4rem;

				.sq-player-score {
					@include center-horizontal;
					color: get-color('carnaby-tan');
					font-size: 2rem;
					line-height: 2.25;
					top: 0;
				}
			}
		}

		.sq-player-quarrel {
			@extend %playing-cards;

			animation: .5s linear grow;
			left: 0;
			position: absolute;
			top: 0;

			.card {
				box-shadow: none;
				left: 0;

				&::after {
					box-shadow: 0 0 20px 20px get-color('saffron');
					content: '';
					height: 100%;
					left: 0;
					opacity: 0;
					position: absolute;
					transition: opacity .5s linear;
					width: 100%;
				}
			}

			&.flip {
				@include flip-card($type: 'quarrel');
			}

			&.winner {
				.card {
					&::after {
						opacity: 1;
					}
				}
			}

			&.ng-leave,
			&.ng-leave-active {
				card {
					animation: .75s ease-out disappear;
				}
			}
		}

		.sq-player-cards {
			width: 50%;

			.cards-group {
				@extend %playing-cards;

				[role='button'] {
					position: absolute;
				}

				card {
					float: left;
					position: relative !important;
					width: rem-calc($card-width-stack);

					&.mine {
						animation: .5s linear grow;
					}

					&.ng-leave,
					&.ng-leave-active {
						.card {
							animation: .75s ease-out fade-out;
						}
					}
				}
			}

			.empty {
				@extend %playing-cards;

				border: 2px dotted;
				height: rem-calc(map-get($card-height, 'small'));
				padding: 3.5rem;

				&::after {
					content: 'NO CARDS';
				}
			}
		}

		@media (min-width: $screen-md-min) {
			&.current {
				card {
					&.selected {
						.card {
							transform: scale(1);
						}
					}
				}
			}

			.sq-player-thumbnail {
				img {
					width: 10rem;
				}
			}

			.sq-player-info {
				max-width: 11rem;

				.sq-player-info-item {
					font-size: 3.5rem;
				}

				.sq-player-storage {
					font-size: 5.5rem;

					.sq-player-score {
						font-size: 2.75rem;
						font-weight: $font-weight-bold;
					}
				}
			}

			.sq-player-cards {
				width: 70%;

				.empty {
					font-size: 4rem;
					height: rem-calc(map-get($card-height, 'medium'));
					padding: 5rem;
				}
			}
		}
	}
</style>
