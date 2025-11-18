import { createRouter, createWebHistory } from 'vue-router';
import { useAuthStore } from '../stores/auth.js';
import Login from '../views/Login.vue';
import Register from '../views/Register.vue';
import Profile from '../views/Profile.vue';
import Friends from '../views/Friends.vue';
import Chat from '../views/Chat.vue';
import GroupChat from '../views/GroupChat.vue';

const routes = [
  { path: '/', redirect: '/profile' },
  { path: '/login', name: 'login', component: Login, meta: { guest: true } },
  { path: '/register', name: 'register', component: Register, meta: { guest: true } },
  { path: '/profile', name: 'profile', component: Profile, meta: { requiresAuth: true } },
  { path: '/friends', name: 'friends', component: Friends, meta: { requiresAuth: true } },
  { path: '/chat', name: 'chat', component: Chat, meta: { requiresAuth: true } },
  { path: '/groups', name: 'groups', component: GroupChat, meta: { requiresAuth: true } }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore();
  if (!authStore.initialized) {
    await authStore.initializeFromStorage();
  }

  if (to.meta.requiresAuth) {
    if (!authStore.token) {
      return next({ name: 'login' });
    }
    try {
      await authStore.validateToken();
      return next();
    } catch (err) {
      authStore.logout();
      return next({ name: 'login' });
    }
  }

  if (to.meta.guest && authStore.isAuthenticated) {
    return next({ name: 'profile' });
  }

  return next();
});

export default router;