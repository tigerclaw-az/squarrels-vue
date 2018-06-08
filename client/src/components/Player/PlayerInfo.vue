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
@import '~@/assets/scss/variables';

.sq-player-info {
	align-items: center;
	display: flex;
	flex-wrap: wrap;
	justify-content: center;
	margin-right: 1rem;
	max-width: 10rem;

	.sq-player-info-item {
		color: inherit;
		font-size: 2.5rem;
		position: relative;
	}

	.sq-player-name {
		flex: 1 0 100%;
	}

	.sq-player-storage {
		font-size: 4rem;

		.sq-player-score {
			@extend %center-horizontal;
			color: get-color('carnaby-tan');
			font-size: 2rem;
			line-height: 2.25;
			top: 0;
		}
	}
}

@media (min-width: $screen-md-min) {
	.sq-player-thumbnail {
		img {
			width: 10rem;
		}
	}

	.sq-player-info {
		max-width: 11rem;

		.sq-player-info-item {
			font-size: 3.5rem;
		}

		.sq-player-storage {
			font-size: 5.5rem;

			.sq-player-score {
				font-size: 2.75rem;
				font-weight: $font-weight-bold;
			}
		}
	}
}
</style>
