import { createRouter, createWebHistory } from 'vue-router';
import Login from '../views/Login.vue';
import Register from '../views/Register.vue';
import Chat from '../views/Chat.vue';
import { useAuthStore } from '../stores/auth';

const router = createRouter({
    history: createWebHistory(),
    routes: [
        { path: '/', redirect: '/chat' },
        { path: '/login', name: 'login', component: Login, meta: { guestOnly: true } },
        { path: '/register', name: 'register', component: Register, meta: { guestOnly: true } },
        { path: '/chat', name: 'chat', component: Chat, meta: { requiresAuth: true } },
    ],
});

router.beforeEach(async (to, from, next) => {
    const authStore = useAuthStore();

    if (!authStore.initialized) {
        await authStore.initialize();
    }

    if (to.meta.requiresAuth && !authStore.isAuthenticated) {
        next({ name: 'login', query: { redirect: to.fullPath } });
        return;
    }

    if (to.meta.guestOnly && authStore.isAuthenticated) {
        next({ name: 'chat' });
        return;
    }

    next();
});

export default router;