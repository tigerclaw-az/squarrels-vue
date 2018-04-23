import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-vue/dist/bootstrap-vue.css';

import BootstrapVue from 'bootstrap-vue';
import { Layout } from 'bootstrap-vue/es/components';

import Vue from 'vue';
import VueLogger from 'vuejs-logger';
import VueLocalStorage from 'vue-localstorage';
import VueWS from 'vue-native-websocket';
import App from './App.vue';

import router from './router';
import store from './store/index';

import { config, websocket as wsConfig, localStorage as storageConfig, logger as loggerConfig } from './config';

Vue.use(BootstrapVue);
Vue.use(Layout);

Vue.use(VueLocalStorage, storageConfig);
Vue.use(VueLogger, loggerConfig);
Vue.use(VueWS, `ws://${config.host}:3000`, Object.assign({}, wsConfig, { store }));

Vue.config.productionTip = false;

new Vue({
	...App,
	router,
	store,
}).$mount('#app');
