<template>
	<div
		class="deck"
		:class="{
			'empty': !numCards,
		}"
	>
		<div
			class="cards-group disabled"
			role="button"
			v-show="numCards"
		>
			<span
				v-for="(card, index) in numCards"
				:key="index"
				:class="`action--${card.name}`"
				class="card"
			>
			</span>
		</div>
	</div>
</template>

<script>
export default {
	name: 'DeckMain',
	props: {
		cards: {
			type: Array,
			required: true,
		},
		numCards: {
			type: Number,
			required: true,
		},
	},
	mounted: function() {
		// this.$store.dispatch('decks/load', this.id);
	},
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style lang="scss" scoped>
.card {
	animation: 0.5s linear shrink;
}
</style>
