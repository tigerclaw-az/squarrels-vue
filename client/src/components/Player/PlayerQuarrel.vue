<template>
	<div
		v-if="actionCard && quarrelCard(player.id)"
		class="sq-player-quarrel"
		:class="{
			flip: showQuarrel,
			winner: isQuarrelWinner
		}">
		<div class="btn-card card blank-- disabled" role="button" disabled></div>
		<Card
			v-if="showQuarrel"
			:card-data="quarrelCard(player.id)"
			card-type="quarrel"
		></Card>
	</div>
</template>

<script>
import { mapState } from 'vuex';

import Card from '@/components/Card/Card.vue';

export default {
	name: 'PlayerQuarrel',
	props: {
		player: {
			type: Object,
			required: true,
		},
	},
	components: {
		Card,
	},
	computed: {
		...mapState({
			actionCard: state => state.game.actionCard,
			showQuarrel: state => state.game.showQuarrel,
		}),
		isQuarrelWinner: function() {
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
	left: 0;
	position: absolute;
	top: 0;
	transform: scale(1.25);
	z-index: 70;

	.card:not(.blank--) {
		box-shadow: none;
		left: 0;
		transform: rotateY(120deg);

		&::after {
			// prettier-ignore
			box-shadow: 0 0 20px 20px color("saffron");
			// prettier-ignore
			content: "";
			height: 100%;
			left: 0;
			opacity: 0;
			position: absolute;
			transition: opacity 0.5s linear;
			width: 100%;
		}
	}

	&.flip {
		@include flip-card;
	}

	&.winner {
		.card {
			&::after {
				opacity: 1;
			}
		}
	}
}
</style>
