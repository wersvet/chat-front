<template>
  <section class="card">
    <header>
      <h3>Добавить друга</h3>
    </header>
    <form @submit.prevent="handleSubmit" class="stack">
      <input
          v-model="friendId"
          type="number"
          min="1"
          placeholder="введите id друга"
          required
      />
      <button class="primary" type="submit">Отправить запрос</button>
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
  padding: 0.9rem 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.55rem;
}

.stack {
  display: flex;
  flex-direction: column;
  gap: 0.55rem;
}

input {
  border-radius: 10px;
  border: 1px solid var(--border);
  padding: 0.65rem 0.85rem;
  background: var(--input-bg);
}

button.primary {
  border: none;
  background: linear-gradient(135deg, var(--primary), var(--primary-strong));
  color: #fff;
  border-radius: 10px;
  padding: 0.65rem 0.95rem;
  font-weight: 700;
  box-shadow: 0 10px 24px rgba(59, 130, 246, 0.3);
}
</style>