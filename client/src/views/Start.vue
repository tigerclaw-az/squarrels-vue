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
					<li v-for="(value, gameId) in games" :key="gameId">
						<router-link :to="{ name: 'game', params: { id: gameId }}"
							class="btn btn-primary btn-join-game"
							v-cloak>
							JOIN {{gameId}}
						</router-link>
						<button class="btn btn-danger" @click="deleteGame(gameId)">
							<icon name="trash" class="icon icon-delete"></icon>
						</button>
					</li>
				</ul>
				<button class="btn btn-primary btn-new-game" @click="createGame">NEW GAME</button>
			</div>
		</b-row>
	</div>
</template>

<script>
import Vue from 'vue';
import { mapGetters } from 'vuex';
import Icon from 'vue-awesome/components/Icon';

import api from '@/api/index';
import EventBus from '@/EventBus';

// FIXME: Make sure games are being added when another player creates the game
export default {
	name: 'Start',
	components: {
		Icon,
	},
	data: function() {
		return {
			games: {},
			waitCreateGame: false,
			waitDeleteGame: false,
			waitLoadGames: false,
		}
	},
	watch: {
		/**
		 * Watch for the websocket connection and perform necessary functions
		 * whenever the websocket reconnects
		 * @param  {Boolean}  newConn Updated value of isConnected
		 * @param  {Boolean}  oldConn Old value of isConnected
		 *
		 * @returns {void}
		 */
		isConnected(newConn, oldConn) {
			this.$log.debug('watch.isConnected', oldConn, newConn);
			if (newConn) {
				this.loadGames();
			}
		}
	},
	mounted: function() {
		this.loadGames();

		EventBus.$on('game:create', nuts => {
			Vue.set(this.games, nuts.id, {});
			this.waitCreateGame = false;
		});

		EventBus.$on('game:delete', id => {
			this.$log.debug('event-game:delete -> ', id);
			Vue.delete(this.games, id);
			this.waitDeleteGame = false;
		})
	},
	computed: {
		...mapGetters([
			'isConnected'
		]),
	},
	methods: {
		createGame: function() {
			let vm = this;

			this.waitCreateGame = true;

			api.games.create()
				.then(res => {
					let game = res.data;

					vm.$log.debug('Start:games.create', vm, game);

					// The game will be added once we get the
					// response back from websocket
					// vm.games.push(game);
				})
				.catch(err => {
					this.waitCreateGame = false;
					vm.$log.error(err);
				});
		},

		loadGames: function() {
			let vm = this;

			this.waitLoadGames = true;

			api.games.get()
				.then(res => {
					if (res.status === 200) {
						let gameData = res.data;

						this.waitLoadGames = false;

						for (let game of gameData) {
							Vue.set(vm.games, game.id, {});
						}
					}
				})
				.catch(err => {
					this.waitLoadGames = false;
					vm.$log.error(err);
				});
		},

		deleteGame: function(id) {
			this.waitDeleteGame = true;

			api.games.delete(id)
				.then(() => {
					// Actual removal will be done when websocket request comes back
				})
				.catch(err => {
					this.waitDeleteGame = false;
					this.$log.error(err);
				});
		},
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
