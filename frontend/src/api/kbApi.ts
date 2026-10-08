import { apiClient } from './client';
import { KnowledgeDocument, PageResponse } from '../types';

export const kbApi = {
  getAll: async (page = 0, size = 15): Promise<PageResponse<KnowledgeDocument>> => {
    const res = await apiClient.get<PageResponse<KnowledgeDocument>>('/kb/documents', {
      params: { page, size },
    });
    return res.data;
  },

  getById: async (id: number): Promise<KnowledgeDocument> => {
    const res = await apiClient.get<KnowledgeDocument>(`/kb/documents/${id}`);
    return res.data;
  },

  create: async (data: {
    title: string;
    source?: string;
    category?: string;
    content: string;
    active?: boolean;
  }): Promise<KnowledgeDocument> => {
    const res = await apiClient.post<KnowledgeDocument>('/kb/documents', data);
    return res.data;
  },

  update: async (
    id: number,
    data: {
      title: string;
      source?: string;
      category?: string;
      content: string;
      active?: boolean;
    }
  ): Promise<KnowledgeDocument> => {
    const res = await apiClient.put<KnowledgeDocument>(`/kb/documents/${id}`, data);
    return res.data;
  },

  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`/kb/documents/${id}`);
  },

  reindex: async (): Promise<string> => {
    const res = await apiClient.post<string>('/kb/reindex');
    return res.data;
  },
};
