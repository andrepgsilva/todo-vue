import App from './App';
import Register from './components/auth/Register';
import Login from './components/auth/Login';
import Logout from './components/auth/Logout';
import LandingPage from './components/marketing/Landing';
import About from './components/marketing/About';
import TestTodosVariable from './components/marketing/TestTodosVariable';

const routes = [
    {
      path: '/',
      name: 'home',
      component: LandingPage,
    },
    {
      path: '/todo',
      name: 'todo',
      component: App,
      meta: {
        requiresAuth: true,
      },
    },
    {
      path: '/about',
      name: 'about',
      component: About,
    },
    {
      path: '/login',
      name: 'login',
      component: Login,
      props: true,
      meta: {
        requiresVisitor: true,
      },
    },
    {
      path: '/logout',
      name: 'logout',
      component: Logout,
    },
    {
      path: '/register',
      name: 'register',
      component: Register,
      meta: {
        requiresVisitor: true,
      },
    },

    {
      path: '/todos/:id',
      name: 'todos',
      component: TestTodosVariable
    },
];

export default routes;