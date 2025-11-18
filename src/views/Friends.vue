<template>
  <div class="flex" style="align-items:flex-start; gap:1rem;">
    <div style="flex:2; display:grid; gap:1rem;">
      <FriendSearch />
      <FriendList>
        <template #actions="{ friend }">
          <button @click="startChat(friend.id)" :disabled="chatLoading">Chat</button>
        </template>
      </FriendList>
    </div>
    <div style="flex:1;">
      <FriendRequests />
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import FriendSearch from '../components/FriendSearch.vue';
import FriendList from '../components/FriendList.vue';
import FriendRequests from '../components/FriendRequests.vue';
import { useChatStore } from '../stores/chat.js';
import { useRouter } from 'vue-router';

const chatStore = useChatStore();
const router = useRouter();
const chatLoading = computed(() => chatStore.loading);

const startChat = async (friendId) => {
  await chatStore.startPrivateChat(friendId);
  router.push('/chat');
};
</script>