import BaseApi from './BaseApi';

export default class GamesApi extends BaseApi {
	constructor() {
		super('games');
	}

	actionCard(id, value) {
		return this.update(id, { actionCard: value });
	}

	dealCards(id) {
		return this.http.get(`/${id}/deal`);
	}

	nextRound(id) {
		return this.http.post(`/${id}/next-round`);
	}

	start(id) {
		return this.http.get(`/${id}/start`);
	}

	updatePlayers(id, playerIds) {
		return this.update(id, { playerIds: playerIds });
	}
}
