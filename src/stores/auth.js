import { defineStore } from 'pinia';
import { login as loginApi, register as registerApi, validateToken } from '../api/auth';
import { useUserStore } from './user';
import { useChatStore } from './chat';

export const useAuthStore = defineStore('auth', {
  state: () => ({
    token: null,
    user: null,
    loading: false,
    initialized: false,
  }),
  getters: {
    isAuthenticated: (state) => Boolean(state.token),
  },
  actions: {
    async initialize() {
      if (this.initialized) return;
      this.initialized = true;
      const token = localStorage.getItem('token');
      if (token) {
        this.token = token;
        try {
          await this.refreshUser();
        } catch (error) {
          this.logout();
        }
      }
    },
    async login(credentials) {
      this.loading = true;
      try {
        const { data } = await loginApi(credentials);
        this.setSession(data.token, data.user);
        await useUserStore().bootstrap();
        return data;
      } finally {
        this.loading = false;
      }
    },
    async register(payload) {
      this.loading = true;
      try {
        await registerApi(payload);
        await this.login(payload);
      } finally {
        this.loading = false;
      }
    },
    async refreshUser() {
      const { data } = await validateToken();
      this.user = data.user || data;
      return this.user;
    },
    setSession(token, user) {
      this.token = token;
      this.user = user;
      localStorage.setItem('token', token);
    },
    logout() {
      this.token = null;
      this.user = null;
      localStorage.removeItem('token');
      useChatStore().reset();
      useUserStore().reset();
    },
  },
});