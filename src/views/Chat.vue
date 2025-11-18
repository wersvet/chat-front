<template>
  <div>
    <h2>Private Chat</h2>
    <div class="card" style="margin-bottom:1rem;">
      <div class="flex" style="align-items:flex-end;">
        <div style="flex:1;">
          <label>Chat ID</label>
          <input v-model="chatIdInput" placeholder="Existing chat id" />
        </div>
        <button @click="loadChat" :disabled="!chatIdInput">Load</button>
      </div>
    </div>
    <div class="chat-container">
      <div class="sidebar">
        <p><strong>Current Chat:</strong> {{ chatStore.currentChatId || 'None' }}</p>
        <p v-if="chatStore.error" class="alert">{{ chatStore.error }}</p>
        <p class="muted">Start from Friends page or load by ID.</p>
      </div>
      <div>
        <ChatWindow :messages="chatStore.chatMessages" />
        <MessageInput :onSend="send" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import ChatWindow from '../components/ChatWindow.vue';
import MessageInput from '../components/MessageInput.vue';
import { useChatStore } from '../stores/chat.js';

const chatStore = useChatStore();
const chatIdInput = ref('');

const send = async (text) => {
  await chatStore.sendChat(text);
};

const loadChat = async () => {
  if (!chatIdInput.value) return;
  await chatStore.loadChatMessages(chatIdInput.value);
  chatStore.connectChatSocket();
};
</script>