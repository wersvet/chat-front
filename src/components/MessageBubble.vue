<template>
  <div class="message-bubble" :class="{ 'message-bubble--mine': isMine }">
    <div class="message-bubble__content">
      <p>{{ text }}</p>
      <footer>
        <small>{{ time }}</small>
        <div class="message-bubble__actions">
          <button v-if="showDeleteForMe" @click.stop="emit('delete-for-me')">Delete for me</button>
          <button v-if="isMine && !message.deletedForEveryone" @click.stop="emit('delete-for-all')">
            Delete for everyone
          </button>
        </div>
      </footer>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  message: { type: Object, required: true },
  isMine: { type: Boolean, default: false },
  showDeleteForMe: { type: Boolean, default: true },
});

const emit = defineEmits(['delete-for-me', 'delete-for-all']);

const text = computed(() =>
    props.message.deletedForEveryone || props.message.deleted_for_all
        ? 'This message was deleted'
        : props.message.content,
);

const time = computed(() =>
    props.message.created_at
        ? new Date(props.message.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        : '',
);
</script>

<style scoped>
.message-bubble {
  display: flex;
  justify-content: flex-start;
}

.message-bubble--mine {
  justify-content: flex-end;
}

.message-bubble__content {
  background: #fff;
  border-radius: 1rem;
  padding: 0.75rem 1rem;
  max-width: 70%;
  box-shadow: 0 10px 30px rgba(15, 23, 42, 0.05);
  position: relative;
}

.message-bubble--mine .message-bubble__content {
  background: linear-gradient(135deg, #6a95ff, #3b64f5);
  color: #fff;
}

.message-bubble__content p {
  margin: 0;
  font-size: 0.95rem;
  word-break: break-word;
}

.message-bubble__content footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 0.35rem;
  font-size: 0.75rem;
  color: rgba(255, 255, 255, 0.8);
}

.message-bubble:not(.message-bubble--mine) .message-bubble__content footer {
  color: var(--muted);
}

.message-bubble__actions {
  display: flex;
  gap: 0.25rem;
}

.message-bubble__actions button {
  border: none;
  background: transparent;
  color: inherit;
  font-size: 0.7rem;
  text-decoration: underline;
  padding: 0;
}
</style>