<template>
	<div id="deck" :type="deck.deckType" v-if="deck">
		<div class="count" v-if="isType('main')">{{totalCards}}</div>
		<div
			class="deck"
			:class="{
				'draw-card': isType('main') && canDrawCard,
				'empty': !totalCards,
			}"
		>
			<div
				class="cards-group"
				:class="{ disabled: isDisabled }"
				role="button"
				v-show="totalCards"
				@click.prevent="onClick"
			>
				<span
					v-for="card in cardsToDisplay"
					:key="card.id"
					class="card"
					:class="[cardClassName(card.name)]"
				>
				</span>
			</div>
		</div>
		<div v-if="isType('main') && isAdmin" uib-dropdown>
			<b-dropdown
				id="dropdown-settings"
				text="Choose Card"
				variant="danger"
			>
				<b-dropdown-item
					v-for="(item, index) in dropdownList"
					:key="index"
					:data-id="item.id"
					:data-type="item.cardType"
					:data-name="item.name"
					@click="onClickDrawCard(item)"
				>
				{{item.name}}
				</b-dropdown-item>
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
			if (!this.actionCard) {
				return false;
			}

			return !this.myPlayer.isActive && this.actionCard.name === 'hoard';
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
		dropdownList: function() {
			return this.deck.cards;
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
		cardClassName: function(name) {
			return this.isType('action') ? `action--${name}` : 'blank--';
		},
		collectHoard: function() {
			if (this.canHoard) {
				this.$socket.sendObj({
					action: 'hoard',
					player: this.myPlayer,
				});

				return true;
			}

			if (this.myPlayer.cardsInHand.length) {
				// TODO: Remove highest card (that isn't special) from player
				/**
				 * this.$store.dispatch('players/removeHighCard');
				 this.playerModel.getCards()
				.then(res => {
					let cards = res.data,
						highCard = this._.maxBy(cards, (card) => {
							return card.cardType === 'special' ? -1 : card.amount;
						});

					this.$log.debug('highCard ->', highCard);

					if (!this._.isEmpty(highCard)) {
						this.toastr.warning(highCard.name, 'You just lost a card!');

						// FIXME: Only 1 card should be discarded
						this.deckStore.discard(highCard.id, false);
					}
				}, (err) => {
					this.$log.error(err);
				});
				 */
			}
		},
		handleCardDrawn: function(cardDrawn) {
			const cardAction = cardDrawn.action;
			let dispatchAction = 'players/addCards';
			let actionData = { cards: [cardDrawn] };

			this.$log.debug(cardDrawn, cardAction, this);

			if (cardAction) {
				actionData = cardDrawn;
				dispatchAction = 'game/actionCard';
			}

			this.$store.dispatch(dispatchAction, actionData);
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
			} else if (this.isType('discard')) {
				if (this.actionCard) {
					this.collectHoard();
				} else {
					if (this.maxClicks >= 0) {
						this.$toasted.info(
							`STOP THAT! Only ${this.maxClicks} clicks LEFT!`
						);
						this.maxClicks--;
					} else {
						this.$toasted.error(
							'You have been banned from collecting the Hoard!'
						);
						this.tooManyClicks = true;

						// TODO: Disable clicking even when user refreshes page
					}
				}
			}
		},
		onClickDrawCard: function(adminCard) {
			this.$log.debug(adminCard);
			this.$store
				.dispatch('decks/drawCard', { adminCard })
				.then(card => {
					this.$log.debug('card->', card);
					this.handleCardDrawn(card);
				})
				.catch(err => {
					this.$log.error(err);
					this.$toasted.error(`Error drawing card! ${err}`);
				});
		},
	},
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style lang="scss" src='./deck.scss'>
</style>
