<template>
	<div id="deck" :type="deck.deckType" v-if="deck">
		<div class="count" v-if="isType('main')">{{totalCards}}</div>
		<div
			class="deck"
			:class="{
				'draw-card': isType('main') && canDrawCard
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
				@click.prevent="onClick"
			>
				<span
					class="card"
					:class="isType('action') ? 'action--{{card.name}}' : 'blank--'"
					v-for="card in cardsToDisplay"
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
import { mapGetters, mapState } from 'vuex';

export default {
	name: 'Deck',
	components: {},
	props: {
		id: {
			type: String,
			required: true,
		},
	},
	data: function() {
		return {
			maxClicks: 4,
			tooManyClicks: false,
		};
	},
	watch: {},
	mounted: function() {
		// this.$store.dispatch('decks/load', this.id);
	},
	computed: {
		...mapGetters({
			canDrawCard: 'players/canDrawCard',
			isActionCard: 'game/isActionCard',
			myPlayer: 'players/getMyPlayer',
		}),
		...mapState(['isAdmin']),
		...mapState({
			actionCard: state => state.game.actionCard,
			isGameStarted: state => state.game.isStarted,
			isLoaded: state => state.decks.isLoaded,
			decks: state => state.decks,
		}),
		canHoard: function() {
			return !this.myPlayer.isActive && this.isActionCard('hoard');
		},
		cards: function() {
			return this.deck.cards;
		},
		cardsToDisplay: function() {
			return this.isType('main') ? this.cards[0] : this.cards;
		},
		deck: function() {
			return this.decks[this.id];
		},
		isDisabled: function() {
			return (
				(this.isType('main') && !this.canDrawCard) ||
				(this.isType('discard') && this.tooManyClicks) ||
				this.isType('action')
			);
		},
		totalCards: function() {
			return this.cards.length;
		},
	},
	methods: {
		handleCardDrawn: function(cardDrawn) {
			const cardAction = cardDrawn.action;
			let cardsMerge = [];

			this.$log.debug(cardDrawn, cardAction, this);

			if (!cardAction) {
				// Player drew a non-"action" card, so add to their hand and update
				this.$store.dispatch('players/addCard', cardDrawn);
			} else {
				// this.gamesApi
				// 	.actionCard(this.game.id, cardDrawn.id)
				// 	.then(res => {
				// 		this.$log.debug('gameUpdate:actionCard -> ', res);
				// 	}, err => {
				// 		this.$log.error(err);
				// 	});
				// // Don't allow player to draw more than 7 cards
				// if (plData.totalCards >= this.playerModel.numDrawCards) {
				// 	plData.isFirstTurn = false;
				// }
			}

			// this.playersApi
			// 	.update(player.id, plData)
			// 	.then(res => {
			// 		this.$log.debug('playersApi:update()', res, this);
			// 		this.playersStore.update(player.id, { hasDrawnCard: true });
			// 	})
			// 	.catch(err => {
			// 		this.$log.error('This is nuts! Error: ', err);
			// 	});
		},
		// Must be method as you can't pass parameters to 'computed' functions
		isType: function(name) {
			return this.deck.deckType === name;
		},
		onClick: function(evt) {
			this.$log.debug(evt, this);

			if (this.isType('main') && this.canDrawCard) {
				this.$store
					.dispatch('decks/drawCard')
					.then(card => {
						this.handleCardDrawn(card);
					})
					.catch(err => {
						this.$log.error(err);
						this.$toasted.error(`Error drawing card! ${err}`);
					});
			} else if (this.isType('discard') && this.canHoard) {
				this.maxClicks--;
				// this.collectHoard();
			} else {
				if (this.maxClicks >= 0) {
					this.$toasted.warn(
						`STOP THAT! Only ${this.maxClicks} clicks LEFT!`
					);
				} else {
					this.$toasted.error(
						'You have been banned from collecting the Hoard!'
					);
					this.tooManyClicks = true;

					// TODO: Disable clicking even when user refreshes page
				}
			}
		},
		onClickDropdown: function(evt) {
			this.$log.debug(evt);
		},
		onDropCompleted: function(evt) {
			this.$log.debug(evt);
		},
		onMousedown: function(evt) {
			this.$log.debug(evt);
		},
	},
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss" src='./deck.scss'></style>
