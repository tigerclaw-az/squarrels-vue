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
			<b-button class="btn-new-game" variant="primary" @click="createGame">
				NEW GAME
			</b-button>
			<div v-if="hasGames" class="games-list p-3">
				<b-table
					:bordered="true"
					:dark="true"
					:fields="tableFields"
					:items="games"
					:responsive="true"
					:striped="true"
					sort-by.sync="createdAt"
				>
					<template v-slot:cell(join)="data">
						<b-button
							:to="{ name: 'game', params: { id: data.item.id } }"
							class="btn btn-primary btn-join-game"
						>
							JOIN
						</b-button>
					</template>
					<template v-slot:cell(delete)="data">
						<b-button
							v-if="canDelete(data.item)"
							variant="outline-danger"
							@click="deleteGame(data.item.id)"
						>
							<icon name="trash" class="icon icon-delete" />
						</b-button>
					</template>
				</b-table>
			</div>
		</div>
	</div>
</template>

<script>
import { mapGetters, mapState } from 'vuex';
import { isEmpty } from 'lodash';
import moment from 'moment';

import Icon from 'vue-awesome/components/Icon';
import { BButton, BTable } from 'bootstrap-vue';

export default {
	name: 'start',
	components: {
		'b-button': BButton,
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
					key: 'createdBy.name',
					label: 'Created By',
					sortable: true,
				},
				{
					key: 'status',
					label: 'Status',
					// formatter: value => {
					// 	return value ? 'Yes' : 'No';
					// },
					sortable: true,
				},
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
					label: 'Remove',
				},
			],
		};
	},
	computed: {
		...mapGetters({
			player: 'players/getMyPlayer',
		}),
		...mapState(['isAdmin']),
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
	mounted: function() {
		this.loadGames();
	},
	methods: {
		canDelete(item) {
			return this.isAdmin || item.createdBy.id === this.player.id;
		},
		createGame() {
			this.$store.dispatch('start/createGame', this.player.id);
		},
		deleteGame(id) {
			this.$store.dispatch('start/deleteGame', id);
		},
		loadGames() {
			this.$store.dispatch('start/loadGames');
		},
	},
};
</script>

<style lang="scss" scoped>
// prettier-ignore
@import "~@/assets/scss/variables";
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
	background-color: rgba(map-get($theme-colors, 'secondary'), 0.8);
	box-shadow: 5px 5px 10px 0px rgba(0, 0, 0, 0.75);
	max-height: 75vh;
	overflow: auto;

	.btn-join-game {
		position: relative;
	}
}
</style>
