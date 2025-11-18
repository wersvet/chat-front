<template>
  <div class="card" style="max-width: 420px; margin: 0 auto;">
    <h2>Login</h2>
    <form @submit.prevent="handleSubmit">
      <label>Username</label>
      <input v-model="username" required placeholder="Username" />

      <label>Password</label>
      <input v-model="password" type="password" required placeholder="Password" />

      <div class="form-actions">
        <button type="submit" :disabled="loading">{{ loading ? 'Signing in...' : 'Login' }}</button>
      </div>
      <p v-if="error" class="alert" style="margin-top: 0.8rem;">{{ error }}</p>
    </form>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useAuthStore } from '../stores/auth.js';
import { useRouter } from 'vue-router';

const router = useRouter();
const auth = useAuthStore();
const username = ref('');
const password = ref('');
const loading = ref(false);
const error = ref(null);

const handleSubmit = async () => {
  loading.value = true;
  error.value = null;
  try {
    await auth.login({ username: username.value, password: password.value });
    await auth.validateToken();
    router.push('/profile');
  } catch (err) {
    error.value = auth.error || 'Login failed';
  } finally {
    loading.value = false;
  }
};
</script>