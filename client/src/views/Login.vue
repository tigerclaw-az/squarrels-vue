<template>
	<form class="form-horizontal" name="playerForm"
		@submit.prevent="createPlayer"
		v-cloak>
		<div class="form-group form-group-md row">
			<div class="col-xs-12 col-sm-5">
				<input class="form-control sq-input-player-name"
						maxlength="24"
						minlength="3"
						name="pName"
						placeholder="Name"
						type="text"
						v-model="pName"/>
			</div>
			<div class="col-xs-12 col-sm-7">
				<button
					class="btn btn-primary"
					type="submit"
				>Login
				</button>
			</div>
		</div>
	</form>
</template>

<script>
export default {
	name: 'Login',
	data: function() {
		return {
			pName: ''
		}
	},
	methods: {
		createPlayer() {
			this.$log.debug(this.pName);

			this.$store
				.dispatch('players/insert', { name: this.pName, isCurrent: true })
				.then(() => {
					this.$router.push('/');
				});
		}
	}
}
</script>

<style lang="scss">

</style>
