import { createApiClient } from './http';

const groupClient = createApiClient('http://localhost:9000');

export const createGroup = (payload) => groupClient.post('/groups', payload);
export const listGroups = () => groupClient.get('/groups');
export const getGroupMessages = (groupId) => groupClient.get(`/groups/${groupId}/messages`);
export const sendGroupMessage = (groupId, payload) => groupClient.post(`/groups/${groupId}/messages`, payload);
export const deleteGroupMessageForAll = (groupId, messageId) =>
    groupClient.delete(`/groups/${groupId}/messages/${messageId}/all`);