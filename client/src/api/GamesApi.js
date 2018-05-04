import BaseApi from './BaseApi';

export default class GamesApi extends BaseApi {
	constructor() {
		super('games');
	}

	actionCard(id, value) {
		return this.update(id, { actionCard: value });
	}

	start(id, playerIds) {
		return this.http.post(`/${id}/start`, playerIds);
	}

	updatePlayers(id, playerIds) {
		return this.update(id, { playerIds: playerIds });
	}
}
