<template>
	<a
		href="#"
		role="button"
		class="btn-card"
		:class="{
			disabled: isDisabled,
			hightlight: hasMatch,
		}"
		:style="{ left: position.left }"
		@click.prevent="onClick">
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
		position: '',
	},
	data: function() {
		return {
			// cardData: {},
		};
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
	computed: {
		...mapGetters({
			canDrawCard: 'players/canDrawCard',
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
		hasMatch: function() {
			return this.matches.length;
		},
		isActivePlayer: function() {
			const activePlayer = this.$store.getters['players/getByProp'](
				'isActive',
				true
			);

			return activePlayer.id === this.myPlayer.id;
		},
		isDisabled: function() {
			return (
				(!this.canDrawCard && !this.isActivePlayer) || !this.hasMatch
			);
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

<style lang="scss" scoped src="./card.scss"></style>
