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
import { mapGetters } from 'vuex';

import _ from 'lodash';
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
		cardStyle: {
			type: Object,
			required: false,
		},
		id: {
			type: String,
			required: false,
		},
		matches: {
			type: Array,
			default: function() {
				return [];
			},
		},
		onClick: {
			type: Function,
		},
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
		cardClass: function() {
			if (!_.isEmpty(this.details)) {
				return `${this.details.cardType}--${this.details.name}`;
			}

			return 'blank--';
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
		}
	},
	components: {
		icon: Icon,
	},
};
</script>

<style lang="scss" scoped src="./card.scss">
</style>
