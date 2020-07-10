<template>
	<div id="game-results" class="game-overlay--new-game winter">
		<slot name="newGame"></slot>
	</div>
</template>

<script>
export default {
	name: 'game-results',
	props: {
		gameId: {
			type: String,
			required: true,
		},
		playerIds: {
			type: Array,
			required: true,
		},
	},
};
</script>

<style lang="scss" scoped>
// prettier-ignore
@import "~@/assets/scss/variables";

#game-results {
	align-items: center;
	background: rgba($black, 0.5);
	display: flex;
	height: 80%;
	justify-content: center;
	margin: 0 auto;
	position: absolute;
	width: 80%;
	z-index: 120;

	&.winter {
		background: url(https://media1.tenor.com/images/cfd482be411aab7af3e5e71c7aa324f5/tenor.gif?itemid=3316293)
			no-repeat;
		background-position: center;
		background-size: cover;
		height: 100%;
		opacity: 0.75;
		position: absolute;
		width: 100%;
		z-index: 100;
	}
}
</style>
