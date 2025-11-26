<template>
  <article class="chat-item" :class="{ 'chat-item--active': active }" @click="emit('select')">
    <div class="chat-item__avatar">{{ initials }}</div>
    <div class="chat-item__content">
      <header>
        <div class="chat-item__title">
          <h3>{{ displayName }}</h3>
          <span v-if="chat.type === 'group'" class="badge">Group</span>
        </div>
        <small>{{ lastMessageTime }}</small>
      </header>
      <p class="chat-item__preview">{{ lastMessagePreview }}</p>
    </div>
  </article>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  chat: { type: Object, required: true },
  active: { type: Boolean, default: false },
});

const emit = defineEmits(['select']);

const displayName = computed(() => props.chat.name || props.chat.friend?.username || 'Unknown');

const initials = computed(() => displayName.value?.slice(0, 2)?.toUpperCase() || '??');

const lastMessagePreview = computed(() => {
  const content = props.chat.last_message?.content;
  if (!content) return 'No messages yet';
  return content.length > 32 ? `${content.slice(0, 32)}…` : content;
});

const lastMessageTime = computed(() => {
  const timestamp = props.chat.last_message?.created_at;
  if (!timestamp) return '';
  return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
});
</script>

<style scoped>
.chat-item {
  display: flex;
  gap: 0.85rem;
  padding: 0.85rem 1.1rem;
  border-radius: 1rem;
  transition: background 0.15s ease;
  cursor: pointer;
  border: 1px solid transparent;
}

.chat-item:hover {
  background: rgba(0, 0, 0, 0.04);
}

.chat-item--active {
  background: rgba(0, 107, 255, 0.1);
  border-color: rgba(0, 107, 255, 0.25);
}

.chat-item__avatar {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: linear-gradient(135deg, #5c6bc0, #42a5f5);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
}

.chat-item__content {
  flex: 1;
}

.chat-item__title {
  display: flex;
  align-items: center;
  gap: 0.4rem;
}

.chat-item__content header {
  display: flex;
  justify-content: space-between;
  font-size: 0.85rem;
  color: var(--muted);
}

.chat-item__content h3 {
  margin: 0;
  font-size: 0.95rem;
  color: #1f2d3d;
}

.badge {
  background: rgba(0, 107, 255, 0.15);
  color: #0b4dc2;
  padding: 0.15rem 0.5rem;
  border-radius: 8px;
  font-size: 0.7rem;
  font-weight: 600;
}

.chat-item__preview {
  margin: 0.15rem 0 0;
  color: #4a5568;
  font-size: 0.9rem;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>