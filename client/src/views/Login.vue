<template>
	<b-modal
		id="login"
		v-model="showModal"
		centered
		hide-footer
		lazy
		size="lg"
		title="Login"
		@shown="focusUsername"
	>
		<b-container fluid>
			<b-form
				inline
				@submit.prevent="createPlayer"
			>
				<b-form-group
					id="playerForm"
					label="Username"
					label-for="sq-username"
					label-sr-only
				>
					<b-input-group size="lg">
						<b-form-input
							ref="username"
							v-model.trim="pName"
							class="sq-input-player-name"
							maxlength="24"
							minlength="3"
							name="sq-username"
							placeholder="username"
							type="text"
						>
						</b-form-input>
						<b-input-group-append>
							<b-btn
								type="submit"
								variant="primary"
							>
								Login
							</b-btn>
						</b-input-group-append>
					</b-input-group>
				</b-form-group>
			</b-form>
		</b-container>
	</b-modal>
</template>

<script>
export default {
	name: 'login',
	data: function() {
		return {
			pName: '',
			showModal: true,
		};
	},
	mounted: function() {
		this.$nextTick(() => {
			this.$usernameInput = this.$refs.username;
		});
	},
	methods: {
		createPlayer: function() {
			this.$log.debug(this.pName);

			this.$store
				.dispatch('players/create', {
					name: this.pName,
					isCurrent: true,
				})
				.then(() => {
					this.$router.push('/');
				})
				.catch(err => {
					this.$toasted.error('Unable to create player');
					this.$log.error(err);
				});
		},
		focusUsername: function() {
			this.$usernameInput.focus();
		},
	},
};
</script>
