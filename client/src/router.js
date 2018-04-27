import Vue from 'vue';
import VueRouter from 'vue-router';
import store from '@/store/index';

import Game from '@/views/Game.vue';
import Login from '@/views/Login.vue';
import Start from '@/views/Start.vue';

Vue.use(VueRouter);

let router = new VueRouter({
	routes: [{
		path: '/',
		name: 'start',
		component: Start,
	},
	{
		path: '/login',
		name: 'login',
		component: Login,
	},
	{
		path: '/game',
		name: 'game',
		component: Game,
	}],
});

router.beforeEach((to, from, next) => {
	Vue.$log.debug(Vue, store, to, from);

	store.dispatch('checkLogin')
		.then(() => {
			if (to.path === '/login') {
				next('/');
			} else {
				next();
			}
		})
		.catch(err => {
			Vue.$log.error(err);
			if (to.path !== '/login') {
				next('/login');
			} else {
				next();
			}
		});
});

export default router;
