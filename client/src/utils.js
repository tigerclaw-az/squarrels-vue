import { times } from 'lodash';

export default {
	decode(str) {
		return window.atob(str);
	},

	encode(str) {
		return window.btoa(str);
	},

	getRandom(from, to) {
		return Math.random() * (to - from) + from;
	},

	getRandomStr(num) {
		return times(num, () => {
			return String.fromCharCode(this.getRandom(96, 122));
		})
			.join('')
			.replace(/`/g, ' ');
	},

	getUuid(isShort = false) {
		let uuid = 'xxxxxxxx-xxxx-4xxx';

		if (!isShort) {
			uuid += '-yxxx-xxxxxxxxxxxx';
		}

		return uuid.replace(/[xy]/g, function(c) {
			const r = (Math.random() * 16) | 0,
				v = c === 'x' ? r : (r & 0x3) | 0x8;

			return v.toString(16);
		});
	},
};
