<template>
	<div id="start">
		<div class="winter">
			<div class="welcome-message">
				<h2>Welcome {{ player.name }}!</h2>
				<p v-if="!hasGames">
					Start by pressing "New Game" to create a game
				</p>
				<p v-else>
					Choose a game from the list, or start a "New Game"
				</p>
			</div>
			<div
				v-if="!isConnected"
				v-cloak
				class="alert alert-danger error"
				role="alert"
			>
				Taking a nap. Be back later.
			</div>
			<div
				v-else
				class="games-list w-75"
			>
				<b-table
					v-if="hasGames"
					:bordered="true"
					:dark="true"
					:fields="tableFields"
					:items="games"
					:responsive="true"
					:striped="true"
					sort-by.sync="createdAt"
				>
					<template
						slot="join"
						slot-scope="data"
					>
						<router-link
							:to="{ name: 'game', params: { id: data.item.id } }"
							class="btn btn-primary btn-join-game"
						>
							JOIN
						</router-link>
					</template>
					<template
						slot="delete"
						slot-scope="data"
					>
						<button
							class="btn btn-danger"
							@click="deleteGame(data.item.id);"
						>
							<icon
								name="trash"
								class="icon icon-delete"
							/>
						</button>
					</template>
				</b-table>
				<!--
					<li v-for="(value, gameId) in games" :key="gameId">
						<router-link :to="{ name: 'game', params: { id: gameId }}"
							class="btn btn-primary btn-join-game"
							v-cloak>
							JOIN {{gameId}}
						</router-link>
					</li>
        -->
			</div>
			<button
				class="btn btn-primary btn-new-game"
				@click="createGame"
			>
				NEW GAME
			</button>
		</div>
	</div>
</template>

<script>
import { mapGetters, mapState } from 'vuex';
import { isEmpty } from 'lodash';
import moment from 'moment';

import Icon from 'vue-awesome/components/Icon';
import { BTable } from 'bootstrap-vue';

export default {
	name: 'start',
	components: {
		'b-table': BTable,
		Icon,
	},
	data: function() {
		return {
			tableFields: [
				{
					key: 'join',
					label: '',
				},
				{
					key: 'id',
					label: 'ID',
					formatter: value => {
						return value.substr(0, 4) + '...' + value.substr(-4);
					},
					sortable: true,
				},
				{
					key: 'createdAt',
					label: 'Created',
					formatter: value => {
						return moment(value).format('dddd, MMMM Do YYYY');
					},
					sortable: true,
				},
				{
					key: 'isStarted',
					label: 'Started?',
					formatter: value => {
						return value ? 'Yes' : 'No';
					},
					sortable: true,
				},
				'roundNumber',
				{
					key: 'playerIds',
					label: '# of Players',
					formatter: value => {
						return value.length;
					},
					sortable: true,
				},
				{
					key: 'delete',
					label: 'Delete Game',
				},
			],
		};
	},
	computed: {
		...mapGetters({
			isConnected: 'isConnected',
			player: 'players/getMyPlayer',
		}),
		...mapState('start', [
			'games',
			'waitCreateGame',
			'waitDeleteGame',
			'waitLoadGames',
		]),
		hasGames: function() {
			return !isEmpty(this.games);
		},
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
		},
	},
	created: function() {
		this.loadGames();
	},
	methods: {
		createGame: function() {
			this.$store.dispatch('start/createGame');
		},

		loadGames: function() {
			this.$store.dispatch('start/loadGames');
		},

		deleteGame: function(id) {
			this.$store.dispatch('start/deleteGame', id);
		},
	},
};
</script>

<style lang="scss" scoped>
// prettier-ignore
@import "~@/assets/scss/mixins";

.winter {
	align-items: center;
	// prettier-ignore
	background-image: url("~@/assets/images/winter-background.jpg");
	background-size: cover;
	display: flex;
	flex-flow: column;
	height: 100vh;
	justify-content: center;
}

.error {
	@extend %center;
	width: 30%;
}

.games-list {
	max-height: 75vh;
	overflow: auto;

	.btn-join-game {
		position: relative;
	}
}
</style>
