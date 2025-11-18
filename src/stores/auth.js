import { defineStore } from 'pinia';
import { login as apiLogin, register as apiRegister, validate, setAuthToken } from '../api/auth.js';

export const useAuthStore = defineStore('auth', {
  state: () => ({
    token: null,
    user: null,
    initialized: false,
    loading: false,
    error: null
  }),
  getters: {
    isAuthenticated: (state) => !!state.token
  },
  actions: {
    async initializeFromStorage() {
      const storedToken = localStorage.getItem('token');
      if (storedToken) {
        this.token = storedToken;
        setAuthToken(storedToken);
        try {
          await this.validateToken();
        } catch (err) {
          this.logout();
        }
      }
      this.initialized = true;
    },
    async register(payload) {
      this.loading = true;
      this.error = null;
      try {
        await apiRegister(payload);
      } catch (err) {
        this.error = err.response?.data?.message || 'Registration failed';
        throw err;
      } finally {
        this.loading = false;
      }
    },
    async login(payload) {
      this.loading = true;
      this.error = null;
      try {
        const { data } = await apiLogin(payload);
        this.token = data.token;
        this.user = data.user;
        localStorage.setItem('token', data.token);
        setAuthToken(data.token);
      } catch (err) {
        this.error = err.response?.data?.message || 'Login failed';
        throw err;
      } finally {
        this.loading = false;
      }
    },
    async validateToken() {
      if (!this.token) return;
      const { data } = await validate();
      this.user = data.user || data;
      return data;
    },
    logout() {
      this.token = null;
      this.user = null;
      localStorage.removeItem('token');
      setAuthToken(null);
    }
  }
});