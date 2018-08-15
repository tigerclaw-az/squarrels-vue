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
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style lang="scss" scoped>
.card {
	@for $i from 1 through 30 {
		$rotate: random(30) - 15;
		$left: random(30) - 15;
		$top: random(20) - 10;

		&:nth-child(#{$i}) {
			transform: translate(#{$left}px, #{$top}px) rotate(#{$rotate}deg);
		}
	}
}
</style>
