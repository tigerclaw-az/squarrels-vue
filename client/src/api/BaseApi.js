import axios from 'axios';

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
	}

	create(data) {
		return this.http.post('/', data);
	}

	delete(id) {
		if (!id) {
			return Promise.reject('Missing "id" parameter');
		}

		return this.http.delete(`/${id}`);
	}

	get(query = '') {
		return this.http.get(`/${query}`);
	}

	reset(id) {
		if (!id) {
			return Promise.reject('Missing "id" parameter');
		}

		return this.http.post(`/${id}/reset`);
	}

	update(id, data) {
		if (!id) {
			return Promise.reject('Missing "id" parameter');
		}

		return this.http.post(`/${id}`, data);
	}
}
