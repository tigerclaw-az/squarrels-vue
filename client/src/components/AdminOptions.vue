<template>
	<b-dropdown id="dropdown-admin-options" class="ml-2" variant="info" text="Option">
		<b-dropdown-item @click="onClickAdminOption('reset-game')">Reset Game</b-dropdown-item>
		<b-dropdown-item @click="onClickAdminOption('reset-hoard')">Reset Hoard</b-dropdown-item>
		<b-dropdown-item @click="onClickAdminOption('reset-player-cards')">Reset Player Cards</b-dropdown-item>
		<b-dropdown-item @click="onClickAdminOption('skip-player')">Skip Player</b-dropdown-item>
	</b-dropdown>
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

<style>
</style>
