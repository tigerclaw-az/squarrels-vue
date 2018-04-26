<template>
	<a
		href="#"
		role="button"
		v-bind:class="{
			disabled: isDisabled
		}"
		@click="onClick">
		<span
			:class="card {{cardType || 'blank'}}--{{cardData.name}}"
			v-bind:drag="canDrag"
			v-bind:drag-data="cardData"
			v-bind:drag-stop="onDragStop"
		>
		</span>
	</a>
</template>

<script>
export default {
	name: 'Card',
	props: {
		cardType: {
			type: String,
			required: true
		},
		id: {
			type: Number,
			required: true
		},
	},
	data: function() {
		return {
			cardData: {},
		}
	},
	computed: {
		canDrag: function() {
			return true;
		},
		isDisabled: function() {
			return true;
		},
	},
	methods: {
		onDragStop: function(event) {
			this.$log.debug(event);
		}
	}
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss">
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
