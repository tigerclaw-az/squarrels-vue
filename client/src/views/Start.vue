<template>
	<div class="winter">
		<button class="btn btn-primary button-join-game"
			v-show="isConnected"
			@click="joinGame"
			v-cloak>JOIN GAME</button>

		<div class="alert alert-danger error" role="alert"
			v-show="!isConnected"
			v-cloak>Taking a nap. Be back later.</div>
	</div>
</template>

<script>
import { mapGetters } from 'vuex';

// let initialState = {
// 	isConnected: false
// }
export default {
	name: 'Start',
	computed: {
		...mapGetters([
			'isConnected'
		]),
	},
	methods: {
		joinGame() {
			this.$log.debug('join game');
		}
	}
};
</script>
