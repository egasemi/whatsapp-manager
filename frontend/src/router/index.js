import { createRouter, createWebHistory } from 'vue-router';
import Login from '../pages/Login.vue';
import Dashboard from '../pages/Dashboard.vue';
import axios from '../api/axios'

const routes = [
  { path: '/', redirect: '/login' },
  { path: '/login', component: Login },
  { 
    path: '/dashboard', 
    component: Dashboard,
    meta: {
      requiresAuth: true
    } 
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach(async (to, _from, next) => {
  const token = localStorage.getItem('token');
  if(to.meta.requiresAuth) {
    if(!token) {
      return next('/login')
    }

    try {
      const res = await axios.get('/auth/verify')
      if(res.data.valid) {
        return next()
      }
    } catch (error) {
      console.warn('Token inválido o expirado')
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      return next('/login')
    }
  }

  next()
})

export default router;
