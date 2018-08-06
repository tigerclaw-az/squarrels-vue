<template>
	<div class="sq-player-info">
		<div class="sq-player-name">{{player.name}}</div>
		<a
			href="#"
			class="sq-player-info-item sq-player-storage"
			title="View or Store Nuts"
			@click.prevent="onClickStorage"
		>
			<icon name="tree" scale="6" class="icon icon-storage"></icon>
			<span class="sq-player-score">{{player.score}}</span>
		</a>
	</div>
</template>

<script>
import Icon from 'vue-awesome/components/Icon';

export default {
	name: 'PlayerInfo',
	props: {
		player: {
			type: Object,
			required: true,
		},
	},
	methods: {
		onClickStorage: function(evt) {
			this.$log.debug(evt);
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

.sq-player-info {
	align-items: center;
	display: flex;
	flex-wrap: wrap;
	justify-content: center;
	margin-right: 1rem;
	max-width: 8rem;

	.sq-player-info-item {
		color: inherit;
		font-size: inherit;
		position: relative;
	}

	.sq-player-name {
		flex: 1 0 100%;
	}

	.sq-player-storage {
		font-size: 3.5rem;

		.sq-player-score {
			@extend %center-horizontal;
			// prettier-ignore
			color: get-color("carnaby-tan");
			font-size: 2rem;
			line-height: 2.25;
			top: 0;
		}
	}

	@include media-breakpoint-up(md) {
		max-width: 9rem;

		.sq-player-storage {
			.sq-player-score {
				font-size: 2.75rem;
				font-weight: $font-weight-bold;
			}
		}
	}
}
</style>
