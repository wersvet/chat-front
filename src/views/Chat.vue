<template>
  <div class="chat-layout">
    <aside class="chat-layout__sidebar">
      <div class="sidebar-header">
        <div>
          <p class="sidebar-subtitle">Вы вошли как:</p>
          <h2>{{ userStore.profile?.username }}</h2>
        </div>
        <button class="ghost" @click="handleLogout">Выйти</button>
      </div>
      <div class="sidebar-forms">
        <AddFriend @submit="handleFriendRequest" />
        <CreateChat @submit="handleCreateChat" />
      </div>
      <ChatList
        :chats="chatStore.chats"
        :selected-id="chatStore.activeChatId"
        :loading="chatStore.loadingChats"
        v-model:search="chatSearch"
        @select="chatStore.selectChat"
      />
      <div class="sidebar-cards">
        <FriendList :friends="userStore.friends">
          <template #actions="{ friend }">
            <button class="ghost" @click="chatStore.startChatWithFriend(friend.id)">
              Сообщение
            </button>
          </template>
        </FriendList>
        <FriendRequests
          :requests="userStore.incomingRequests"
          @accept="(id) => userStore.respondToRequest(id, 'accept')"
          @reject="(id) => userStore.respondToRequest(id, 'reject')"
        />
      </div>
    </aside>
    <main class="chat-layout__content">
      <ChatWindow
        :chat="chatStore.activeChat"
        :messages="chatStore.activeMessages"
        :current-user-id="authStore.user?.id"
        @send="(message) => chatStore.sendMessage(chatStore.activeChatId, message)"
        @delete-for-me="(messageId) => chatStore.deleteForMe(chatStore.activeChatId, messageId)"
        @delete-for-all="(messageId) => chatStore.deleteForAll(chatStore.activeChatId, messageId)"
        @hide-chat="chatStore.hideChat"
      />
    </main>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../stores/auth';
import { useUserStore } from '../stores/user';
import { useChatStore } from '../stores/chat';
import ChatList from '../components/ChatList.vue';
import ChatWindow from '../components/ChatWindow.vue';
import FriendList from '../components/FriendList.vue';
import FriendRequests from '../components/FriendRequests.vue';
import AddFriend from '../components/AddFriend.vue';
import CreateChat from '../components/CreateChat.vue';

const router = useRouter();
const authStore = useAuthStore();
const userStore = useUserStore();
const chatStore = useChatStore();
const chatSearch = ref('');

onMounted(async () => {
  await userStore.bootstrap();
  await chatStore.loadChats();

  // <--- если есть чаты, выбираем первый
  if (chatStore.chats.length > 0) {
    chatStore.selectChat(chatStore.chats[0].id);
  }
});

const handleFriendRequest = async (userId) => {
  await userStore.requestFriend(userId);
};

const handleCreateChat = async (userId) => {
  await chatStore.startChatWithFriend(userId);
};

const handleLogout = () => {
  authStore.logout();
  router.push('/login');
};
</script>

<style scoped>
.chat-layout {
  display: grid;
  grid-template-columns: 360px 1fr;
  gap: 1.5rem;
  padding: 2rem 3rem;
  min-height: 100vh;
}

.chat-layout__sidebar {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.chat-layout__content {
  min-height: 80vh;
}

.sidebar-header {
  background: var(--sidebar-bg);
  padding: 1.25rem;
  border-radius: 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border: 1px solid var(--border-color);
}

.sidebar-subtitle {
  margin: 0;
  color: var(--muted);
  font-size: 0.85rem;
}

.sidebar-forms {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.sidebar-cards {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin-top: auto;
}

button.ghost {
  border: 1px solid var(--border-color);
  background: transparent;
  border-radius: 999px;
  padding: 0.35rem 1rem;
}

@media (max-width: 1024px) {
  .chat-layout {
    grid-template-columns: 1fr;
    padding: 1.5rem;
  }
}
</style>