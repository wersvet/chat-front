<template>
  <div class="card">
    <h3>Create Group</h3>
    <form @submit.prevent="create">
      <label>Group Name</label>
      <input v-model="name" placeholder="e.g. Project Team" required />

      <label>Member IDs (comma separated)</label>
      <input v-model="memberIds" placeholder="1,2,3" />

      <div class="form-actions">
        <button type="submit">Create</button>
      </div>
    </form>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useChatStore } from '../stores/chat.js';

const chatStore = useChatStore();
const name = ref('');
const memberIds = ref('');

const create = async () => {
  const member_ids = memberIds.value
    .split(',')
    .map((id) => id.trim())
    .filter(Boolean);
  await chatStore.createGroup({ name: name.value, member_ids });
};
</script>