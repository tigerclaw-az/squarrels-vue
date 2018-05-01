// import 'bootstrap/dist/css/bootstrap.min.css';
// import 'bootstrap-vue/dist/bootstrap-vue.css';
// require('vue-toastr/src/vue-toastr.scss');

import BootstrapVue from 'bootstrap-vue';
import 'vue-awesome/icons';
import { Layout } from 'bootstrap-vue/es/components';
import Toastr from 'vue-toastr';

import Vue from 'vue';
import VueLogger from 'vuejs-logger';
import Storage from 'vue-web-storage';
import VueWS from 'vue-native-websocket';
import App from './App.vue';

import router from './router';
import store from './store/index';

import { config, websocket as wsConfig, webStorage as storageConfig, logger as loggerConfig } from './config';

Vue.use(BootstrapVue);
Vue.use(Layout);
// Vue.use(Toastr);

Vue.use(Storage, storageConfig);
Vue.use(VueLogger, loggerConfig);
Vue.use(VueWS, `ws://${process.env.VUE_APP_SERVER}`, Object.assign({}, wsConfig, { store }));

Vue.config.productionTip = false;
Vue.prototype.$toastr = Toastr;

Vue.filter('limit', function (value, amount) {
	return value.filter(function(val, index){
		return index < amount;
	});
});

const vm = new Vue({
	mounted: function() {
		this.$log.debug(this);
		store.dispatch('init');
	},
	components: {
		'vue-toastr': Toastr,
	},
	...App,
	router,
	store,
}).$mount('#app');

window.onbeforeunload = function() {
	vm.$disconnect();
};
