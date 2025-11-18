<template>
  <div class="flex" style="gap:1rem; align-items:flex-start;">
    <div class="card" style="flex:2;">
      <div class="space-between">
        <h2>Profile</h2>
        <button @click="refresh" :disabled="loading">Refresh</button>
      </div>
      <p><strong>Username:</strong> {{ profile?.username }}</p>
      <p><strong>User ID:</strong> {{ profile?.id }}</p>
      <p><strong>Friends:</strong> {{ profile?.friends?.length || 0 }}</p>
      <p><strong>Incoming Requests:</strong> {{ profile?.incoming_requests?.length || 0 }}</p>
    </div>
    <div class="card" style="flex:1;">
      <FriendRequests />
    </div>
  </div>
</template>

<script setup>
import { onMounted, computed } from 'vue';
import { useUserStore } from '../stores/user.js';
import FriendRequests from '../components/FriendRequests.vue';

const userStore = useUserStore();
const profile = computed(() => userStore.profile);
const loading = computed(() => userStore.loading);

const refresh = async () => {
  await userStore.loadProfile();
};

onMounted(() => {
  refresh();
});
</script>