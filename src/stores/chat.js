import { defineStore } from 'pinia';
import {
  startChat,
  fetchChatMessages,
  sendChatMessage,
  createGroup,
  fetchGroupMessages,
  sendGroupMessage
} from '../api/chats.js';

export const useChatStore = defineStore('chat', {
  state: () => ({
    currentChatId: null,
    currentGroupId: null,
    chatMessages: [],
    groupMessages: [],
    chatSocket: null,
    groupSocket: null,
    loading: false,
    error: null
  }),
  actions: {
    async startPrivateChat(friendId) {
      this.loading = true;
      this.error = null;
      try {
        const { data } = await startChat({ friend_id: friendId });
        this.currentChatId = data.chat_id || data.id;
        await this.loadChatMessages(this.currentChatId);
        this.connectChatSocket();
      } catch (err) {
        this.error = err.response?.data?.message || 'Unable to start chat';
      } finally {
        this.loading = false;
      }
    },
    async loadChatMessages(chatId) {
      const { data } = await fetchChatMessages(chatId);
      this.chatMessages = data;
      this.currentChatId = chatId;
    },
    async sendChat(text) {
      if (!this.currentChatId) return;
      await sendChatMessage(this.currentChatId, { content: text });
    },
    connectChatSocket() {
      if (!this.currentChatId) return;
      if (this.chatSocket) {
        this.chatSocket.close();
      }
      const token = localStorage.getItem('token');
      const ws = new WebSocket(`ws://localhost:8083/ws/chats/${this.currentChatId}?token=${token}`);
      ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        this.chatMessages.push(data);
      };
      ws.onclose = () => {
        this.chatSocket = null;
      };
      this.chatSocket = ws;
    },
    async createGroup(payload) {
      const { data } = await createGroup(payload);
      this.currentGroupId = data.group_id || data.id;
      await this.loadGroupMessages(this.currentGroupId);
      this.connectGroupSocket();
    },
    async loadGroupMessages(groupId) {
      const { data } = await fetchGroupMessages(groupId);
      this.groupMessages = data;
      this.currentGroupId = groupId;
    },
    async sendGroup(text) {
      if (!this.currentGroupId) return;
      await sendGroupMessage(this.currentGroupId, { content: text });
    },
    connectGroupSocket() {
      if (!this.currentGroupId) return;
      if (this.groupSocket) {
        this.groupSocket.close();
      }
      const token = localStorage.getItem('token');
      const ws = new WebSocket(`ws://localhost:8083/ws/groups/${this.currentGroupId}?token=${token}`);
      ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        this.groupMessages.push(data);
      };
      ws.onclose = () => {
        this.groupSocket = null;
      };
      this.groupSocket = ws;
    },
    reset() {
      this.currentChatId = null;
      this.currentGroupId = null;
      this.chatMessages = [];
      this.groupMessages = [];
      if (this.chatSocket) this.chatSocket.close();
      if (this.groupSocket) this.groupSocket.close();
      this.chatSocket = null;
      this.groupSocket = null;
    }
  }
});