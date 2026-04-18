import { api } from './api';
import type { User } from '../store/authStore';

export interface LoginPayload {
  email: string;
  password?: string;
}

export interface AuthResponse {
  success: boolean;
  data: {
    user: User;
    token: string;
  };
  message?: string;
}

export const authService = {
  login: async (credentials: LoginPayload): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>('/auth/login', credentials);
    return response.data;
  },

  verifyToken: async (): Promise<{ success: boolean; data: User }> => {
    const response = await api.get('/auth/verify');
    return response.data;
  }
};
