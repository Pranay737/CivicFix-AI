import { apiClient } from './client';
import { DepartmentAnalytics, SystemAnalytics } from '../types';

export const analyticsApi = {
  getDepartmentAnalytics: async (departmentId?: number): Promise<DepartmentAnalytics> => {
    const res = await apiClient.get<DepartmentAnalytics>('/analytics/department', {
      params: { departmentId },
    });
    return res.data;
  },

  getSystemAnalytics: async (): Promise<SystemAnalytics> => {
    const res = await apiClient.get<SystemAnalytics>('/analytics/system');
    return res.data;
  },
};
