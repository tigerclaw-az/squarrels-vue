<template>
	<!-- TODO: Add icons to each card for 'storage' and 'discard' -->
	<div
		role="button"
		class="btn-card"
		:class="{
			disabled: isDisabled,
			highlight: hasMatch,
		}"
		:style="cardStyle"
		@click="!isDisabled && onClick(cardData, matches, $event)"
	>
		<span
			class="card"
			:class="cardClass"
		>
		</span>
	</div>
</template>

<script>
import { mapGetters, mapState } from 'vuex';

import api from '@/api/index';

export default {
	name: 'Card',
	props: {
		cardData: {
			type: Object,
			required: false,
		},
		cardType: {
			type: String,
			required: true,
		},
		matches: {
			type: Array,
			default: function() {
				return [];
			},
		},
		id: {
			type: String,
			required: true,
		},
		onClick: {
			type: Function,
		},
		position: '',
		zIndex: 0,
	},
	data: function() {
		return {
			// cardData: {},
		};
	},
	computed: {
		...mapGetters({
			myPlayer: 'players/getMyPlayer',
		}),
		...mapState({
			actionCard: state => state.game.actionCard,
		}),
		canDrag: function() {
			return true;
		},
		cardClass: function() {
			if (this.cardData) {
				return `${this.cardData.cardType || 'blank'}--${
					this.cardData.name
				}`;
			}
		},
		cardStyle: function() {
			if (this.cardType !== 'action') {
				return { left: this.position.left, 'z-index': this.zIndex };
			}

			return {};
		},
		hasMatch: function() {
			return this.matches.length;
		},
		isActivePlayer: function() {
			const activePlayer = this.$store.getters['players/getByProp'](
				'isActive',
				true
			);

			return activePlayer && activePlayer.id === this.myPlayer.id;
		},
		isDisabled: function() {
			if (this.myPlayer.quarrel) {
				return false;
			}

			return !(this.isActivePlayer || this.myPlayer.hasDrawnCard);
		},
	},
	mounted: function() {
		if (!this.cardData) {
			api.cards
				.get(this.id)
				.then(res => {
					if (res.status === 200) {
						this.cardData = res.data[0];
					}
				})
				.catch(err => {
					this.$log.error(err);
				});
		}
	},
	methods: {},
};
</script>

<style lang="scss" scoped src="./card.scss">
</style>
