<template>
  <div class="chat-layout">
    <aside class="chat-layout__sidebar">
      <div class="sidebar-header">
        <div>
          <p class="sidebar-subtitle">Вы</p>
          <h2>{{ userStore.profile?.username }}</h2>
        </div>
        <button class="ghost" @click="handleLogout">Выйти</button>
      </div>
      <div class="sidebar-forms">
        <AddFriend @submit="handleFriendRequest" />
        <CreateGroup :friends="userStore.friends" @submit="handleCreateGroup" />
      </div>
      <ChatList
          :chats="chatsForList"
          :selected-key="selectedKey"
          :loading="chatStore.loadingChats"
          v-model:search="chatSearch"
          @select="handleSelectChat"
      />
      <div class="sidebar-cards">
        <FriendList :friends="userStore.friends">
          <template #actions="{ friend }">
            <button class="ghost" @click="chatStore.startChatWithFriend(friend.id)">
              открыть чат
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
          v-if="isReady"
          :chat="activeChat"
          :messages="activeMessages"
          :current-user-id="authStore.user?.id"
          :type="activeType || 'private'"
          @send="handleSend"
          @delete-for-me="handleDeleteForMe"
          @delete-for-all="handleDeleteForAll"
          @hide-chat="chatStore.hideChat"
      />
      <div v-else class="chat-layout__loading">
        <p>Loading your account...</p>
      </div>
    </main>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../stores/auth';
import { useUserStore } from '../stores/user';
import { useChatStore } from '../stores/chat';
import { useGroupStore } from '../stores/group';
import ChatList from '../components/ChatList.vue';
import ChatWindow from '../components/ChatWindow.vue';
import FriendList from '../components/FriendList.vue';
import FriendRequests from '../components/FriendRequests.vue';
import AddFriend from '../components/AddFriend.vue';
import CreateGroup from '../components/CreateGroup.vue';

const router = useRouter();
const authStore = useAuthStore();
const userStore = useUserStore();
const chatStore = useChatStore();
const groupStore = useGroupStore();
const chatSearch = ref('');
const isReady = computed(() => Boolean(authStore.user?.id));
const sortByLastActivity = (items) =>
    [...items].sort((a, b) => {
      const aTime = new Date(a?.last_message?.created_at || a.updated_at || 0).getTime();
      const bTime = new Date(b?.last_message?.created_at || b.updated_at || 0).getTime();
      return bTime - aTime;
    });
const selectedKey = computed(() => {
  if (chatStore.activeChatId) return `private-${chatStore.activeChatId}`;
  if (groupStore.activeGroupId) return `group-${groupStore.activeGroupId}`;
  return null;
});

const chatsForList = computed(() => {
  const privateChats = chatStore.chats.map((chat) => ({
    ...chat,
    type: 'private',
    name: chat.friend?.username || chat.name,
  }));

  const groups = groupStore.groups.map((group) => ({
    ...group,
    type: 'group',
  }));

  return sortByLastActivity([...privateChats, ...groups]);
});

onMounted(async () => {
  await authStore.initialize();
  if (!authStore.user) {
    try {
      await authStore.refreshUser();
    } catch (error) {
      authStore.logout();
      return;
    }
  }

  await userStore.bootstrap();
  await chatStore.loadChats();
  await groupStore.loadGroups();
});

const handleFriendRequest = async (userId) => {
  await userStore.requestFriend(userId);
};

const handleCreateGroup = async (payload) => {
  await groupStore.createGroup(payload);
  await groupStore.loadGroups();
};

const handleSelectChat = async (chat) => {
  if (!chat) return;
  if (chat.type === 'group') {
    chatStore.activeChatId = null;
    await groupStore.selectGroup(chat.id);
  } else {
    groupStore.activeGroupId = null;
    await chatStore.selectChat(chat.id);
  }
};

const activeChat = computed(() => (groupStore.activeGroup ? groupStore.activeGroup : chatStore.activeChat));
const activeMessages = computed(() =>
    groupStore.activeGroupId ? groupStore.activeMessages : chatStore.activeMessages,
);
const activeType = computed(() => (groupStore.activeGroupId ? 'group' : chatStore.activeChatId ? 'private' : null));

const handleSend = async (message) => {
  if (activeType.value === 'group') {
    await groupStore.sendMessage(groupStore.activeGroupId, message);
  } else if (chatStore.activeChatId) {
    await chatStore.sendMessage(chatStore.activeChatId, message);
  }
};

const handleDeleteForMe = async (messageId) => {
  if (activeType.value === 'private' && chatStore.activeChatId) {
    await chatStore.deleteForMe(chatStore.activeChatId, messageId);
  }
};

const handleDeleteForAll = async (messageId) => {
  if (activeType.value === 'group' && groupStore.activeGroupId) {
    await groupStore.deleteMessageForAll(groupStore.activeGroupId, messageId);
  } else if (chatStore.activeChatId) {
    await chatStore.deleteForAll(chatStore.activeChatId, messageId);
  }
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

.chat-layout__loading {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: var(--muted);
  border: 1px dashed var(--border-color);
  border-radius: 16px;
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