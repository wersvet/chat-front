<template>
  <div class="messages">
    <div v-for="msg in messages" :key="msg.id || msg.created_at" :class="['message', isSelf(msg) ? 'self' : '']">
      <div class="meta">{{ msg.sender?.username || msg.username || msg.sender_id }}</div>
      <div>{{ msg.content }}</div>
    </div>
    <p v-if="!messages.length" class="muted">No messages yet.</p>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { useAuthStore } from '../stores/auth.js';

const props = defineProps({
  messages: {
    type: Array,
    default: () => []
  }
});

const auth = useAuthStore();
const userId = computed(() => auth.user?.id);

const isSelf = (msg) => msg.sender_id === userId.value || msg.sender?.id === userId.value;
</script>

<style scoped>
.muted {
  color: #6b7280;
  margin: auto;
}
</style>