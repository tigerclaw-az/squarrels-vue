<template>
	<a
		class="sq-player-storage"
		href="#"
		title="View or Store Nuts"
		@click.prevent="onClickStorage"
	>
		<b-img src="@/assets/images/acorn.png" width="60" height="60"></b-img>
		<transition name="computing" mode="out-in">
			<span :key="displayScore" class="sq-player-score">
				{{ displayScore }}
			</span>
		</transition>
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
	data: function() {
		return {
			displayScore: 0,
		};
	},
	computed: {
		myScore() {
			return this.player.score;
		},
	},
	watch: {
		myScore: {
			immediate: true,
			handler: function(newVal, oldVal) {
				this.$log.debug(this, newVal, oldVal);

				if (!oldVal) {
					this.displayScore = newVal;

					return;
				}

				// Determine how much the value will change by: -5, 0, 1, 5
				const totalChange =
					newVal >= 0 ? newVal - oldVal : newVal + Math.abs(oldVal);

				if (totalChange === 0) {
					this.displayScore = newVal;

					return;
				}

				// Determine if value should be incremented or decremented
				const change = newVal > oldVal ? 1 : -1;

				const interval = setInterval(() => {
					this.displayScore += change;

					if (!this || this.displayScore === newVal) {
						clearInterval(interval);
					}
				}, 240);
			},
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

.sq-player-storage {
	align-items: flex-end;
	color: inherit;
	display: flex;
	font-size: 1.75rem;
	justify-content: flex-end;
	text-decoration: none;

	.sq-player-score {
		color: inherit;
		font-size: inherit;
		font-weight: $font-weight-bold;
		line-height: 2;
		transform: translateX(-55px);
	}

	@include media-breakpoint-up(md) {
	}
}
</style>
