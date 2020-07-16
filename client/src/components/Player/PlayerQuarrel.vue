<template>
	<div
		ref="card"
		:class="{
			flip: showQuarrel,
			winner: isQuarrelWinner,
		}"
		class="sq-player-quarrel"
	>
		<div v-if="quarrelCard(player.id)" class="cards-group">
			<div class="btn-card card blank-- disabled" disabled></div>
			<Card :card-data="quarrelCard(player.id)" card-type="hand" />
		</div>
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

	.card:not(.blank--) {
		box-shadow: none;
		left: 0;
		transform: rotateY(90deg);

		&::after {
			content: '';
			height: 100%;
			left: 0;
			opacity: 0;
			position: inherit;
			transition: opacity 0.5s linear;
			width: 100%;
		}
	}

	&.flip {
		@include flip-card(1.25s, 0.75s);
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
