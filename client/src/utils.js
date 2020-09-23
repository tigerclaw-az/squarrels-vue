import { times } from 'lodash';

export const decode = function(str) {
	return window.atob(str);
};

export const encode = function(str) {
	return window.btoa(str);
};

export const getRandom = function(from, to) {
	return Math.random() * (to - from) + from;
};

export const getRandomStr = function(num) {
	return times(num, () => {
		return String.fromCharCode(getRandom(96, 122));
	})
		.join('')
		.replace(/`/g, ' ');
};
