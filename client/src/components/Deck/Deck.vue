<template>
	<div v-if="deck" :type="deck.deckType" class="deck-container">
		<component :is="deckComponent" :cards="deck.cards" />
		<span class="deck-label">{{ deck.deckType }} - {{ totalCards }}</span>
	</div>
</template>

<script>
export default {
	name: 'deck',
	props: {
		deck: {
			type: Object,
			required: true,
		},
	},
	computed: {
		cards: function() {
			return this.deck.cards;
		},
		deckComponent: function() {
			if (this.deck) {
				const name = `${this.deck.deckType[0].toUpperCase()}${this.deck.deckType.slice(
					1,
				)}`;

				return () => import(`./Deck${name}.vue`);
			}

			return null;
		},
		totalCards: function() {
			return this.cards.length;
		},
	},
};
</script>

<style lang="scss" src="./deck.scss"></style>
