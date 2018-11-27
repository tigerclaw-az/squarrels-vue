const requireModule = require.context('.', false, /\.js$/);
const modules = {};

requireModule.keys().forEach(fileName => {
	// Don't register this file as a Vuex module
	if (fileName === './index.js') {
		return;
	}

	const moduleName = fileName.replace(/(\.\/|\.js)/g, '');

	modules[moduleName] = {
		namespaced: moduleName === 'websocket' ? false : true,
		...requireModule(fileName).default,
	};
});

export default modules;
