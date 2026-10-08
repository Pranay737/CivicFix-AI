import { apiClient } from './client';
import { NotificationItem, PageResponse } from '../types';

export const notificationsApi = {
  getAll: async (page = 0, size = 15): Promise<PageResponse<NotificationItem>> => {
    const res = await apiClient.get<PageResponse<NotificationItem>>('/notifications', {
      params: { page, size },
    });
    return res.data;
  },

  getUnreadCount: async (): Promise<number> => {
    const res = await apiClient.get<{ unreadCount: number }>('/notifications/unread-count');
    return res.data.unreadCount;
  },

  markAsRead: async (id: number): Promise<void> => {
    await apiClient.patch(`/notifications/${id}/read`);
  },

  markAllAsRead: async (): Promise<void> => {
    await apiClient.post('/notifications/read-all');
  },
};
