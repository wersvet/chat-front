import axios from 'axios';

const client = axios.create({
  baseURL: 'http://localhost:8082',
  headers: { 'Content-Type': 'application/json' }
});

client.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const fetchMe = () => client.get('/users/me');
export const fetchUserById = (id) => client.get(`/users/${id}`);
export const sendFriendRequest = (payload) => client.post('/friends/request', payload);
export const fetchIncomingRequests = () => client.get('/friends/requests/incoming');
export const acceptFriendRequest = (id) => client.post(`/friends/requests/${id}/accept`);
export const rejectFriendRequest = (id) => client.post(`/friends/requests/${id}/reject`);
export const fetchFriends = () => client.get('/friends');