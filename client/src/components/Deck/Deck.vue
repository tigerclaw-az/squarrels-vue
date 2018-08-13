<template>
	<div v-if="deck" :type="deck.deckType" class="deck-container">
		<span class="deck-label">{{deck.deckType}}</span>
		<component :is="deckComponentInstance" :cards="deck.cards" :numCards="totalCards"></component>
	</div>
</template>

<script>
import { mapGetters, mapState } from 'vuex';

export default {
	name: 'Deck',
	props: {
		id: {
			type: String,
			required: true,
		},
	},
	mounted: function() {
		// this.$store.dispatch('decks/load', this.id);
	},
	computed: {
		...mapState({
			decks: state => state.decks,
		}),
		cards: function() {
			return this.deck.cards;
		},
		deck: function() {
			return this.decks[this.id];
		},
		deckComponentInstance: function() {
			const name =
				this.deck.deckType[0].toUpperCase() +
				this.deck.deckType.slice(1);

			return () => import(`./Deck${name}.vue`);
		},
		totalCards: function() {
			return this.cards.length;
		},
	},
	methods: {
		// Must be method as you can't pass parameters to 'computed' functions
		isType: function(name) {
			return this.deck.deckType === name;
		},
	},
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style lang="scss" src='./deck.scss'>
</style>
