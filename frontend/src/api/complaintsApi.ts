import { apiClient } from './client';
import { AiTriageResult, Complaint, Feedback, PageResponse } from '../types';

export const complaintsApi = {
  create: async (data: {
    title: string;
    description: string;
    categoryId?: number;
    departmentId?: number;
    latitude?: number;
    longitude?: number;
    address?: string;
    imageUrls?: string[];
  }): Promise<Complaint> => {
    const res = await apiClient.post<Complaint>('/complaints', data);
    return res.data;
  },

  getMyComplaints: async (page = 0, size = 10): Promise<PageResponse<Complaint>> => {
    const res = await apiClient.get<PageResponse<Complaint>>('/complaints/my', {
      params: { page, size, sortBy: 'createdAt', sortDir: 'desc' },
    });
    return res.data;
  },

  getDepartmentComplaints: async (
    departmentId?: number,
    status?: string,
    page = 0,
    size = 15
  ): Promise<PageResponse<Complaint>> => {
    const res = await apiClient.get<PageResponse<Complaint>>('/complaints/department', {
      params: { departmentId, status, page, size, sortBy: 'createdAt', sortDir: 'desc' },
    });
    return res.data;
  },

  getAssignedComplaints: async (status?: string, page = 0, size = 15): Promise<PageResponse<Complaint>> => {
    const res = await apiClient.get<PageResponse<Complaint>>('/complaints/assigned', {
      params: { status, page, size, sortBy: 'createdAt', sortDir: 'desc' },
    });
    return res.data;
  },

  getAllComplaints: async (page = 0, size = 15): Promise<PageResponse<Complaint>> => {
    const res = await apiClient.get<PageResponse<Complaint>>('/complaints', {
      params: { page, size, sortBy: 'createdAt', sortDir: 'desc' },
    });
    return res.data;
  },

  getAll: async (
    page = 0,
    size = 15,
    filters?: { departmentId?: number; status?: string }
  ): Promise<PageResponse<Complaint>> => {
    if (filters?.departmentId) {
      return complaintsApi.getDepartmentComplaints(filters.departmentId, filters.status, page, size);
    }
    const res = await apiClient.get<PageResponse<Complaint>>('/complaints', {
      params: { page, size, status: filters?.status, sortBy: 'createdAt', sortDir: 'desc' },
    });
    return res.data;
  },

  getAssignedToMe: async (page = 0, size = 15, status?: string): Promise<PageResponse<Complaint>> => {
    return complaintsApi.getAssignedComplaints(status, page, size);
  },

  getById: async (id: number): Promise<Complaint> => {
    const res = await apiClient.get<Complaint>(`/complaints/${id}`);
    return res.data;
  },

  track: async (trackingNumber: string): Promise<Complaint> => {
    const res = await apiClient.get<Complaint>(`/complaints/track/${trackingNumber}`);
    return res.data;
  },

  assign: async (complaintId: number, officerId: number, notes?: string): Promise<Complaint> => {
    const res = await apiClient.post<Complaint>(`/complaints/${complaintId}/assign`, {
      officerId,
      notes,
    });
    return res.data;
  },

  updateStatus: async (complaintId: number, status: string, comment?: string): Promise<Complaint> => {
    const res = await apiClient.patch<Complaint>(`/complaints/${complaintId}/status`, {
      status,
      comment,
    });
    return res.data;
  },

  resolve: async (complaintId: number, notes: string, evidenceImageUrls?: string[]): Promise<Complaint> => {
    const res = await apiClient.post<Complaint>(`/complaints/${complaintId}/resolve`, {
      notes,
      evidenceImageUrls,
    });
    return res.data;
  },

  verify: async (
    complaintId: number,
    verified: boolean,
    comment?: string,
    rating?: number
  ): Promise<Complaint> => {
    const res = await apiClient.post<Complaint>(`/complaints/${complaintId}/verify`, {
      verified,
      comment,
      rating,
    });
    return res.data;
  },

  submitFeedback: async (complaintId: number, rating: number, comment?: string): Promise<Feedback> => {
    const res = await apiClient.post<Feedback>(`/complaints/${complaintId}/feedback`, {
      rating,
      comment,
    });
    return res.data;
  },

  triageOverride: async (
    complaintId: number,
    data: { categoryId?: number; departmentId?: number; priority?: string; reason?: string }
  ): Promise<Complaint> => {
    const res = await apiClient.patch<Complaint>(`/complaints/${complaintId}/triage`, data);
    return res.data;
  },

  previewAi: async (title: string, description: string, address?: string): Promise<AiTriageResult> => {
    const res = await apiClient.post<AiTriageResult>('/ai/analyze-preview', {
      title,
      description,
      address,
    });
    return res.data;
  },

  uploadImage: async (file: File): Promise<{ fileUrl: string; publicId: string }> => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('folder', 'complaints');
    const res = await apiClient.post<{ fileUrl: string; publicId: string }>('/uploads', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data;
  },
};
