<template>
	<div id="deck">
		<div class="count" v-if="isType('action')">{{totalCards}}</div>
		<div
			class="deck"
			:class="{
				'draw-card': deckType === 'main' && canDraw
			}"
			v-bind:drop="isType('discard')"
			v-bind:drop-success="onDropComplete($data, $event)"
		>
			<a
				class="cards-group"
				href=""
				role="button"
				v-class="{ disabled: isDisabled }"
				v-show="totalCards"
				@mousedown.prevent="onMousedown"
			>
				<span
					class="card"
					v-for="card in cardsLimited"
					:key="card.id"
					v-class="isType('action') ? 'action--{{card.name}}' : 'blank--'"
				>
				</span>
			</a>
		</div>
		<div ng-if="isType('main') && isAdmin" uib-dropdown>
			<b-dropdown id="dropdown-settings" variant="danger" text="Choose Card" @click="onDropdownClick">
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

// import Card from '@/components/Card/Card.vue';

export default {
	name: 'Deck',
	components: {
		// Card,
	},
	props: {
		deckType: {
			type: String,
			required: true
		},
	},
	data: function() {
		return {
			cards: [],
		};
	},
	computed: {
		...mapState({
			isGameStarted: 'game/isStarted'
		}),
		...mapGetters(['isAdmin']),
		canDraw: function() {
			return true;
		},
		cardsLimited: function() {
			return this.isType('main') ? this.cards[0] : this.cards;
		},
		isDisabled: function() {
			return this.isType('main') && !this.canDraw() ||
				this.isType('discard') && this.tooManyClicks ||
				this.isType('action') ||
				!this.game.isStarted;
		},
		totalCards: function() {
			return this.cards.length;
		},
	},
	methods: {
		isType: function(name) {
			return this.deckType === name;
		},
		onDropCompleted: function(event) {
			this.$log.debug(event);
		},
		onDropdownClick: function(event) {
			this.$log.debug(event);
		},
		onMousedown: function(event) {
			this.$log.debug(event);
		},
	},
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss">
	@import '~@/components/Card/card.scss';
	@import './deck';

	#deck {
		flex: 1;
		$height: map-get($card-height, 'small') + $deck-height;
		height: rem-calc($height);
		margin-right: 1rem;
		position: relative;
		width: rem-calc(map-get($card-width, 'small'));

		.count {
			@include center-horizontal;

			font-size: 2rem;
			top: -30%;
			z-index: 1;
		}

		&[type='main'] {
			.deck {
				// box-shadow: 4px 6px 1px get-color('pickled-bean');
				border: 2px outset get-color('zest');
			}
		}

		&[type='discard'] {
			border: 1px dashed get-color('black');
			height: rem-calc($height + 32);
			padding: 1rem;

			.deck {
				border: 2px dashed transparent;

				&.drag-enter {
					border-color: get-color('zest');
				}

				.card {
					$rotate: 0;

					@for $i from 1 through 20 {
						&:nth-child(#{$i}) {
							transform: rotate(#{$rotate}deg);
						}

						$rotate: $rotate + 5;
					}
				}
			}
		}

		&[type='action'] {
			.card {
				animation: .5s linear shrink;
			}
		}

		.deck {
			@extend %playing-cards;

			display: block;
			height: 100%;
			margin: 0 auto;
			width: 100%;

			.cards-group {
				margin: 0 auto;
				width: rem-calc(map-get($card-width, 'small'));
			}
		}

		@media (min-width: $screen-md-min) {
			$height: map-get($card-height, 'medium') + $deck-height;
			height: rem-calc($height);
			width: rem-calc(map-get($card-width, 'medium'));

			.count {
				font-size: 4rem;
				top: -25%;
			}

			&[type='discard'] {
				height: rem-calc($height + $deck-height * 2);
				padding: 1rem;
			}

			.deck {
				.cards-group {
					width: rem-calc(map-get($card-width, 'medium'));
				}
			}
		}
	}

</style>
