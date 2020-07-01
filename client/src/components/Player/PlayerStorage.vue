<template>
	<a
		class="sq-player-storage"
		href="#"
		title="View or Store Nuts"
		@click.prevent="onClickStorage"
	>
		<b-img src="@/assets/images/acorn.png" width="60" height="60"></b-img>
		<span class="sq-player-score">
			{{ player.score }}
		</span>
	</a>
</template>

<script>
export default {
	name: 'player-storage',
	components: {},
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
				`player-storage-modal-${this.player.id}`,
			);
		},
	},
};
</script>

<style lang="scss" scoped>
// prettier-ignore
@import "~@/assets/scss/variables";
// prettier-ignore
@import "~@/../node_modules/bootstrap/scss/mixins/breakpoints";

.sq-player-storage {
	align-items: flex-end;
	color: inherit;
	display: flex;
	font-size: 1.75rem;
	justify-content: flex-end;

	.sq-player-score {
		color: inherit;
		font-size: inherit;
		font-weight: $font-weight-bold;
		line-height: 2;
		transform: translateX(-55px);
	}

	@include media-breakpoint-up(md) {}
}
</style>
