<template>
	<div
		:card-type="cardType"
		:class="{
			disabled: isDisabled,
		}"
		:style="cardStyle"
		class="btn-card"
		role="button"
		@click="!isDisabled && onClick(details, matches, $event)"
	>
		<span :class="cardClass" class="card">
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
				return `${this.details.cardType}--${this.details.name}`;
			}

			return 'blank--';
		},
		hasMatch: function() {
			return this.matches.length;
		},
		isActivePlayer: function() {
			const activePlayer = this.$store.getters['players/getByProp']('isActive', true);

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
		myPlayer: function() {
			return this.$store.getters['players/getMyPlayer'];
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
};
</script>

<style lang="scss" scoped src="./card.scss"></style>
