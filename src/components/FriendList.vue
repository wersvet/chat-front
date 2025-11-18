<template>
  <div class="card">
    <div class="space-between">
      <h3>Your Friends</h3>
      <button @click="reload" :disabled="loading">Refresh</button>
    </div>
    <ul class="list" v-if="friends.length">
      <li v-for="friend in friends" :key="friend.id" class="space-between">
        <div>
          <div><strong>{{ friend.username }}</strong></div>
          <div class="muted">ID: {{ friend.id }}</div>
        </div>
        <div>
          <slot name="actions" :friend="friend"></slot>
        </div>
      </li>
    </ul>
    <p v-else class="muted">No friends yet.</p>
  </div>
</template>

<script setup>
import { computed, onMounted } from 'vue';
import { useUserStore } from '../stores/user.js';

const userStore = useUserStore();
const friends = computed(() => userStore.friends);
const loading = computed(() => userStore.loading);

const reload = async () => {
  await userStore.loadFriends();
};

onMounted(() => {
  reload();
});
</script>

<style scoped>
.muted {
  color: #6b7280;
}
</style>