<template>
  <div class="card">
    <div class="space-between">
      <h3>Incoming Requests</h3>
      <button @click="refresh" :disabled="loading">Refresh</button>
    </div>
    <ul class="list" v-if="requests.length">
      <li v-for="req in requests" :key="req.id" class="space-between">
        <div>
          <div><strong>{{ req.from_user?.username || req.from_username }}</strong></div>
          <div class="muted">{{ req.from_user_id ? 'ID: ' + req.from_user_id : '' }}</div>
        </div>
        <div class="flex">
          <button @click="accept(req.id)" :disabled="loading">Accept</button>
          <button @click="reject(req.id)" :disabled="loading" style="background:#ef4444;">Reject</button>
        </div>
      </li>
    </ul>
    <p v-else class="muted">No incoming requests.</p>
  </div>
</template>

<script setup>
import { computed, onMounted } from 'vue';
import { useUserStore } from '../stores/user.js';

const userStore = useUserStore();
const requests = computed(() => userStore.incomingRequests);
const loading = computed(() => userStore.loading);

const refresh = async () => {
  await userStore.refreshRequests();
};

const accept = async (id) => {
  await userStore.acceptRequest(id);
};

const reject = async (id) => {
  await userStore.rejectRequest(id);
};

onMounted(() => {
  refresh();
});
</script>

<style scoped>
.muted {
  color: #6b7280;
}
</style>
