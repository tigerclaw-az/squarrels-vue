import Vue from 'vue';
import Router from 'vue-router';

import Game from '@/views/Game.vue';
import Start from '@/views/Start.vue';

Vue.use(Router);

export default new Router({
	routes: [{
		path: '/',
		name: 'start',
		component: Start,
	}, {
		path: '/game',
		name: 'game',
		component: Game,
	}],
});
