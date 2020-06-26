<template>
	<div class="alert alert-danger error" role="alert">
		Taking a nap. Be back later.
	</div>
</template>

<script>
import { mapGetters } from 'vuex';

export default {
	computed: {
		...mapGetters({
			isConnected: 'isConnected',
		}),
	},
	watch: {
		isConnected(conn) {
			this.$log.info(conn);

			if (conn) {
				this.$router.go(-1);
			}
		},
	},
};
</script>
