<template>
	<div id="start">
		<b-row class="winter">
			<!-- <button class="btn btn-primary button-join-game"
				v-if="isConnected"
				@click="joinGame"
				v-cloak>JOIN GAME</button> -->

			<div class="alert alert-danger error" role="alert"
				v-if="!isConnected"
				v-cloak>Taking a nap. Be back later.</div>
		</b-row>
	</div>
</template>

<script>
import { mapGetters } from 'vuex';

export default {
	name: 'Start',
	data: function() {
		return {
		}
	},
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

<style lang="scss" scoped>
	@import '~@/assets/scss/mixins';

	.winter {
		background-image: url('~@/assets/images/winter-background.jpg');
		background-size: cover;
		height: 100vh;
		margin: -.25rem -1.25rem;
		width: 100vw;
	}

	.button-join-game,
	.error {
		@include center;
	}

	.error {
		width: 30%;
	}
</style>
