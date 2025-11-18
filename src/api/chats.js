import axios from 'axios';

const client = axios.create({
  baseURL: 'http://localhost:8083',
  headers: { 'Content-Type': 'application/json' }
});

client.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Private chat
export const startChat = (payload) => client.post('/chats/start', payload);
export const fetchChatMessages = (chatId) => client.get(`/chats/${chatId}/messages`);
export const sendChatMessage = (chatId, payload) => client.post(`/chats/${chatId}/messages`, payload);

// Group chat
export const createGroup = (payload) => client.post('/groups', payload);
export const fetchGroupMessages = (groupId) => client.get(`/groups/${groupId}/messages`);
export const sendGroupMessage = (groupId, payload) => client.post(`/groups/${groupId}/messages`, payload);