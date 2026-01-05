import { defineStore } from 'pinia';
import {
    createGroup as createGroupApi,
    listGroups,
    getGroupMessages,
    sendGroupMessage,
    deleteGroupMessageForAll,
} from '../api/groups';

const sortMessages = (messages = []) =>
    [...messages].sort((a, b) => new Date(a.created_at) - new Date(b.created_at));

const normalizeGroup = (raw) => {
    if (!raw) return null;
    const id = raw.id ?? raw.group_id ?? raw.groupId;
    return {
        ...raw,
        id,
        type: 'group',
        name: raw.name ?? raw.title ?? '',
    };
};

export const useGroupStore = defineStore('group', {
    state: () => ({
        groups: [],
        activeGroupId: null,
        activeMessages: [],
        groupSockets: {},
        reconnectTimers: {},
    }),
    getters: {
        activeGroup(state) {
            return state.groups.find((group) => group.id === state.activeGroupId) || null;
        },
    },
    actions: {
        async loadGroups() {
            const { data } = await listGroups();
            const rawGroups = data?.groups ?? data ?? [];
            this.groups = rawGroups.map(normalizeGroup).filter(Boolean);
        },
        async selectGroup(id) {
            if (!id) return;
            if (this.activeGroupId && this.activeGroupId !== id) {
                this.disconnectSocket(this.activeGroupId);
            }
            this.activeGroupId = id;
            await this.loadGroupMessages(id);
            this.connectGroupWS(id);
        },
        async loadGroupMessages(id) {
            const { data } = await getGroupMessages(id);
            const messages = Array.isArray(data) ? data : data?.messages ?? [];
            this.activeMessages = sortMessages(messages);
        },
        async createGroup(payload) {
            await createGroupApi(payload);
        },
        async sendMessage(id, text) {
            if (!text?.trim()) return;
            const { data } = await sendGroupMessage(id, { content: text });
            this.upsertMessage(data);
        },
        async deleteMessageForAll(id, messageId) {
            await deleteGroupMessageForAll(id, messageId);
            this.markDeleted(messageId);
        },
        upsertMessage(message) {
            const list = [...this.activeMessages];
            const index = list.findIndex((item) => item.id === message.id);
            if (index > -1) {
                list[index] = { ...list[index], ...message };
            } else {
                list.push(message);
            }
            this.activeMessages = sortMessages(list);
        },
        markDeleted(messageId) {
            const list = this.activeMessages;
            const index = list.findIndex((item) => item.id === messageId);
            if (index > -1) {
                const updated = { ...list[index], deletedForEveryone: true };
                this.activeMessages.splice(index, 1, updated);
            }
        },
        connectGroupWS(groupId) {
            const token = localStorage.getItem('token');
            if (!token) return;
            this.disconnectSocket(groupId);
            const ws = new WebSocket(`ws://localhost:9000/ws/groups/${groupId}?token=${token}`);
            ws.onmessage = (event) => {
                try {
                    const payload = JSON.parse(event.data);
                    if (payload.type === 'message:new' && payload.message) {
                        this.upsertMessage(payload.message);
                    }
                    if (payload.type === 'message:delete' && payload.message_id) {
                        this.markDeleted(payload.message_id);
                    }
                } catch (error) {
                    console.error('Failed to parse group event', error);
                }
            };
            ws.onclose = () => {
                if (this.activeGroupId === groupId) {
                    this.reconnectTimers[groupId] = setTimeout(() => this.connectGroupWS(groupId), 3000);
                }
            };
            this.groupSockets[groupId] = ws;
        },
        disconnectSocket(groupId) {
            const socket = this.groupSockets[groupId];
            if (socket) {
                socket.close();
                delete this.groupSockets[groupId];
            }
            const timer = this.reconnectTimers[groupId];
            if (timer) {
                clearTimeout(timer);
                delete this.reconnectTimers[groupId];
            }
        },
        reset() {
            Object.keys(this.groupSockets).forEach((groupId) => this.disconnectSocket(groupId));
            this.$reset();
        },
    },
});