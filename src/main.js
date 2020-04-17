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

new Vue({
  store: store,
  router: router,
  render: h => h(Master),
}).$mount('#app')