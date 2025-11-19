import { createApiClient } from './http';

const chatClient = createApiClient('http://localhost:8083');

export const listChats = () => chatClient.get('/chats');
export const startChat = (payload) => chatClient.post('/chats/start', payload);
export const fetchMessages = (chatId) => chatClient.get(`/chats/${chatId}/messages`);
export const sendMessage = (chatId, payload) => chatClient.post(`/chats/${chatId}/messages`, payload);
export const deleteMessageForMe = (chatId, messageId) => chatClient.delete(`/chats/${chatId}/messages/${messageId}/me`);
export const deleteMessageForAll = (chatId, messageId) => chatClient.delete(`/chats/${chatId}/messages/${messageId}/all`);
export const hideChat = (chatId) => chatClient.delete(`/chats/${chatId}/me`);