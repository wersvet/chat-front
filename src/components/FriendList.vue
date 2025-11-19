<template>
  <section class="card">
    <header>
      <h3>Друзья ({{ friends.length }})</h3>
    </header>
    <ul>
      <li v-for="friend in friends" :key="friend.id">
        <span>{{ friend.username }}</span>
        <slot name="actions" :friend="friend"></slot>
      </li>
    </ul>
    <p v-if="!friends.length" class="card__empty">No friends yet. Send a request!</p>
  </section>
</template>

<script setup>
const props = defineProps({
  friends: { type: Array, default: () => [] },
});
</script>

<style scoped>
.card {
  background: rgba(255, 255, 255, 0.95);
  border-radius: 18px;
  padding: 1rem 1.25rem;
  border: 1px solid var(--border-color);
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.card header h3 {
  margin: 0;
  font-size: 1rem;
}

.card ul {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}

.card li {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.4rem 0;
  border-bottom: 1px dashed rgba(0, 0, 0, 0.08);
}

.card li:last-child {
  border-bottom: none;
}

.card__empty {
  text-align: center;
  color: var(--muted);
  margin: 0;
}
</style>