<template>
	<div class="container">
		<keep-alive>
			<component :is="demoComponent" />
		</keep-alive>
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
