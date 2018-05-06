<template>
	<a
		href="#"
		role="button"
		class="btn-card"
		:class="{
			disabled: isDisabled
		}"
		@click="onClick">
		<span
			class="card"
			:class="cardClass"
			:drag="canDrag"
			:drag-data="cardData"
			:drag-stop="onDragStop"
		>
		</span>
	</a>
</template>

<script>
import { mapGetters, mapState } from 'vuex';

import api from '@/api/index';

export default {
	name: 'Card',
	props: {
		cardType: {
			type: String,
			required: true,
		},
		id: {
			type: String,
			required: true,
		},
	},
	data: function() {
		return {
			cardData: {},
		};
	},
	created: function() {
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
	},
	computed: {
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
		isDisabled: function() {
			return true;
		},
	},
	methods: {
		onClick: function(evt) {
			this.$log.debug(evt);
		},
		onDragStop: function(evt) {
			this.$log.debug(evt);
		},
	},
};
</script>

<style lang="scss" scoped>
@import '~@/components/Card/card.scss';

.card {
	@include generate-cards;

	background-repeat: no-repeat;
	background-size: contain;
	height: inherit;
	outline: none;

	&:focus {
		outline: none;
	}
}
</style>
