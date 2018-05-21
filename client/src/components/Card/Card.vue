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
			:drag="canDrag"
			:drag-data="cardData"
			:drag-stop="onDragStop"
		>
		</span>
	</div>
</template>

<script>
import { mapGetters } from 'vuex';

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
			return { left: this.position.left, 'z-index': this.zIndex };
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
			return (
				!this.isActivePlayer ||
				this.cardData.action ||
				!this.myPlayer.hasDrawnCard
			);
		},
	},
	created: function() {
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
	methods: {
		onDragStop: function(evt) {
			this.$log.debug(evt);
		},
	},
};
</script>

<style lang="scss" scoped src="./card.scss">
</style>
