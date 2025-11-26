<template>
  <section class="card">
    <header>
      <h3>Add friend</h3>
    </header>
    <form @submit.prevent="handleSubmit" class="stack">
      <input
          v-model="friendId"
          type="number"
          min="1"
          placeholder="Enter user ID"
          required
      />
      <button class="primary" type="submit">Send request</button>
    </form>
  </section>
</template>

<script setup>
import { ref } from 'vue';

const emit = defineEmits(['submit']);
const friendId = ref('');

const handleSubmit = () => {
  if (!friendId.value) return;
  emit('submit', friendId.value);
  friendId.value = '';
};
</script>

<style scoped>
.card {
  background: rgba(255, 255, 255, 0.95);
  border-radius: 18px;
  padding: 1rem 1.25rem;
  border: 1px solid var(--border-color);
}

.stack {
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
}

input {
  border-radius: 0.9rem;
  border: 1px solid var(--border-color);
  padding: 0.65rem 0.85rem;
}

button.primary {
  border: none;
  background: var(--primary);
  color: #fff;
  border-radius: 999px;
  padding: 0.55rem 1rem;
  font-weight: 600;
}
</style>