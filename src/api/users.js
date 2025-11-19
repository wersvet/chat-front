import { createApiClient } from './http';

const userClient = createApiClient('http://localhost:8082');

export const getMyProfile = () => userClient.get('/users/me');
export const getUserById = (id) => userClient.get(`/users/${id}`);
export const sendFriendRequest = (payload) => userClient.post('/friends/request', payload);
export const getIncomingFriendRequests = () => userClient.get('/friends/requests/incoming');
export const acceptFriendRequest = (id) => userClient.post(`/friends/requests/${id}/accept`);
export const rejectFriendRequest = (id) => userClient.post(`/friends/requests/${id}/reject`);
export const getFriends = () => userClient.get('/friends');