<template>
	<div id="start">
		<div class="winter">
			<button class="btn btn-primary button-join-game"
				v-show="isConnected"
				@click="joinGame"
				v-cloak>JOIN GAME</button>

			<div class="alert alert-danger error" role="alert"
				v-show="!isConnected"
				v-cloak>Taking a nap. Be back later.</div>
		</div>
	</div>
</template>

<script>
import { mapGetters } from 'vuex';

export default {
	name: 'Start',
	computed: {
		...mapGetters([
			'isConnected'
		]),
	},
	methods: {
		joinGame() {
			this.$router.push('/game');
		}
	}
};
</script>
