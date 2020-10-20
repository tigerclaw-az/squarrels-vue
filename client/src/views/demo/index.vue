<template>
	<div class="container">
		<component :is="demoComponent" />
	</div>
</template>

<script>
export default {
	name: 'demo',
	props: {
		routeName: {
			type: String,
			required: true,
		},
	},
	computed: {
		demoComponent: function() {
			return () => import(`./${this.routeName}.vue`);
		},
	},
};
</script>
