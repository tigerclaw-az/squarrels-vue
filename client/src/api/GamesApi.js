import BaseApi from './BaseApi';

export default class GamesApi extends BaseApi {
	constructor() {
		super('games');
	}

	actionCard(id, value) {
		return this.update(id, { actionCard: value });
	}

	start(id, players) {
		return this.http.post(`/${id}/start`, players);
	}
}
