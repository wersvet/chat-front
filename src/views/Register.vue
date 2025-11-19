<template>
  <div class="auth-layout">
    <section class="auth-panel">
      <h1>Create account</h1>
      <p>Join the conversation in seconds.</p>
      <form class="auth-form" @submit.prevent="handleRegister">
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
          {{ authStore.loading ? 'Creating account…' : 'Register' }}
        </button>
      </form>
      <p class="auth-switch">
        Already have an account?
        <router-link to="/login">Sign in</router-link>
      </p>
    </section>
  </div>
</template>

<script setup>
import { reactive, ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../stores/auth';

const router = useRouter();
const authStore = useAuthStore();
const form = reactive({ username: '', password: '' });
const error = ref('');

const handleRegister = async () => {
  error.value = '';
  try {
    await authStore.register(form);
    router.push('/chat');
  } catch (err) {
    error.value = err?.response?.data?.message || 'Unable to register';
  }
};
</script>

<style scoped src="./auth.css"></style>