import axios from 'axios';

export default class BaseApi {
	constructor(path) {
		this.host = `${process.env.VUE_APP_SERVER}`;
		this.path = path;
		this.url = `//${this.host}/api/${path}/`;

		this.http = axios.create({
			baseURL: this.url,
			timeout: 2000,
			withCredentials: true,
		});
	}

	create(data) {
		return this.http.post('/', data);
	}

	delete(id) {
		return this.http.delete(`/${id}`);
	}

	get(query = '') {
		return this.http.get(`/${query}`);
	}

	update(id, data) {
		return this.http.post(`/${id}`, data);
	}
}
