import axios from 'axios';
import { isString } from 'lodash';

export default class BaseApi {
	constructor(path) {
		this.host = `${process.env.VUE_APP_SERVER}`;
		this.path = path;
		this.url = `//${this.host}/api/${path}/`;

		this.http = axios.create({
			baseURL: this.url,
			timeout: 5000,
			withCredentials: true,
		});

		this.http.interceptors.response.use(
			res => {
				return res;
			},
			err => {
				return Promise.reject(err);
			},
		);
	}

	create(data) {
		return this.http.post('/', data);
	}

	delete(id) {
		if (!id || !isString(id)) {
			return Promise.reject('Missing or invalid "id" parameter');
		}

		return this.http.delete(`/${id}`);
	}

	get(query = '') {
		return this.http.get(`/${query}`);
	}

	reset(id) {
		if (!id || !isString(id)) {
			return Promise.reject('Missing or invalid "id" parameter');
		}

		return this.http.post(`/${id}/reset`);
	}

	update(id, data) {
		if (!id || !isString(id)) {
			return Promise.reject('Missing or invalid "id" parameter');
		}

		return this.http.post(`/${id}`, data);
	}
}
