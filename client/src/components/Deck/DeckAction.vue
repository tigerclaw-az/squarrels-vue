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
			<transition-group tag="div" class="transition" name="cards-action">
				<div
					v-for="(card, index) in cards"
					:key="index"
					:class="`action--${card.name}`"
					class="btn-card card"
				>
				</div>
			</transition-group>
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
	top: 0;

	@for $i from 1 through 30 {
		$rotate: random(30) - 15;
		$left: random(30) - 15;
		$top: random(20) - 10;

		&:nth-child(#{$i}) {
			transform: translate(#{$left}px, #{$top}px) rotate(#{$rotate}deg);
		}
	}
}

.cards-action-enter-active,
.cards-action-leave-active {
	position: absolute;
	transition-duration: 0.75s;
	transition-property: opacity, transform;
}

.cards-action-enter {
	opacity: 0;
	transform: scale(3);
}

.cards-action-enter-to,
.cards-action-leave {
	opacity: 1;
	transform: scale(1);
}

.cards-action-leave-to {
	opacity: 0;
	transform: scale(3);
}
</style>
