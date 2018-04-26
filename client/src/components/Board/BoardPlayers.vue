<template>
	<div class="sq-players-wrapper">
		<form class="form-horizontal" name="playerForm"
			@submit.prevent="createPlayer"
			v-if="!isGameStarted && !isCurrentPlayer && !isTooManyPlayers"
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
					>Join
					</button>
				</div>
			</div>
		</form>
		<!-- <webcam channel="webcam"></webcam> -->
		<div class="sq-players">
			<Player
				v-for="p in playersOrder"
				:key="p.id"
				:class="{ current: p.isCurrent }"
				:player="p"
			></Player>
		</div>
	</div>
</template>

<script>
import { mapGetters, mapState } from 'vuex';

import Player from '@/components/Player/Player.vue';

export default {
	name: 'BoardPlayers',
	components: {
		Player,
	},
	props: ['isGameStarted'],
	data: function() {
		return {
			pName: ''
		}
	},
	computed: {
		...mapGetters(['game/isStarted']),
		...mapState(['players/players']),
		isCurrentPlayer: function() {
			return false;
		},
		isTooManyPlayers: function() {
			return this.players && this.players.length === 6;
		},
		playersOrder: function() {
			return this.players;
		},
	},
	methods: {
		createPlayer: function() {
			this.$log.debug(this.pName);
		}
	}
}
</script>

<style lang="scss">
	.sq-players {
		display: flex;
		flex-wrap: wrap;
	}
</style>
