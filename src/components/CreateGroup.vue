<template>
  <section class="card">
    <header>
      <h3>Создать группу</h3>
    </header>
    <form @submit.prevent="handleSubmit" class="stack">
      <input v-model="name" type="text" placeholder="Название группы" required />
      <div class="friends-list">
        <label v-for="friend in friends" :key="friend.id" class="friend-row">
          <input
              type="checkbox"
              :value="friend.id"
              v-model="selectedMembers"
          />
          <span>{{ friend.username }}</span>
        </label>
        <p v-if="!friends.length" class="empty">Нет друзей для добавления</p>
      </div>
      <button type="submit" :disabled="!name.trim()">Создать группу</button>
    </form>
  </section>
</template>

<script setup>
import { ref } from 'vue';

const props = defineProps({
  friends: { type: Array, default: () => [] },
});

const emit = defineEmits(['submit']);

const name = ref('');
const selectedMembers = ref([]);

const handleSubmit = () => {
  const memberIds = selectedMembers.value.map((id) => Number(id)).filter(Boolean);
  emit('submit', { name: name.value.trim(), member_ids: memberIds });
  name.value = '';
  selectedMembers.value = [];
};
</script>

<style scoped>
.card {
  padding: 1rem 1.1rem;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.stack {
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
}

input[type='text'] {
  border-radius: 10px;
  border: 1px solid var(--border);
  padding: 0.75rem 0.9rem;
  background: var(--input-bg);
}

.friends-list {
  max-height: 180px;
  overflow-y: auto;
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 0.5rem 0.75rem;
  background: var(--surface);
}

.friend-row {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.25rem 0;
}

.empty {
  color: var(--muted);
  text-align: center;
  margin: 0.5rem 0 0;
}

button {
  border: none;
  background: linear-gradient(135deg, var(--primary), var(--primary-strong));
  color: #fff;
  border-radius: 10px;
  padding: 0.7rem 1rem;
  font-weight: 700;
  box-shadow: 0 10px 24px rgba(59, 130, 246, 0.3);
}

button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
</style>