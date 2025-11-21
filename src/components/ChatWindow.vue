<template>
  <section class="chat-window" v-if="chat">
    <header class="chat-window__header">
      <div>
        <h2>{{ chat.friend?.username }}</h2>
        <p>ID чата: {{ chat.id }}</p>
      </div>
      <button class="ghost" @click="emit('hide-chat', chat.id)">Скрыть чат</button>
    </header>
    <div class="chat-window__messages" ref="messagesContainer">
      <MessageBubble
        v-for="message in messages"
        :key="message.id"
        :message="message"
        :is-mine="message.sender_id == currentUserId"
        @delete-for-me="emit('delete-for-me', message.id)"
        @delete-for-all="emit('delete-for-all', message.id)"
      />
    </div>
    <footer class="chat-window__composer">
      <textarea
        v-model="draft"
        placeholder="Введите сообщение"
        rows="1"
        @keydown.enter.prevent="handleSend"
      ></textarea>
      <button class="primary" :disabled="!draft.trim()" @click="handleSend">Отправить</button>
    </footer>
  </section>
  <section v-else class="chat-window chat-window--placeholder">
    <div>
      <h2>Выберите разговор</h2>
      <p>Выберите чат, чтобы начать переписку. Новые разговоры появляются здесь мгновенно</p>
    </div>
  </section>
</template>

<script setup>
import { nextTick, onUpdated, ref, watch } from 'vue';
import MessageBubble from './MessageBubble.vue';

const props = defineProps({
  chat: { type: Object, default: null },
  messages: { type: Array, default: () => [] },
  currentUserId: { type: Number, required: true },
});

const emit = defineEmits(['send', 'delete-for-me', 'delete-for-all', 'hide-chat']);

const draft = ref('');
const messagesContainer = ref(null);

const handleSend = () => {
  if (!draft.value.trim()) return;
  emit('send', draft.value.trim());
  draft.value = '';
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
  background: var(--panel-bg);
  border-radius: 24px;
  height: calc(100vh - 40px);
  display: flex;
  flex-direction: column;
  backdrop-filter: blur(16px);
  border: 1px solid rgba(31, 45, 61, 0.08);
}

.chat-window__messages {
  flex: 1;
  overflow-y: auto;
  padding: 1.25rem 1.75rem;
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
}


.chat-window--placeholder {
  align-items: center;
  justify-content: center;
  text-align: center;
  color: var(--muted);
}

.chat-window__header {
  padding: 1.25rem 1.75rem;
  border-bottom: 1px solid var(--border-color);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.chat-window__header h2 {
  margin: 0;
}

.chat-window__header p {
  margin: 0.2rem 0 0;
  color: var(--muted);
  font-size: 0.85rem;
}

.chat-window__composer {
  display: flex;
  gap: 0.75rem;
  padding: 1rem 1.25rem 1.25rem;
  border-top: 1px solid var(--border-color);
}

.chat-window__composer textarea {
  flex: 1;
  resize: none;
  border-radius: 1rem;
  border: 1px solid var(--border-color);
  padding: 0.85rem 1rem;
  font-size: 1rem;
  background: rgba(255, 255, 255, 0.9);
}

button.primary {
  background: var(--primary);
  border: none;
  border-radius: 999px;
  padding: 0 1.5rem;
  color: #fff;
  font-weight: 600;
}

button.primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

button.ghost {
  border: 1px solid var(--border-color);
  background: transparent;
  border-radius: 999px;
  padding: 0.4rem 1.2rem;
  color: #1f2d3d;
}
</style>