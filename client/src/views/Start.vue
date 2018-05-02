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
				this.getGames();
			}
		}
	},
	mounted: function() {
		let vm = this;

		this.getGames();

		EventBus.$on('game:create', nuts => {
			// vm.games.push(nuts.id);
			Vue.set(vm.games, nuts.id, {});
		});
	},
	computed: {
		...mapGetters([
			'isConnected'
		]),
	},
	methods: {
		createGame: function() {
			let vm = this;

			api.games.create()
				.then(res => {
					let game = res.data;

					vm.$log.debug('Start:games.create', vm, game);

					// The game will be added once we get the
					// response back from websocket
					// vm.games.push(game);
				})
				.catch(err => {
					vm.$log.error(err);
				});
		},

		getGames: function() {
			let vm = this;

			api.games.get()
				.then(res => {
					if (res.status === 200) {
						let gameData = res.data;

						for (let game of gameData) {
							// vm.games.push(game.id);
							Vue.set(vm.games, game.id, {});
						}
					}
				})
				.catch(err => {
					vm.$log.error(err);
				});
		},

		deleteGame: function(id) {
			api.games.delete(id)
				.then(() => {
					Vue.delete(this.games, id);
				})
				.catch(err => {
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
