<template>
	<div id="action-card" v-if="card">
		<span
			v-class="{ instant: instant || card.name === 'winter' }"
			class="action-card">
			<span class="card blank--"></span>
			<!-- <Card card-id="{{card.id}}" card-type="action"></Card> -->
		</span>
	</div>
</template>

<script>
import { mapState } from 'vuex';

export default {
	name: 'ActionCard',
	computed: {
		...mapState('game', {
			card: 'actionCard',
			instant: 'instantAction',
		}),
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
	}
</style>
