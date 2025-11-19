<template>
  <div class="auth-layout">
    <section class="auth-panel">
      <h1>Welcome back</h1>
      <p>Sign in to continue messaging.</p>
      <form class="auth-form" @submit.prevent="handleLogin">
        <label>
          Username
          <input v-model="form.username" type="text" required />
        </label>
        <label>
          Password
          <input v-model="form.password" type="password" required />
        </label>
        <p class="auth-error" v-if="error">{{ error }}</p>
        <button class="primary" type="submit" :disabled="authStore.loading">
          {{ authStore.loading ? 'Signing in…' : 'Sign in' }}
        </button>
      </form>
      <p class="auth-switch">
        Need an account?
        <router-link to="/register">Create one</router-link>
      </p>
    </section>
  </div>
</template>

<script setup>
import { reactive, ref } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useAuthStore } from '../stores/auth';

const router = useRouter();
const route = useRoute();
const authStore = useAuthStore();

const form = reactive({ username: '', password: '' });
const error = ref('');

const handleLogin = async () => {
  error.value = '';
  try {
    await authStore.login(form);
    router.push(route.query.redirect || '/chat');
  } catch (err) {
    error.value = err?.response?.data?.message || 'Unable to login';
  }
};
</script>

<style scoped src="./auth.css"></style>