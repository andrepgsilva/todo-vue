import Vue from 'vue';
import VueRouter from 'vue-router';
import routes from './routes';
import Master from './components/layouts/Master'
import { store } from './store/store';

window.eventBus = new Vue();

Vue.config.productionTip = false;

Vue.use(VueRouter);

const router = new VueRouter({
  routes: routes,
  mode: 'history',
});

router.beforeEach((to, from, next) => {
  if (to.matched.some(record => record.meta.requiresAuth)) {
    if (! store.getters.loggedIn) {
      next({
        name: 'login',
      });
    } else {
      next();
    }
  } else if (to.matched.some(record => record.meta.requiresVisitor)) {
    if (store.getters.loggedIn) {
      next({
        name: 'todo',
      });
    } else {
      next();
    }
  } else {
    next();
  }
});

new Vue({
  store: store,
  router: router,
  render: h => h(Master),
}).$mount('#app')