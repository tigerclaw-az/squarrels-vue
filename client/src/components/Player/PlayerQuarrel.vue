<template>
	<div
		v-if="quarrelCard(player.id)"
		ref="card"
		:class="{
			flip: showQuarrel,
			winner: isQuarrelWinner,
		}"
		class="sq-player-quarrel"
	>
		<span class="btn-card card blank-- disabled" disabled></span>
		<Card :card-data="quarrelCard(player.id)" card-type="hand" />
	</div>
</template>

<script>
import { mapState } from 'vuex';

import Card from '@/components/Card/Card.vue';

export default {
	name: 'player-quarrel',
	components: {
		Card,
	},
	props: {
		actionCard: {
			type: Object,
		},
		player: {
			type: Object,
			required: true,
		},
	},
	computed: {
		...mapState({
			showQuarrel: state => state.game.showQuarrel,
		}),
		isQuarrelWinner() {
			return this.$store.state.players[this.player.id].isQuarrelWinner;
		},
	},
	watch: {
		isQuarrelWinner: {
			immediate: true,
			handler: function(val) {
				this.$log.debug('isQuarrelWinner -> ', val);

				if (val && this.player.isActive) {
					setTimeout(() => {
						this.$store.dispatch({ type: 'game/quarrelEnded' });
					}, 1000);
				}
			},
		},
		showQuarrel(val) {
			if (val && this.$refs.card) {
				this.$refs.card.addEventListener('animationend', () => {
					this.$store.dispatch({ type: 'game/quarrelWinner' });
				});
			}
		},
	},
	methods: {
		quarrelCard: function(id) {
			return this.$store.getters['game/getQuarrelCardByPlayer'](id);
		},
	},
};
</script>

<style lang="scss">
// prettier-ignore
@import "~@/assets/scss/variables";
// prettier-ignore
@import "~@/components/Card/card";

.sq-player-quarrel {
	@extend %playing-cards;
	animation: 0.5s linear grow;

	position: absolute;
	right: 0;
	top: 0;
	transform: scale(1.5);
	z-index: 70;

	.btn-card,
	.card {
		position: inherit;
	}

	.blank-- {
		z-index: 1;
	}

	.btn-card {
		.card {
			box-shadow: none;
			left: 0;
			transform: rotateY(90deg);

			&::after {
				content: '';
				height: 100%;
				left: 0;
				// opacity: 0;
				position: inherit;
				// transition: opacity 0.5s linear;
				width: 100%;
			}
		}
	}

	&.flip {
		@include flip-card(1s, 0.75s);
	}

	&.winner {
		.btn-card,
		.card {
			&::after {
				box-shadow: 0 0 20px 20px color('saffron');
				opacity: 1;
			}
		}
	}
}
</style>
