import { apiClient } from './client';
import { ChatMessage, ChatResponse, ChatSession } from '../types';

export const assistantApi = {
  chat: async (message: string, sessionUuid?: string): Promise<ChatResponse> => {
    const res = await apiClient.post<ChatResponse>('/assistant/chat', {
      message,
      sessionUuid,
    });
    return res.data;
  },

  getSessions: async (): Promise<ChatSession[]> => {
    const res = await apiClient.get<ChatSession[]>('/assistant/sessions');
    return res.data;
  },

  getMessages: async (sessionUuid: string): Promise<ChatMessage[]> => {
    const res = await apiClient.get<ChatMessage[]>(`/assistant/sessions/${sessionUuid}/messages`);
    return res.data;
  },

  deleteSession: async (sessionUuid: string): Promise<void> => {
    await apiClient.delete(`/assistant/sessions/${sessionUuid}`);
  },
};
