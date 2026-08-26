import { apiClient } from './apiClient';

export interface MessageItem {
  id: string;
  senderId: string;
  recipientId: string;
  subject: string;
  body: string;
  isRead: boolean;
  createdAt: string;
  sender?: {
    id: string;
    firstName: string;
    lastName: string;
    role: string;
  };
  recipient?: {
    id: string;
    firstName: string;
    lastName: string;
  };
}

export const messagingRepository = {
  async getInbox(): Promise<MessageItem[]> {
    try {
      const list = await apiClient.getJsonList('/messages/inbox');
      return list as unknown as MessageItem[];
    } catch {
      return [];
    }
  },

  async getSent(): Promise<MessageItem[]> {
    try {
      const list = await apiClient.getJsonList('/messages/sent');
      return list as unknown as MessageItem[];
    } catch {
      return [];
    }
  },

  async getUnreadCount(): Promise<number> {
    try {
      const res = await apiClient.getJson('/messages/unread-count');
      return Number(res?.count ?? res ?? 0);
    } catch {
      return 0;
    }
  },

  async sendMessage(recipientId: string, subject: string, body: string): Promise<MessageItem> {
    const res = await apiClient.postJson('/messages', { recipientId, subject, body });
    return res as unknown as MessageItem;
  },

  async markAsRead(id: string): Promise<void> {
    await apiClient.patchJson(`/messages/${id}/read`, {});
  },

  async deleteMessage(id: string): Promise<void> {
    await apiClient.deleteJson(`/messages/${id}`);
  },
};
