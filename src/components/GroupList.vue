<template>
  <div class="card">
    <h3>Join Group by ID</h3>
    <div class="flex" style="align-items: flex-end;">
      <div style="flex:1;">
        <label>Group ID</label>
        <input v-model="groupId" placeholder="Enter group id" />
      </div>
      <button @click="load" :disabled="!groupId">Load</button>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useChatStore } from '../stores/chat.js';

const chatStore = useChatStore();
const groupId = ref('');

const load = async () => {
  await chatStore.loadGroupMessages(groupId.value);
  chatStore.connectGroupSocket();
};
</script>