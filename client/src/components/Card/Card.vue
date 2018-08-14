<template>
	<!-- TODO: Add icons to each card for 'storage' and 'discard' -->
	<div
		:card-type="cardType"
		class="btn-card"
		:class="{
			disabled: isDisabled,
		}"
		role="button"
		:style="cardStyle"
		@click="!isDisabled && onClick(details, matches, $event)"
	>
		<span
			class="card"
			:class="cardClass"
		>
			<icon v-if="hasMatch" name="sun" class="icon"></icon>
		</span>
	</div>
</template>

<script>
import { mapGetters, mapState } from 'vuex';
import Icon from 'vue-awesome/components/Icon';

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
			required: false,
		},
		onClick: {
			type: Function,
		},
		position: '',
		zIndex: 0,
	},
	data: function() {
		return {
			details: {},
		};
	},
	computed: {
		...mapGetters({
			myPlayer: 'players/getMyPlayer',
		}),
		...mapState({
			actionCard: state => state.game.actionCard,
		}),
		cardClass: function() {
			if (this.details) {
				return `${this.details.cardType || 'blank'}--${
					this.details.name
				}`;
			}
		},
		cardStyle: function() {
			if (['hand'].includes(this.cardType)) {
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
			} else if (this.cardType === 'deck') {
				return true;
			}

			return !(this.isActivePlayer || this.myPlayer.hasDrawnCard);
		},
	},
	mounted: function() {
		if (this.cardData) {
			this.details = this.cardData;
		} else if (this.id && !this.cardData) {
			api.cards
				.get(this.id)
				.then(res => {
					if (res.status === 200) {
						this.details = res.data[0];
					}
				})
				.catch(err => {
					this.$log.error(err);
				});
		} else {
			this.$toasted.error('Unable to get card data!');
		}
	},
	components: {
		icon: Icon,
	},
};
</script>

<style lang="scss" scoped src="./card.scss">
</style>
