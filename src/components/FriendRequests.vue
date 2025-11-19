<template>
  <section class="card">
    <header>
      <h3>Входящие запросы ({{ requests.length }})</h3>
    </header>
    <ul>
      <li v-for="request in requests" :key="request.id">
        <div>
          <strong>#{{ request.id }}</strong>
          <p>User ID {{ request.from_user_id }}</p>
        </div>
        <div class="card__actions">
          <button @click="emit('accept', request.id)">Принять</button>
          <button class="danger" @click="emit('reject', request.id)">Отклонить</button>
        </div>
      </li>
    </ul>
    <p v-if="!requests.length" class="card__empty">Нет входящих запросов</p>
  </section>
</template>

<script setup>
const props = defineProps({
  requests: { type: Array, default: () => [] },
});

const emit = defineEmits(['accept', 'reject']);
</script>

<style scoped>
.card {
  background: rgba(255, 255, 255, 0.95);
  border-radius: 18px;
  padding: 1rem 1.25rem;
  border: 1px solid var(--border-color);
}

.card ul {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 0.65rem;
}

.card li {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 0.75rem;
  border-bottom: 1px dashed rgba(0, 0, 0, 0.08);
  padding-bottom: 0.55rem;
}

.card li:last-child {
  border-bottom: none;
}

.card__actions {
  display: flex;
  gap: 0.35rem;
}

.card__actions button {
  border-radius: 999px;
  padding: 0.35rem 0.9rem;
  border: 1px solid var(--border-color);
  background: transparent;
}

.card__actions .danger {
  border-color: #f56565;
  color: #c53030;
}

.card__empty {
  text-align: center;
  color: var(--muted);
}
</style>
