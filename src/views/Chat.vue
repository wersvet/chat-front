<template>
  <div class="page-shell">
    <div class="chat-layout">
      <aside class="chat-layout__sidebar glass-card">
        <header class="sidebar-header">
          <div class="sidebar-profile">
            <div class="sidebar-avatar">{{ initials }}</div>
            <div class="sidebar-identity">
              <p class="sidebar-meta">ID: {{ userStore.profile?.id }}</p>
              <p class="sidebar-subtitle">Ваш аккаунт</p>
              <h2>{{ userStore.profile?.username }}</h2>
            </div>
          </div>
          <div class="sidebar-controls">
            <button class="ghost-btn" @click="handleLogout">Выйти</button>
          </div>
        </header>

        <section class="sidebar-forms">
          <AddFriend class="soft-card" @submit="handleFriendRequest" />
          <CreateGroup class="soft-card" :friends="userStore.friends" @submit="handleCreateGroup" />
        </section>

        <section class="sidebar-list glass-card">
          <ChatList
              :chats="chatsForList"
              :selected-key="selectedKey"
              :loading="chatStore.loadingChats"
              v-model:search="chatSearch"
              @select="handleSelectChat"
          />
        </section>

        <div class="sidebar-cards">
          <FriendList class="soft-card" :friends="userStore.friends">
            <template #actions="{ friend }">
              <button class="ghost-btn" @click="chatStore.startChatWithFriend(friend.id)">
                открыть чат
              </button>
            </template>
          </FriendList>
          <FriendRequests
              class="soft-card"
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
        <div v-else class="chat-layout__loading glass-card">
          <p>Loading your account...</p>
        </div>
      </main>
    </div>
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
const initials = computed(() => (userStore.profile?.username || '??').slice(0, 2).toUpperCase());
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
  grid-template-columns: 380px minmax(0, 1fr);
  gap: 1.35rem;
  align-items: start;
}

.chat-layout__sidebar {
  display: flex;
  flex-direction: column;
  gap: 0.9rem;
  padding: 1.2rem 1.1rem 1.5rem;
  position: sticky;
  top: 1.2rem;
  height: calc(100vh - 2.4rem);
  overflow: hidden;
  min-height: 0;
}

.chat-layout__content {
  height: calc(100vh - 2.4rem);
  min-height: 0;
  display: flex;
}

.chat-layout__content > * {
  flex: 1;
}

.chat-layout__loading {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: var(--muted);
  border: 1px dashed var(--border);
  border-radius: 16px;
  padding: 2rem;
}

.sidebar-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  padding-bottom: 0.75rem;
  border-bottom: 1px solid var(--border);
}

.sidebar-profile {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.sidebar-identity {
  display: flex;
  flex-direction: column;
  gap: 0.1rem;
}

.sidebar-avatar {
  width: 46px;
  height: 46px;
  border-radius: 14px;
  background: var(--sidebar-accent);
  display: grid;
  place-items: center;
  color: #fff;
  font-weight: 800;
  letter-spacing: 0.02em;
}

.sidebar-subtitle {
  margin: 0;
  color: var(--muted);
  font-size: 0.85rem;
}

.sidebar-meta {
  margin: 0;
  color: var(--muted);
  font-size: 0.78rem;
  letter-spacing: 0.01em;
}

.sidebar-controls {
  display: flex;
  align-items: center;
  gap: 0.6rem;
}

.sidebar-forms {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.sidebar-list {
  padding: 0.35rem 0.35rem 0.25rem;
  flex: 1;
  min-height: 0;
  display: flex;
}

.sidebar-list > * {
  flex: 1;
  min-height: 0;
}

.sidebar-cards {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin-top: auto;
  padding-top: 0.25rem;
  overflow: auto;
}

@media (max-width: 1280px) {
  .page-shell {
    padding: 1.25rem 1.25rem 2rem;
  }

  .chat-layout {
    grid-template-columns: 330px 1fr;
  }
}

@media (max-width: 1024px) {
  .chat-layout {
    grid-template-columns: 1fr;
  }

  .chat-layout__sidebar {
    position: relative;
    height: auto;
  }

  .chat-layout__content {
    height: auto;
    min-height: 70vh;
  }
}
</style>