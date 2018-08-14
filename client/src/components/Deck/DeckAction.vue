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
				v-for="(card, index) in cards"
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
	name: 'DeckAction',
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
	$rotate: 0;

	animation: 0.5s linear shrink;

	@for $i from 1 through 20 {
		$rotate: $rotate + 2.5;

		&:nth-child(#{$i}) {
			transform: rotate(#{$rotate}deg);
		}
	}
}
</style>
