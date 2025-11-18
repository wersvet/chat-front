<template>
  <div>
    <h2>Group Chat</h2>
    <div class="flex" style="gap:1rem; align-items:flex-start; margin-bottom:1rem;">
      <div style="flex:1;">
        <GroupCreate />
      </div>
      <div style="flex:1;">
        <GroupList />
      </div>
    </div>
    <div class="chat-container">
      <div class="sidebar">
        <p><strong>Current Group:</strong> {{ chatStore.currentGroupId || 'None' }}</p>
        <p class="muted">Create or join a group to begin.</p>
      </div>
      <div>
        <ChatWindow :messages="chatStore.groupMessages" />
        <MessageInput :onSend="send" />
      </div>
    </div>
  </div>
</template>

<script setup>
import GroupCreate from '../components/GroupCreate.vue';
import GroupList from '../components/GroupList.vue';
import ChatWindow from '../components/ChatWindow.vue';
import MessageInput from '../components/MessageInput.vue';
import { useChatStore } from '../stores/chat.js';

const chatStore = useChatStore();

const send = async (text) => {
  await chatStore.sendGroup(text);
};
</script>