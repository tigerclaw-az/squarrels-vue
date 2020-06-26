<template>
	<b-container fluid>
		<b-row>
			<div
				v-if="!isConnected"
				v-cloak
				class="alert alert-danger error"
				role="alert"
			>
				Taking a nap. Be back later.
			</div>
			<b-form v-else inline @submit.prevent="createPlayer">
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
						></b-form-input>
						<b-input-group-append>
							<b-btn type="submit" variant="primary">Login</b-btn>
						</b-input-group-append>
					</b-input-group>
				</b-form-group>
			</b-form>
		</b-row>
	</b-container>

	<!-- <b-modal
		id="login"
		v-model="showModal"
		centered
		hide-footer
		lazy
		size="lg"
		title="Login"
		@shown="focusUsername"
	>
	</b-modal>-->
</template>

<script>
import { mapGetters } from 'vuex';

export default {
	name: 'login',
	data: function() {
		return {
			pName: '',
			showModal: true,
		};
	},
	computed: {
		...mapGetters({
			isConnected: 'isConnected',
		}),
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
			this.$refs.username.focus();
		},
	},
};
</script>
