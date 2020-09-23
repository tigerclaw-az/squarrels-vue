import { isString } from 'lodash';
import BaseApi from './BaseApi';

export default class DecksApi extends BaseApi {
	constructor() {
		super('decks');
	}

	drawCard(id, options) {
		if (!id || !isString(id)) {
			return Promise.reject('Missing or invalid "id" parameter');
		}

		return this.http.post(`/${id}/draw`, options);
	}
}
