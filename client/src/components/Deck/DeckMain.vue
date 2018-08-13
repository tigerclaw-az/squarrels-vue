<template>
	<div
		class="deck"
		:class="{
			'can-draw': canDrawCard,
			'draw-card': canDrawCard,
			'empty': !numCards,
		}"
	>
		<div class="count">{{numCards}}</div>
		<div v-if="!canDrawCard" class="overlay">
			<icon name="ban" scale="7" class="icon"></icon>
		</div>
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
		<div v-if="isAdmin" uib-dropdown>
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
import Icon from 'vue-awesome/components/Icon';

export default {
	name: 'DeckMain',
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
		return {};
	},
	mounted: function() {
		// this.$store.dispatch('decks/load', this.id);
	},
	computed: {
		...mapGetters({
			canDrawCard: 'players/canDrawCard',
			myPlayer: 'players/getMyPlayer',
		}),
		...mapState(['isAdmin']),
		dropdownList: function() {
			return this.cards;
		},
		isDisabled: function() {
			return !this.canDrawCard;
		},
	},
	methods: {
		handleCardDrawn: function(cardDrawn) {
			const cardAction = cardDrawn.action;
			let dispatchAction = 'players/addCards';
			let cardData = { cards: [cardDrawn] };

			this.$log.debug(cardDrawn, cardAction, this);

			this.$store.dispatch('players/drawCard', cardData);

			if (cardAction) {
				cardData = cardDrawn;
				dispatchAction = 'game/actionCard';
			}

			this.$store.dispatch(dispatchAction, cardData);
		},
		onClick: function() {
			if (this.canDrawCard) {
				this.$store
					.dispatch('decks/drawCard')
					.then(card => {
						this.handleCardDrawn(card);
					})
					.catch(err => {
						this.$log.error(err);
						this.$toasted.error(`Error drawing card! ${err}`);
					});
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
	components: {
		icon: Icon,
	},
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style lang="scss" scoped>
// prettier-ignore
@import "~@/assets/scss/variables";

.count {
	bottom: 0;
	color: $black;
	font-size: 1.25rem;
	font-weight: $font-weight-bold;
	left: 50%;
	position: absolute;
	transform: translateX(-50%);
	z-index: 1;
}

.can-draw {
	.cards-group {
		// prettier-ignore
		border: 2px dashed get-color("zest");
		// prettier-ignore
		box-shadow: 0 0 15px 10px theme-color("success");
	}
}

.overlay {
	height: 100%;
	position: absolute;
	width: 100%;
	z-index: 5;

	.icon {
		color: theme-color('danger');
		display: flex;
		height: 100%;
		margin: 0 auto;
	}
}

.dropdown {
	margin-top: 1rem;

	.dropdown-menu {
		max-height: 200px;
		overflow: auto;
	}
}
</style>
