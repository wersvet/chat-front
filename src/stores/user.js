import { defineStore } from 'pinia';
import {
  fetchMe,
  fetchUserById,
  sendFriendRequest,
  fetchIncomingRequests,
  acceptFriendRequest,
  rejectFriendRequest,
  fetchFriends
} from '../api/users.js';

export const useUserStore = defineStore('user', {
  state: () => ({
    profile: null,
    friends: [],
    incomingRequests: [],
    searchResult: null,
    loading: false,
    error: null
  }),
  actions: {
    async loadProfile() {
      this.loading = true;
      try {
        const { data } = await fetchMe();
        this.profile = data;
        this.friends = data.friends || [];
        this.incomingRequests = data.incoming_requests || [];
      } finally {
        this.loading = false;
      }
    },
    async searchUser(id) {
      this.loading = true;
      this.error = null;
      try {
        const { data } = await fetchUserById(id);
        this.searchResult = data;
      } catch (err) {
        this.searchResult = null;
        this.error = err.response?.data?.message || 'User not found';
      } finally {
        this.loading = false;
      }
    },
    async sendRequest(to_user_id) {
      await sendFriendRequest({ to_user_id });
    },
    async refreshRequests() {
      const { data } = await fetchIncomingRequests();
      this.incomingRequests = data;
    },
    async acceptRequest(id) {
      await acceptFriendRequest(id);
      await this.refreshRequests();
      await this.loadFriends();
    },
    async rejectRequest(id) {
      await rejectFriendRequest(id);
      await this.refreshRequests();
    },
    async loadFriends() {
      const { data } = await fetchFriends();
      this.friends = data;
    }
  }
});