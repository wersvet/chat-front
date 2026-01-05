<template>
  <section class="chat-window" v-if="chat">
    <header class="chat-window__header">
      <div>
        <p class="chat-window__eyebrow">{{ type === 'group' ? 'Группа' : 'Личный чат' }}</p>
        <div class="chat-window__title-row">
          <h2>{{ title }}</h2>
          <span class="badge">ID {{ chat.id }}</span>
        </div>
        <p class="chat-window__muted">История сообщений и статус ниже</p>
      </div>
      <button v-if="type === 'private'" class="ghost-btn" @click="emit('hide-chat', chat.id)">Скрыть чат</button>
    </header>

    <div class="chat-window__messages" ref="messagesContainer">
      <MessageBubble
          v-for="message in messages"
          :key="message.id"
          :message="message"
          :is-mine="isMine(message)"
          :show-delete-for-me="type === 'private'"
          @delete-for-me="emit('delete-for-me', message.id)"
          @delete-for-all="emit('delete-for-all', message.id)"
      />
    </div>

    <footer class="chat-window__composer">
      <div class="composer-field">
        <textarea
            v-model="draft"
            placeholder="Сообщение..."
            rows="1"
            @keydown.enter.prevent="handleSend"
        ></textarea>
      </div>
      <button class="primary-btn" :disabled="!draft.trim()" @click="handleSend">Отправить</button>
    </footer>
  </section>
  <section v-else class="chat-window chat-window--placeholder">
    <div>
      <h2>Начните чат</h2>
      <p>Выберите, кому хотели бы написать</p>
    </div>
  </section>
</template>

<script setup>
import { computed, nextTick, onUpdated, ref, watch } from 'vue';
import MessageBubble from './MessageBubble.vue';

const props = defineProps({
  chat: { type: Object, default: null },
  messages: { type: Array, default: () => [] },
  currentUserId: { type: [Number, String], default: null },
  type: { type: String, default: 'private' },
});

const emit = defineEmits(['send', 'delete-for-me', 'delete-for-all', 'hide-chat']);

const draft = ref('');
const messagesContainer = ref(null);
const title = computed(() => props.chat?.name || props.chat?.friend?.username || '');
const normalizedUserId = computed(() =>
    props.currentUserId !== null && props.currentUserId !== undefined
        ? Number(props.currentUserId)
        : null,
);

const handleSend = () => {
  if (!draft.value.trim()) return;
  emit('send', draft.value.trim());
  draft.value = '';
};

const isMine = (message) => {
  const userId = normalizedUserId.value;
  if (userId === null) return false;
  const senderId = message?.sender_id !== undefined && message?.sender_id !== null ? Number(message.sender_id) : null;
  return senderId !== null && senderId === userId;
};

const scrollToBottom = () => {
  nextTick(() => {
    if (messagesContainer.value) {
      messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight;
    }
  });
};

watch(
    () => props.messages.length,
    () => scrollToBottom(),
);

onUpdated(scrollToBottom);
</script>

<style scoped>
.chat-window {
  background: var(--panel);
  border-radius: 24px;
  height: 100%;
  display: flex;
  flex-direction: column;
  border: 1px solid var(--border);
  box-shadow: 0 24px 60px rgba(15, 23, 42, 0.16);
  overflow: hidden;
}

.chat-window--placeholder {
  align-items: center;
  justify-content: center;
  text-align: center;
  color: var(--muted);
  background: var(--panel);
  border-radius: 24px;
  border: 1px dashed var(--border);
  padding: 2.5rem;
}

.chat-window__header {
  padding: 1.25rem 1.5rem 1rem;
  border-bottom: 1px solid var(--border);
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.chat-window__title-row {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.chat-window__header h2 {
  margin: 0;
  font-size: 1.35rem;
}

.chat-window__eyebrow {
  margin: 0 0 0.35rem;
  color: var(--muted);
  letter-spacing: 0.08em;
  text-transform: uppercase;
  font-size: 0.78rem;
}

.chat-window__muted {
  margin: 0.35rem 0 0;
  color: var(--muted);
  font-size: 0.92rem;
}

.chat-window__messages {
  flex: 1;
  overflow-y: auto;
  padding: 1.25rem 1.35rem;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  background: radial-gradient(120% 120% at 20% 20%, rgba(59, 130, 246, 0.08), transparent 50%),
    radial-gradient(120% 120% at 80% 0%, rgba(124, 58, 237, 0.08), transparent 45%),
    var(--surface);
}

.chat-window__composer {
  display: flex;
  gap: 0.75rem;
  padding: 1rem 1.25rem 1.4rem;
  border-top: 1px solid var(--border);
  background: var(--panel);
  align-items: flex-end;
}

.composer-field {
  flex: 1;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 16px;
  padding: 0.35rem 0.65rem;
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.06);
}

.composer-field textarea {
  width: 100%;
  resize: none;
  border: none;
  background: transparent;
  padding: 0.65rem 0.6rem;
  font-size: 1rem;
  color: var(--text);
}

.composer-field textarea:focus {
  outline: none;
}

.ghost-btn {
  white-space: nowrap;
}

@media (max-width: 720px) {
  .chat-window__header {
    flex-direction: column;
    gap: 0.65rem;
    align-items: flex-start;
  }

  .chat-window__title-row {
    flex-wrap: wrap;
  }

  .chat-window__composer {
    flex-direction: column;
  }

  .composer-field {
    width: 100%;
  }
}
</style>