<template>
	<b-modal :id="modalId" centered hide-footer lazy size="lg" title="Cards Stored for Winter">
		<div
			v-for="card in player.cardsInStorage"
			:key="card"
			class="cards-group"
		>
			<Card
				v-for="index in numCardsToDisplay"
				:key="index"
				:id="card"
				card-type="storage"
			></Card>
		</div>
	</b-modal>
</template>

<script>
import _ from 'lodash';
import bModal from 'bootstrap-vue/es/components/modal/modal';

import Card from '@/components/Card/Card.vue';

export default {
	name: 'player-storage-modal',
	props: {
		player: {
			type: Object,
			required: true,
		},
	},
	computed: {
		modalId() {
			return `player-storage-modal-${this.player.id}`;
		},
		numCardsToDisplay() {
			return _.range(0, 3);
		},
	},
	components: {
		'b-modal': bModal,
		Card,
	},
};
</script>

<style lang="scss">
// prettier-ignore
@import "~@/assets/scss/variables";
// prettier-ignore
@import "~@/components/Card/card";

.modal-body {
	margin: 0 auto !important;

	.cards-group {
		@extend %playing-cards;

		display: inline-flex;
		// prettier-ignore
		height: rem-calc(map-get($card-height, "medium")) * 1.25;
		margin: 0 2rem;
		// prettier-ignore
		width: rem-calc(map-get($card-width, "medium")) * 1.25;

		.btn-card {
			$rotate: -20;
			$translate: -2;

			@for $i from 1 through 3 {
				$rotate: $rotate + 10;
				$translate: $translate + 2;

				&:nth-child(#{$i}) {
					transform: rotate(#{$rotate}deg)
						translateX(#{$translate}rem);
				}
			}
		}
	}
}
</style>
