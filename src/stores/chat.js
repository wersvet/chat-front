import { defineStore } from 'pinia';
import {
  listChats,
  startChat,
  fetchMessages,
  sendMessage as sendMessageApi,
  deleteMessageForMe,
  deleteMessageForAll,
  hideChat as hideChatApi,
} from '../api/chats';
import { useUserStore } from './user';
import { useAuthStore } from './auth';

const sortByLastMessage = (chats) =>
  [...chats].sort((a, b) => {
    const aTime = new Date(a?.last_message?.created_at || a.updated_at || 0).getTime();
    const bTime = new Date(b?.last_message?.created_at || b.updated_at || 0).getTime();
    return bTime - aTime;
  });

export const useChatStore = defineStore('chat', {
  state: () => ({
    chats: [],
    loadingChats: false,
    activeChatId: null,
    messages: {},
    sending: false,
    sockets: {},
    reconnectTimers: {},
  }),
  getters: {
    activeChat(state) {
      return state.chats.find((chat) => chat.id === state.activeChatId) || null;
    },
    activeMessages(state) {
      return state.messages[state.activeChatId] || [];
    },
  },
  actions: {
    async loadChats() {
      this.loadingChats = true;
      try {
        const { data } = await listChats();
        const chats = data.chats || [];        // <-- FIX
        const enriched = await Promise.all(chats.map((chat) => this.enrichChat(chat)));
        this.chats = sortByLastMessage(enriched);
      } finally {
        this.loadingChats = false;
      }
    },
    async enrichChat(chat) {
      if (!chat) return chat;

      const authStore = useAuthStore();
      const userStore = useUserStore();

      const normalized = {
        id: chat.chat_id || chat.id,
        chat_id: chat.chat_id || chat.id,
        friend_id: chat.friend_id,
        created_at: chat.created_at,
        my_id: authStore.user?.id,          // <--- ВАЖНО!
        last_message: null
      };

      // Загружаем друга
      normalized.friend = await userStore.ensureUserCached(normalized.friend_id);

      // Загружаем последнее сообщение вручную
      const { data } = await fetchMessages(normalized.id);
      const msgs = data.messages || [];

      if (msgs.length > 0) {
        normalized.last_message = msgs[msgs.length - 1];  // последнее сообщение
      }

      return normalized;
    },
    async selectChat(chatId) {
      if (!chatId) return;
      this.activeChatId = chatId;
      if (!this.messages[chatId]) {
        await this.fetchMessages(chatId);
      }
      this.connectSocket(chatId);
    },
    async fetchMessages(chatId) {
      const { data } = await fetchMessages(chatId);
      const list = data.messages || [];   // <-- правильное поле
      const ordered = [...list].sort((a, b) =>
        new Date(a.created_at) - new Date(b.created_at)
      );

      this.messages = { ...this.messages, [chatId]: ordered };
    },
    async startChatWithFriend(friendId) {
      if (!friendId) return null;
      const { data } = await startChat({ friend_id: Number(friendId) });
      // backend returns only { chat_id }
      // so we must refresh all chats:
      await this.loadChats();
      // now find the real chat:
      const chat = this.chats.find(c => c.id === data.chat_id);


      const existingIndex = this.chats.findIndex((c) => c.id === chat.id);
      if (existingIndex > -1) {
        this.chats.splice(existingIndex, 1, chat);
      } else {
        this.chats.unshift(chat);
      }
      await this.selectChat(chat.id);
      return chat;
    },
    async sendMessage(chatId, content) {
      if (!content?.trim()) return;
      this.sending = true;
      try {
        const { data } = await sendMessageApi(chatId, { content });
        this.upsertMessage(chatId, data);
        this.updateChatLastMessage(chatId, data);
      } finally {
        this.sending = false;
      }
    },
    async deleteForMe(chatId, messageId) {
      await deleteMessageForMe(chatId, messageId);
      const list = this.messages[chatId] || [];
      this.messages[chatId] = list.filter((message) => message.id !== messageId);
    },
    async deleteForAll(chatId, messageId) {
      await deleteMessageForAll(chatId, messageId);
      this.markMessageDeleted(chatId, messageId);
    },
    async hideChat(chatId) {
      await hideChatApi(chatId);
      this.disconnectSocket(chatId);
      this.chats = this.chats.filter((chat) => chat.id !== chatId);
      if (this.activeChatId === chatId) {
        this.activeChatId = null;
      }
    },
    upsertMessage(chatId, message) {
      const list = this.messages[chatId] ? [...this.messages[chatId]] : [];
      const index = list.findIndex((item) => item.id === message.id);
      if (index > -1) {
        list[index] = { ...list[index], ...message };
      } else {
        list.push(message);
      }
      list.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
      this.messages[chatId] = list;
    },
    markMessageDeleted(chatId, messageId) {
      const list = this.messages[chatId];
      if (!list) return;
      const index = list.findIndex((m) => m.id === messageId);
      if (index > -1) {
        list[index] = {
          ...list[index],
          deletedForEveryone: true,
        };
        this.messages[chatId] = [...list];
      }
    },
    updateChatLastMessage(chatId, lastMessage) {
      this.chats = sortByLastMessage(
        this.chats.map((chat) => (chat.id === chatId ? { ...chat, last_message: lastMessage } : chat)),
      );
    },
    connectSocket(chatId) {
      const token = localStorage.getItem('token');
      if (!token) return;
      this.disconnectSocket(chatId);
      const ws = new WebSocket(`ws://localhost:8083/ws/chats/${chatId}?token=${token}`);
      ws.onmessage = (event) => {
        try {
          const payload = JSON.parse(event.data);
          if (payload.type === 'message' && payload.message) {
            this.upsertMessage(chatId, payload.message);
            this.updateChatLastMessage(chatId, payload.message);
          }
          if (payload.type === 'delete_for_all') {
            this.markMessageDeleted(chatId, payload.message_id);
          }
        } catch (error) {
          console.error('Failed to parse chat event', error);
        }
      };
      ws.onclose = () => {
        if (this.activeChatId === chatId) {
          this.reconnectTimers[chatId] = setTimeout(() => this.connectSocket(chatId), 3000);
        }
      };
      this.sockets[chatId] = ws;
    },
    disconnectSocket(chatId) {
      const socket = this.sockets[chatId];
      if (socket) {
        socket.close();
        delete this.sockets[chatId];
      }
      const timer = this.reconnectTimers[chatId];
      if (timer) {
        clearTimeout(timer);
        delete this.reconnectTimers[chatId];
      }
    },
    reset() {
      Object.keys(this.sockets).forEach((chatId) => this.disconnectSocket(chatId));
      this.$reset();
    },
  },
});