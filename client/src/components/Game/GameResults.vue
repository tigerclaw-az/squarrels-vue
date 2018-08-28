<template>
	<div id="game-results">
		<p>TEST</p>
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
#game-results {
	position: absolute;
	z-index: 120;
}
</style>
