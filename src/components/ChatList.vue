<template>
  <div class="chat-list">
    <div class="chat-list__header">
      <h2>Чаты</h2>
      <span class="chat-list__counter">{{ chats.length }}</span>
    </div>
    <div class="chat-list__search">
      <input
        v-model="localSearch"
        type="text"
        placeholder="Поиск по имени пользователя"
      />
    </div>
    <div class="chat-list__body" v-if="!loading">
      <ChatItem
        v-for="chat in filteredChats"
        :key="chat.id"
        :chat="chat"
        :active="chat.id === selectedId"
        @select="emit('select', chat.id)"
      />
      <p v-if="!filteredChats.length" class="chat-list__empty">
        Чат не найден. Начать новый диалог
      </p>
    </div>
    <div v-else class="chat-list__loading">Loading chats...</div>
  </div>
</template>

<script setup>
import { computed, ref, watch } from 'vue';
import ChatItem from './ChatItem.vue';

const props = defineProps({
  chats: { type: Array, default: () => [] },
  selectedId: { type: [Number, String], default: null },
  search: { type: String, default: '' },
  loading: { type: Boolean, default: false },
});

const emit = defineEmits(['update:search', 'select']);

const localSearch = ref(props.search);

watch(
  () => props.search,
  (value) => {
    if (value !== localSearch.value) {
      localSearch.value = value;
    }
  },
);

watch(localSearch, (value) => emit('update:search', value));

const filteredChats = computed(() => {
  if (!localSearch.value) {
    return props.chats;
  }
  const term = localSearch.value.toLowerCase();
  return props.chats.filter((chat) => chat.friend?.username?.toLowerCase().includes(term));
});
</script>

<style scoped>
.chat-list {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.chat-list__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 1.25rem 0.5rem;
}

.chat-list__header h2 {
  margin: 0;
  font-size: 1.1rem;
}

.chat-list__counter {
  background: var(--primary);
  color: #fff;
  border-radius: 999px;
  padding: 0.15rem 0.6rem;
  font-size: 0.85rem;
}

.chat-list__search {
  padding: 0 1.25rem 0.75rem;
}

.chat-list__search input {
  width: 100%;
  border-radius: 0.65rem;
  border: 1px solid var(--border-color);
  padding: 0.6rem 0.9rem;
  background: rgba(255, 255, 255, 0.8);
}

.chat-list__body {
  overflow-y: auto;
  flex: 1;
  padding: 0 0.4rem 0.75rem;
}

.chat-list__empty {
  text-align: center;
  color: var(--muted);
  padding: 1rem;
}

.chat-list__loading {
  padding: 1rem;
  text-align: center;
  color: var(--muted);
}
</style>