<template>
	<div id="game-results">
		<slot name="newGame"></slot>
	</div>
</template>

<script>
export default {
	name: 'GameResults',
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
}
</style>
