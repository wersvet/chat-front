import { defineStore } from 'pinia';
import {
  getMyProfile,
  getFriends,
  getIncomingFriendRequests,
  sendFriendRequest,
  acceptFriendRequest,
  rejectFriendRequest,
  getUserById,
} from '../api/users';

export const useUserStore = defineStore('user', {
  state: () => ({
    profile: null,
    friends: [],
    incomingRequests: [],
    loading: false,
    friendCache: {},
  }),
  actions: {
    async bootstrap() {
      await Promise.all([this.fetchProfile(), this.fetchFriends(), this.fetchIncomingRequests()]);
    },
    async fetchProfile() {
      this.loading = true;
      try {
        const { data } = await getMyProfile();
        this.profile = data;
        return data;
      } finally {
        this.loading = false;
      }
    },
    async fetchFriends() {
      const { data } = await getFriends();
      this.friends = data;
      return data;
    },
    async fetchIncomingRequests() {
      const { data } = await getIncomingFriendRequests();
      this.incomingRequests = data;
      return data;
    },
    async requestFriend(toUserId) {
      if (!toUserId) return;
      await sendFriendRequest({ to_user_id: Number(toUserId) });
      await this.fetchIncomingRequests();
    },
    async respondToRequest(id, decision) {
      if (decision === 'accept') {
        await acceptFriendRequest(id);
      } else {
        await rejectFriendRequest(id);
      }
      await Promise.all([this.fetchFriends(), this.fetchIncomingRequests()]);
    },
    async ensureUserCached(userId) {
      if (!userId) return null;
      if (!this.friendCache[userId]) {
        const { data } = await getUserById(userId);
        this.friendCache[userId] = data;
      }
      return this.friendCache[userId];
    },
    reset() {
      this.$reset();
    },
  },
});