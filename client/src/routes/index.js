import Vue from 'vue';
import VueRouter from 'vue-router';
import store from '@/store/index';

import Game from '@/views/Game.vue';
import Login from '@/views/Login.vue';
import Start from '@/views/Start.vue';

Vue.use(VueRouter);

const router = new VueRouter({
	routes: [
		{
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
			path: '/game/:id',
			name: 'game',
			component: Game,
			props: true,
		},
	],
});

router.beforeEach((to, from, next) => {
	Vue.$log.debug('router.beforeEach', store, to, from);

	store
		.dispatch('checkLogin')
		.then(pl => {
			pl.isCurrent = true;
			store.dispatch('players/update', pl);

			if (to.path === '/login') {
				next('/');
			} else {
				next();
			}
		})
		.catch(err => {
			Vue.$log.warn(err);

			if (to.path !== '/login') {
				next('/login');
			} else {
				next();
			}
		});
});

export default router;
