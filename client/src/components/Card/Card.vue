<template>
	<div
		:card-type="cardType"
		:class="['btn-card', { disabled: isDisabled }]"
		:style="cardStyle"
		role="button"
		@click="!isDisabled && onClick(details, matches, $event)"
	>
		<span :class="['card', cardClass]">
			<icon v-if="hasMatch" name="sun" class="icon" />
		</span>
	</div>
</template>

<script>
import { isEmpty } from 'lodash';
import Icon from 'vue-awesome/components/Icon';

import api from '@/api/index';

export default {
	name: 'card',
	components: {
		icon: Icon,
	},
	props: {
		isActivePlayer: {
			type: Boolean,
			default: false,
		},
		cardData: {
			type: Object,
			required: false,
			default: () => {
				return {};
			},
		},
		cardType: {
			type: String,
			required: true,
		},
		cardStyle: {
			type: Object,
			required: false,
			default: () => {
				return {};
			},
		},
		id: {
			type: String,
			required: false,
			default: '',
		},
		matches: {
			type: Array,
			default: function() {
				return [];
			},
		},
		myPlayer: {
			type: Object,
			default: () => {
				return {};
			},
		},
		onClick: {
			type: Function,
			default: function() {
				return false;
			},
		},
	},
	data: function() {
		return {
			details: {},
		};
	},
	computed: {
		cardClass: function() {
			if (!isEmpty(this.details)) {
				// return only the variant class (e.g. 'attack--squirrel')
				return `${this.details.cardType}--${this.details.name}`;
			}

			// when there's no detail, don't return a duplicate base class — return empty
			return '';
		},
		hasMatch: function() {
			return this.matches.length;
		},
		isDisabled: function() {
			if (this.myPlayer.selectQuarrelCard) {
				return false;
			} else if (this.cardType === 'deck') {
				return true;
			}

			return !(this.isActivePlayer || this.myPlayer.hasDrawnCard);
		},
	},
	mounted: function() {
		if (!isEmpty(this.cardData)) {
			this.details = this.cardData;
		} else if (this.id) {
			api.cards
				.get(this.id)
				.then(data => {
					this.details = data[0];
				})
				.catch(err => {
					this.$log.error(err);
					this.$toasted.error(err);
				});
		}
	},
};
</script>

<style lang="scss" scoped src="./card.scss"></style>
