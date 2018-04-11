<template>
	<a
		href=""
		role="button"
		v-bind:class="{
			disabled: isDisabled
		}"
		@click="onClick"
	>
		<span
			v-bind:class="card {{cardData.cardType || 'blank'}}--{{cardData.name}}"
			<!-- ng-attr-ng-drag="{{cardCtrl.canDrag() ? true : false}}"
			ng-drag-data="cardCtrl.cardData"
			ng-drag-stop="cardCtrl.onDragStop()" -->
		>
		</span>
	</a>
</template>

<script>
export default {
	name: 'Card',
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss">

</style>
