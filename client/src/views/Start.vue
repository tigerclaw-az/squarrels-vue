<template>
	<div id="start">
		<b-row class="winter">
			<div v-if="!isConnected"
				class="alert alert-danger error" role="alert"
				v-cloak>
				Taking a nap. Be back later.
			</div>
			<div v-else
				class="games-list">
				<ul>
					<li v-for="game in games" :key="game.id">
						<router-link :to="{ name: 'game', params: { id: game.id }}"
							class="btn btn-primary btn-join-game"
							v-cloak>
							JOIN {{game.id}}
						</router-link>
					</li>
				</ul>
				<button class="btn btn-primary btn-new-game" @click="createGame">NEW GAME</button>
			</div>
		</b-row>
	</div>
</template>

<script>
import { mapGetters } from 'vuex';
import api from '@/api/index';

// TODO: Fix loading of games after websocket reconnects
export default {
	name: 'Start',
	data: function() {
		return {
			games: [],
		}
	},
	watch: {
		/**
		 * Watch for the websocket connection and perform necessary functions
		 * whenever the websocket reconnects
		 * @param  {Boolean}  newConn Updated value of isConnected
		 * @param  {Boolean}  oldConn Old value of isConnected
		 */
		isConnected(newConn, oldConn) {
			this.$log.debug('watch:isConnected', oldConn, newConn);
			if (newConn) {
				api.games.get()
					.then(res => {
						this.games = res.data;
					})
					.catch(err => {
						this.$log.error(err);
					});
			}
		}
	},
	mounted: function() {
		// this.$on('websocket:games:create', (game) => {
		// 	this.$log.debug('websocket:games:create', game);
		// 	this.games.push(game);
		// });
	},
	computed: {
		...mapGetters([
			'isConnected'
		]),
	},
	methods: {
		createGame() {
			api.games.create()
				.then(res => {
					let game = res.data;

					this.games.push(game);
				})
				.catch(err => {
					this.$log.error(err);
				});
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

	.error {
		@include center;
		width: 30%;
	}

	.games-list {
		@include center;

		.btn-join-game {
			position: relative;
		}
	}
</style>
