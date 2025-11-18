<template>
  <div class="card">
    <h3>Find user by ID</h3>
    <div class="flex" style="align-items: flex-end;">
      <div style="flex:1;">
        <label>User ID</label>
        <input v-model="searchId" placeholder="Enter user id" />
      </div>
      <button @click="search" :disabled="loading">Search</button>
    </div>
    <p v-if="error" class="alert" style="margin-top:0.75rem;">{{ error }}</p>
    <div v-if="result" class="card" style="margin-top:0.75rem; background:#f9fafb;">
      <div class="space-between">
        <div>
          <div><strong>ID:</strong> {{ result.id }}</div>
          <div><strong>Username:</strong> {{ result.username }}</div>
        </div>
        <button @click="sendRequest" :disabled="requesting">{{ requesting ? 'Sending...' : 'Send Friend Request' }}</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useUserStore } from '../stores/user.js';

const userStore = useUserStore();
const searchId = ref('');
const requesting = ref(false);

const loading = computed(() => userStore.loading);
const result = computed(() => userStore.searchResult);
const error = computed(() => userStore.error);

const search = async () => {
  if (!searchId.value) return;
  await userStore.searchUser(searchId.value);
};

const sendRequest = async () => {
  if (!result.value) return;
  requesting.value = true;
  await userStore.sendRequest(result.value.id);
  requesting.value = false;
  alert('Friend request sent');
};
</script>