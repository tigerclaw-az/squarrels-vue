<template>
	<div id="action-card">
		<span
			class="action-card"
			:class="{ instant: isInstant }"
		>
			<span class="card blank--"></span>
			<Card
				:id="card.id"
				:cardData="card"
				cardType="action"
			>
			</Card>
		</span>
	</div>
</template>

<script>
import { mapState } from 'vuex';

import Card from '@/components/Card/Card.vue';

export default {
	name: 'ActionCard',
	components: {
		Card,
	},
	computed: {
		...mapState('game', {
			card: 'actionCard',
			instantAction: 'instantAction',
		}),
		isInstant: function() {
			return this.instantAction || this.card.name === 'winter';
		},
	},
};
</script>

<style lang="scss">
@import '~@/components/Card/card';

.action-card {
	@extend %playing-cards;

	@include flip-card {
		animation-name: action-fadeout;

		&.action--whirlwind {
			animation-name: action-whirlwind;
		}
	}

	left: 40%;
	position: absolute !important;
	top: -20%;
	transform: scale(2);
	z-index: 100;
}
</style>
