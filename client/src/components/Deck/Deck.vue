<template>
	<div id="deck" :type="deck.deckType" v-if="deck">
		<div class="count" v-if="isType('main')">{{totalCards}}</div>
		<div
			class="deck"
			:class="{
				'draw-card': isType('main') && canDraw
			}"
			:drop="isType('discard')"
			:drop-success="onDropCompleted"
		>
			<a
				href=""
				class="cards-group"
				:class="{ disabled: isDisabled }"
				role="button"
				v-show="totalCards"
				@mousedown.prevent="onMousedown"
			>
				<span
					class="card"
					:class="isType('action') ? 'action--{{card.name}}' : 'blank--'"
					v-for="card in cardsLimited"
					:key="card.id"
				>
				</span>
			</a>
		</div>
		<div v-if="isType('main') && isAdmin" uib-dropdown>
			<b-dropdown id="dropdown-settings" variant="danger" text="Choose Card" @click="onClickDropdown">
				<b-dropdown-item data-type="action" data-name="ambush">Ambush</b-dropdown-item>
				<b-dropdown-item data-type="action" data-name="communism">Communism</b-dropdown-item>
				<b-dropdown-item data-type="action" data-name="hoard">Hoard</b-dropdown-item>
				<b-dropdown-item data-type="action" data-name="quarrel">Quarrel</b-dropdown-item>
				<b-dropdown-item data-type="action" data-name="whirlwind">Whirlwind</b-dropdown-item>
				<b-dropdown-item data-type="action" data-name="winter">Winter</b-dropdown-item>
				<b-dropdown-divider></b-dropdown-divider>
				<b-dropdown-item data-type="number" data-name="1">1</b-dropdown-item>
				<b-dropdown-item data-type="number" data-name="2">2</b-dropdown-item>
				<b-dropdown-item data-type="number" data-name="3">3</b-dropdown-item>
				<b-dropdown-item data-type="number" data-name="4">4</b-dropdown-item>
				<b-dropdown-item data-type="number" data-name="5">5</b-dropdown-item>
			</b-dropdown>
		</div>
	</div>
</template>

<script>
import { mapState } from 'vuex';

export default {
	name: 'Deck',
	components: {
	},
	props: {
		id: {
			type: String,
			required: true
		},
	},
	data: function() {
		return {
			isCurrentDeckLoaded: false,
		};
	},
	watch: {

	},
	mounted: function() {
		// this.$store.dispatch('decks/load', this.id);
	},
	computed: {
		...mapState([ 'isAdmin' ]),
		...mapState({
			isGameStarted: state => state.game.isStarted,
			isLoaded: state => state.decks.isLoaded,
			decks: state => state.decks
		}),
		canDraw: function() {
			return true;
		},
		cards: function() {
			return this.deck.cards;
		},
		cardsLimited: function() {
			return this.isType('main') ? this.cards[0] : this.cards;
		},
		deck: function() {
			return this.decks[this.id];
		},
		isDisabled: function() {
			return this.isType('main') && !this.canDraw ||
				this.isType('discard') && this.tooManyClicks ||
				this.isType('action');
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
		onDropCompleted: function(event) {
			this.$log.debug(event);
		},
		onClickDropdown: function(event) {
			this.$log.debug(event);
		},
		onMousedown: function(event) {
			this.$log.debug(event);
		},
	},
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss" src='./deck.scss'></style>
