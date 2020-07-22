<template>
	<b-container id="game-results" class="game-overlay--new-game winter" fluid>
		<b-row class="title mt-3 text-center">
			<b-col>
				<h2 v-if="winningPlayer">Game Results</h2>
				<h2 v-else>Round {{ roundNumber }} Results</h2>
			</b-col>
		</b-row>
		<b-row class="container_players" align-center>
			<b-col>
				<div
					v-for="player in sortedByScore"
					:key="player.id"
					:class="{
						current: isCurrentPlayer(player),
						winner: showWinner && winningPlayer.id === player.id,
					}"
					class="sq-player"
				>
					<div class="sq-player-avatar">
						<b-img-lazy
							src="@/assets/images/squirrel-placeholder.jpg"
							rounded="circle"
						></b-img-lazy>
						<div class="sq-player-name">{{ player.name }}</div>
						<PlayerStorage :player="player" />
					</div>
					<div v-if="!showWinner" class="sq-player-cards">
						<div class="cards-group hand">
							<Card
								v-for="card in cardsToShow[player.id]"
								:id="card.id"
								:key="card.id"
								:card-data="card"
								card-type="hand"
							/>
						</div>
					</div>
				</div>
			</b-col>
		</b-row>
		<b-row class="text-center">
			<b-col>
				<slot v-if="showWinner" name="gameOver"></slot>
				<slot v-else name="newGame"></slot>
			</b-col>
		</b-row>
	</b-container>
</template>

<script>
import { filter, orderBy } from 'lodash';

import Card from '@/components/Card/Card.vue';
// import Player from '@/components/Player/Player.vue';
import PlayerStorage from '@/components/Player/PlayerStorage.vue';

export default {
	name: 'game-results',
	components: {
		Card,
		// Player,
		PlayerStorage,
	},
	props: {
		myPlayer: {
			type: Object,
			required: true,
		},
		players: {
			type: Array,
			required: true,
		},
		roundNumber: {
			type: Number,
			required: true,
		},
	},
	data: function() {
		return {
			cardsToShow: {},
			showWinner: false,
		};
	},
	computed: {
		sortedByScore() {
			return orderBy(this.players, 'score', 'desc');
		},
		winningPlayer() {
			const winner = filter(this.players, pl => pl.score >= 20);

			if (winner.length) {
				return winner[0];
			}

			return null;
		},
	},
	watch: {
		winningPlayer(val) {
			this.$log.debug(val);

			if (val) {
				setTimeout(() => {
					this.showWinner = true;
				}, 2000);
			}
		},
	},
	mounted() {
		let timeout = 500;

		this.players.forEach(pl => {
			setTimeout(() => {
				this.updateScore(pl);
			}, timeout);

			timeout += 1200;
		});
	},
	methods: {
		isCurrentPlayer(pl) {
			return this.myPlayer.id === pl.id;
		},
		specialCards(pl) {
			return filter(pl.cardsInHand, card => card.cardType === 'special');
		},
		updateScore(pl) {
			const specialCards = this.specialCards(pl);
			let timeout = 500;

			if (specialCards.length) {
				specialCards.forEach(card => {
					setTimeout(() => {
						if (!this.cardsToShow[pl.id]) {
							this.$set(this.cardsToShow, pl.id, [card]);
						} else {
							this.$set(this.cardsToShow, pl.id, [
								...this.cardsToShow[pl.id],
								card,
							]);
						}

						if (!this.isCurrentPlayer(pl)) {
							return;
						}

						this.$store.dispatch('players/update', {
							id: pl.id,
							data: {
								score: pl.score + card.amount,
							},
						});
					}, timeout);

					timeout += 1500;
				});
			}
		},
	},
};
</script>

<style lang="scss" scoped>
// prettier-ignore
@import "~@/assets/scss/variables";

#game-results {
	background: rgba($black, 0.5);
	display: flex;
	flex-direction: column;
	height: 80%;
	margin: 0 auto;
	place-content: center space-between;
	position: absolute;
	width: 80%;
	z-index: 120;

	&.winter {
		background: url(https://media1.tenor.com/images/cfd482be411aab7af3e5e71c7aa324f5/tenor.gif?itemid=3316293)
			no-repeat;
		background-position: center;
		background-size: cover;
		height: 100%;
		opacity: 0.95;
		position: absolute;
		width: 100%;
		z-index: 175;
	}

	.container_players {
		display: flex;
		height: 100%;
		// flex: 0 1 50%;
		// flex-direction: column;
		place-content: center center;
		width: 100%;

		.sq-player {
			justify-content: center;
			margin-top: 1rem;
			min-height: 1px;
			width: 100%;

			.sq-player-avatar {
				border: 0 dashed rgba(red, 0.75);
				position: initial;
				transition: transform 2s ease-in;

				.sq-player-name {
					left: initial;
				}
			}

			&.winner {
				.sq-player-avatar {
					border-width: 2px;
					transform: scale(1.75);
					z-index: 999;
				}
			}

			.sq-player-cards {
				width: auto;

				.cards-group {
					.btn-card:nth-child(n + 2) {
						margin-left: 1rem;
					}
					.btn-card,
					.card {
						cursor: initial;
						position: initial;
					}
				}
			}
		}
	}
}
</style>
