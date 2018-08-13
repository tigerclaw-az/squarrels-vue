<template>
	<div
		class="deck"
		:class="{
			'empty': !numCards,
		}"
	>
		<div
			class="cards-group"
			:class="{ disabled: isDisabled }"
			role="button"
			v-show="numCards"
			@click.prevent="onClick"
		>
			<span
				v-for="(card, index) in numCards"
				:key="index"
				class="card blank--"
			>
			</span>
		</div>
	</div>
</template>

<script>
import { mapGetters, mapState } from 'vuex';

export default {
	name: 'DeckDiscard',
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
	data: function() {
		return {
			maxClicks: 4,
			tooManyClicks: false,
		};
	},
	mounted: function() {
		// this.$store.dispatch('decks/load', this.id);
	},
	computed: {
		...mapGetters({
			canDrawCard: 'players/canDrawCard',
			myPlayer: 'players/getMyPlayer',
		}),
		...mapState({
			actionCard: state => state.game.actionCard,
		}),
		canHoard: function() {
			if (!this.actionCard) {
				return false;
			}

			return !this.myPlayer.isActive && this.actionCard.name === 'hoard';
		},
		isDisabled: function() {
			return this.tooManyClicks || !this.canHoard;
		},
	},
	methods: {
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
		onClick: function() {
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
		},
	},
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style lang="scss" scoped>
.deck {
	border: 2px dashed transparent;

	.card {
		$rotate: 0;

		@for $i from 1 through 20 {
			$rotate: $rotate + 5;

			&:nth-child(#{$i}) {
				transform: rotate(#{$rotate}deg);
			}
		}
	}
}
</style>
