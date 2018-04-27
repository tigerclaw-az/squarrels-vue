<template>
	<div class="sq-player"
	:class="{
		active: player.isActive,
		current: player.isCurrent
	}">
	</div>
</template>

<script>
export default {
	name: 'Player',
	props: ['player'],
	data: function() {
		return {}
	},
}
</script>

<style lang="scss">
	@import '~@/components/Card/card';

	.sq-player {
		// @include clearfix;

		align-items: center;
		display: flex;
		margin-bottom: 5rem;
		position: relative;
		text-align: center;

		&.current {
			flex: 1;
			width: 100%;

			card {
				top: 0;

				&.selected {
					transform: translateY(-15%);

					.card {
						border: 2px solid get-color('zest');
						border-radius: .75rem;
						transform: scale(1.5);
					}
				}
			}
		}

		&.active {
			.sq-player-info {
				color: get-color('zest');
				font-weight: $font-weight-bold;
			}
		}

		.sq-player-thumbnail {
			margin-right: 1rem;
			position: relative;

			img {
				width: 7.5rem;
			}

			.sq-player-card-count {
				@include center-horizontal;
				color: get-color('alabaster');
				font-size: 5rem;
				line-height: 1;
				top: -30%;
			}
		}

		.sq-player-info {
			// @include clearfix;

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
					@include center-horizontal;
					color: get-color('carnaby-tan');
					font-size: 2rem;
					line-height: 2.25;
					top: 0;
				}
			}
		}

		.sq-player-quarrel {
			@extend %playing-cards;

			animation: .5s linear grow;
			left: 0;
			position: absolute;
			top: 0;

			.card {
				box-shadow: none;
				left: 0;

				&::after {
					box-shadow: 0 0 20px 20px get-color('saffron');
					content: '';
					height: 100%;
					left: 0;
					opacity: 0;
					position: absolute;
					transition: opacity .5s linear;
					width: 100%;
				}
			}

			&.flip {
				@include flip-card($type: 'quarrel');
			}

			&.winner {
				.card {
					&::after {
						opacity: 1;
					}
				}
			}

			&.ng-leave,
			&.ng-leave-active {
				card {
					animation: .75s ease-out disappear;
				}
			}
		}

		.sq-player-cards {
			width: 50%;

			.cards-group {
				@extend %playing-cards;

				[role='button'] {
					position: absolute;
				}

				card {
					float: left;
					position: relative !important;
					width: rem-calc($card-width-stack);

					&.mine {
						animation: .5s linear grow;
					}

					&.ng-leave,
					&.ng-leave-active {
						.card {
							animation: .75s ease-out fade-out;
						}
					}
				}
			}

			.empty {
				@extend %playing-cards;

				border: 2px dotted;
				height: rem-calc(map-get($card-height, 'small'));
				padding: 3.5rem;

				&::after {
					content: 'NO CARDS';
				}
			}
		}

		@media (min-width: $screen-md-min) {
			&.current {
				card {
					&.selected {
						.card {
							transform: scale(1);
						}
					}
				}
			}

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

			.sq-player-cards {
				width: 70%;

				.empty {
					font-size: 4rem;
					height: rem-calc(map-get($card-height, 'medium'));
					padding: 5rem;
				}
			}
		}
	}
</style>
