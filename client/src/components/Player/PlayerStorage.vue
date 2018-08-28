<template>
	<!-- <div class="sq-player-storage"> -->
		<a
			class="sq-player-storage"
			href="#"
			title="View or Store Nuts"
			@click.prevent="onClickStorage"
		>
			<icon name="tree" scale="4" class="icon icon-storage"></icon>
			<span class="sq-player-score">{{player.score}}</span>
		</a>
	<!-- </div> -->
</template>

<script>
import Icon from 'vue-awesome/components/Icon';

export default {
	name: 'PlayerStorage',
	props: {
		player: {
			type: Object,
			required: true,
		},
	},
	methods: {
		onClickStorage: function() {
			this.$root.$emit(
				'bv::show::modal',
				`player-storage-modal-${this.player.id}`
			);
		},
	},
	components: {
		Icon,
	},
};
</script>

<style lang="scss" scoped>
// prettier-ignore
@import "~@/assets/scss/variables";
// prettier-ignore
@import "~@/../node_modules/bootstrap/scss/mixins/breakpoints";

.sq-player-storage {
	bottom: 0;
	color: inherit;
	font-size: 2rem;
	position: absolute;
	right: 50%;
	z-index: 80;

	.sq-player-score {
		@extend %center-horizontal;
		// prettier-ignore
		color: color("carnaby-tan");
		font-size: 1.25rem;
		font-weight: $font-weight-bold;
		line-height: 2.25;
		top: 0;
	}

	@include media-breakpoint-up(md) {
		.sq-player-score {
			font-size: 1.75rem;
		}
	}
}
</style>
