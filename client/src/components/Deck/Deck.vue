<template>
	<div v-if="deck" :type="deck.deckType" class="deck-container">
		<keep-alive>
			<component
				:is="deckComponent"
				:cards="deck.cards"
				:num-cards="totalCards"
			/>
		</keep-alive>
		<span class="deck-label">{{ deck.deckType }} - {{ totalCards }}</span>
	</div>
</template>

<script>
export default {
	name: 'deck',
	props: {
		id: {
			type: String,
			required: true,
		},
	},
	computed: {
		cards: function() {
			return this.deck.cards;
		},
		deck: function() {
			return this.$store.state.decks[this.id];
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

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style lang="scss" src="./deck.scss"></style>
