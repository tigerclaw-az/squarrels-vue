import BaseApi from './BaseApi';

export default class GamesApi extends BaseApi {
	constructor() {
		super('games');
	}

	actionCard(id, value) {
		return this.update(id, { actionCard: value });
	}

	create(playerId) {
		return this.http.post('/', { playerId });
	}

	createDecks(id) {
		if (!id) {
			return Promise.reject('Missing parameter "id" for createDecks()');
		}

		return this.http.post(`/${id}/decks`);
	}

	nextRound(id) {
		if (!id) {
			return Promise.reject('Missing parameter "id" for nextRound()');
		}

		return this.http.post(`/${id}/next-round`);
	}

	start(id) {
		if (!id) {
			return Promise.reject('Missing parameter "id" for start()');
		}

		return this.http.get(`/${id}/start`);
	}

	updatePlayers(id, playerIds) {
		if (!id) {
			return Promise.reject('Missing parameter "id" for updatePlayers()');
		}

		return this.update(id, { playerIds: playerIds });
	}
}
