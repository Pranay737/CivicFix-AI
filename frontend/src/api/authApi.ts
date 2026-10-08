import { apiClient } from './client';
import { User } from '../types';

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  user: User;
}

export const authApi = {
  login: async (email: string, password: string): Promise<AuthResponse> => {
    const res = await apiClient.post<AuthResponse>('/auth/login', { email, password });
    return res.data;
  },

  register: async (data: { fullName: string; email: string; password: string; phone?: string }): Promise<AuthResponse> => {
    const res = await apiClient.post<AuthResponse>('/auth/register', data);
    return res.data;
  },

  logout: async (refreshToken?: string): Promise<void> => {
    try {
      await apiClient.post('/auth/logout', { refreshToken });
    } catch (e) {
      // Ignore logout errors
    }
  },

  getCurrentUser: async (): Promise<User> => {
    const res = await apiClient.get<User>('/auth/me');
    return res.data;
  },
};
