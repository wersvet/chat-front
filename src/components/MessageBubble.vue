<template>
  <div class="message-bubble" :class="{ 'mine': isMine }">
    <div class="bubble">
      <!-- sender name (only for NOT mine) -->
      <p v-if="!isMine" class="sender">{{ message.sender_name }}</p>

      <p class="text">
        <span v-if="deleted">This message was deleted</span>
        <span v-else>{{ message.content }}</span>
      </p>

      <footer class="footer">
        <small>{{ time }}</small>

        <div class="actions">
          <button @click.stop="emit('delete-for-me')">Delete for me</button>

          <button
            v-if="isMine && !deleted"
            @click.stop="emit('delete-for-all')"
          >
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
  message: Object,
  isMine: Boolean
});

const emit = defineEmits(["delete-for-me", "delete-for-all"]);

const deleted = computed(() => {
  return props.message.deleted_for_all || props.message.deletedForEveryone;
});

const time = computed(() =>
  props.message.created_at
    ? new Date(props.message.created_at).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit"
      })
    : ""
);
</script>

<style scoped>
.message-bubble {
  display: flex;
  justify-content: flex-start;
  padding: 4px 8px;
}

.message-bubble.mine {
  justify-content: flex-end;
}

.bubble {
  max-width: 70%;
  padding: 10px 14px;
  border-radius: 12px;
  background: #ffffff;
  box-shadow: 0 2px 6px rgba(0,0,0,0.1);
}

.message-bubble.mine .bubble {
  background: #d1f4ff;
  align-self: flex-end;
}

.sender {
  margin: 0;
  font-size: 0.75rem;
  font-weight: bold;
  color: #4a5568;
}

.text {
  margin: 4px 0;
  white-space: pre-line;
  word-break: break-word;
}

.bubble.deleted {
  color: #999;
}

.footer {
  display: flex;
  justify-content: space-between;
  font-size: 0.75rem;
  margin-top: 4px;
}

.actions {
  display: flex;
  gap: 6px;
}

.actions button {
  background: none;
  border: none;
  padding: 0;
  text-decoration: underline;
  cursor: pointer;
  font-size: 0.7rem;
}
</style>