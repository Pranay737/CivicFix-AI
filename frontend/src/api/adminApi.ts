import { apiClient } from './client';
import { AuditLog, Category, Department, PageResponse, SlaPolicy, User } from '../types';

export const adminApi = {
  getDepartments: async (): Promise<Department[]> => {
    const res = await apiClient.get<Department[]>('/departments');
    return res.data;
  },

  getCategories: async (): Promise<Category[]> => {
    const res = await apiClient.get<Category[]>('/categories');
    return res.data;
  },

  getCategoriesByDept: async (departmentId: number): Promise<Category[]> => {
    const res = await apiClient.get<Category[]>(`/departments/${departmentId}/categories`);
    return res.data;
  },

  getUsers: async (role?: string, page = 0, size = 15): Promise<PageResponse<User>> => {
    const res = await apiClient.get<PageResponse<User>>('/users', {
      params: { role, page, size },
    });
    return res.data;
  },

  getOfficersByDept: async (departmentId?: number): Promise<User[]> => {
    const res = await apiClient.get<User[]>('/users/officers', {
      params: { departmentId },
    });
    return res.data;
  },

  getOfficers: async (departmentId?: number): Promise<User[]> => {
    return adminApi.getOfficersByDept(departmentId);
  },

  updateUserRole: async (userId: number, role: string): Promise<User> => {
    const res = await apiClient.patch<User>(`/users/${userId}/role`, { role });
    return res.data;
  },

  assignUserDepartment: async (userId: number, departmentId: number): Promise<User> => {
    const res = await apiClient.patch<User>(`/users/${userId}/department`, { departmentId });
    return res.data;
  },

  toggleUserStatus: async (userId: number, active: boolean): Promise<User> => {
    const res = await apiClient.patch<User>(`/users/${userId}/status`, { active });
    return res.data;
  },

  getSlaPolicies: async (): Promise<SlaPolicy[]> => {
    const res = await apiClient.get<SlaPolicy[]>('/sla-policies');
    return res.data;
  },

  updateSlaPolicy: async (id: number, resolutionHours: number): Promise<SlaPolicy> => {
    const res = await apiClient.put<SlaPolicy>(`/sla-policies/${id}`, { resolutionHours });
    return res.data;
  },

  getAuditLogs: async (page = 0, size = 20): Promise<PageResponse<AuditLog>> => {
    const res = await apiClient.get<PageResponse<AuditLog>>('/audit-logs', {
      params: { page, size },
    });
    return res.data;
  },
};
