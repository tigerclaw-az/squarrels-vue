<template>
	<b-button-toolbar>
		<b-button-group class="mx-1">
			<b-button variant="danger" @click="onClickAdminOption('reset-game')">
				Reset Game
			</b-button>
			<b-button variant="danger" @click="onClickAdminOption('reset-hoard')">
				Empty Hoard
			</b-button>
			<b-button
				variant="danger"
				@click="onClickAdminOption('reset-player-cards')"
			>
				Reset Player Cards
			</b-button>
			<b-button variant="danger" @click="onClickAdminOption('skip-player')">
				Skip Player
			</b-button>
		</b-button-group>
	</b-button-toolbar>
	<!-- <b-dropdown
		id="dropdown-admin-options"
		class="ml-2"
		variant="primary"
		text="Option"
	>
		<b-dropdown-item @click="onClickAdminOption('reset-game')">
			Reset Game
		</b-dropdown-item>
		<b-dropdown-item @click="onClickAdminOption('reset-hoard')">
			Reset Hoard
		</b-dropdown-item>
		<b-dropdown-item @click="onClickAdminOption('reset-player-cards')">
			Reset Player Cards
		</b-dropdown-item>
		<b-dropdown-item @click="onClickAdminOption('skip-player')">
			Skip Player
		</b-dropdown-item>
	</b-dropdown> -->
</template>

<script>
export default {
	name: 'admin-options',
	methods: {
		onClickAdminOption: function(name) {
			this.$log.debug(name);

			switch (name) {
				case 'reset-game':
					this.$store.dispatch('game/reset');
					break;
			}
		},
	},
};
</script>
