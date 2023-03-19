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
		<span class="btn-card card blank--"></span>
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
		myPlayer: {
			type: Object,
			required: true,
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
			return this.player.isQuarrelWinner;
		},
	},
	watch: {
		isQuarrelWinner: {
			immediate: true,
			handler: function(val) {
				this.$log.debug('isQuarrelWinner -> ', val, this.player);

				if (val && this.myPlayer.isActive) {
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
	mounted() {

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

	.blank-- {
		z-index: 100;
	}

	.card {
		// transition: opacity, transform 1.5s ease-in-out;
		// transform: scale(1.25);
	}

	.card:not(.blank--) {
		left: 0;
		// transform: rotateY(180deg);

		&::after {
			box-shadow: none;
			content: '';
			height: 100%;
			left: 0;
			position: inherit;
			width: 100%;
		}
	}

	&.flip {
		@include flip-card($flip-speed: 0.5s, $flip-delay: 0.5s);
	}

	&.winner {
		.card:not(.blank--) {
			&::after {
				box-shadow: 0 0 20px 20px color('saffron');
				opacity: 1;
			}
		}
	}
}
</style>
