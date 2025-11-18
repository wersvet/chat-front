<template>
  <div class="card" style="max-width: 420px; margin: 0 auto;">
    <h2>Register</h2>
    <form @submit.prevent="handleSubmit">
      <label>Username</label>
      <input v-model="username" required placeholder="Username" />

      <label>Password</label>
      <input v-model="password" type="password" required placeholder="Password" />

      <div class="form-actions">
        <button type="submit" :disabled="loading">{{ loading ? 'Creating account...' : 'Register' }}</button>
      </div>
      <p v-if="success" class="alert" style="background:#ecfdf3;border-color:#a7f3d0;color:#065f46;">{{ success }}</p>
      <p v-if="error" class="alert" style="margin-top: 0.8rem;">{{ error }}</p>
    </form>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useAuthStore } from '../stores/auth.js';
import { useRouter } from 'vue-router';

const auth = useAuthStore();
const router = useRouter();
const username = ref('');
const password = ref('');
const loading = ref(false);
const error = ref(null);
const success = ref('');

const handleSubmit = async () => {
  loading.value = true;
  error.value = null;
  success.value = '';
  try {
    await auth.register({ username: username.value, password: password.value });
    success.value = 'Registration successful. You can login now.';
    setTimeout(() => router.push('/login'), 800);
  } catch (err) {
    error.value = auth.error || 'Registration failed';
  } finally {
    loading.value = false;
  }
};
</script>