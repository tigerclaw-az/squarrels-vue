// import 'bootstrap/dist/css/bootstrap.min.css';
// import 'bootstrap-vue/dist/bootstrap-vue.css';
// require('vue-toastr/src/vue-toastr.scss');

import BootstrapVue from 'bootstrap-vue';
import { LayoutPlugin } from 'bootstrap-vue';
import 'vue-awesome/icons';

import Toasted from 'vue-toasted';

import Vue from 'vue';
import VueLogger from 'vuejs-logger';
// import Storage from 'vue-web-storage';
import localForage from 'localforage';
import VueWS from 'vue-native-websocket';
import App from '@/App.vue';

import router from '@/routes';
import store from '@/store/index';

import {
	toast as toastConfig,
	websocket as wsConfig,
	// webStorage as storageConfig,
	logger as loggerConfig,
} from './config';

Vue.use(BootstrapVue);
Vue.use(LayoutPlugin);

Vue.use(Toasted, {
	router,
	...toastConfig,
});

Vue.use(VueLogger, loggerConfig);
Vue.use(VueWS, `ws://${process.env.VUE_APP_SERVER}`, {
	...wsConfig,
	store,
});

const storageConfig = Object.freeze({
	driver: localForage.INDEXEDDB,
	name: process.env.VUE_APP_NAME || 'squarrels',
	version: process.env.VUE_APP_VERSION || 1.0,
});

// Vue.use(Storage, storageConfig);

Vue.config.productionTip = false;

Vue.$storage = localForage;
Vue.$storage.config(storageConfig);
Vue.prototype.$timeout = window.setTimeout;
Vue.prototype.$timer = window.setInterval;

Vue.filter('limit', function(value, amount) {
	return value.filter(function(val, index) {
		return index < amount;
	});
});

const app = new Vue({
	components: {},
	mounted: function() {
		this.$log.debug(this);
		store.dispatch('init');
	},
	...App,
	router,
	store,
}).$mount('#app');

window.sqVue = app;

window.onbeforeunload = function() {
	// Only need this if we are using connectManually option
	// app.$disconnect();
	app.$store.dispatch('game/unload');
};
