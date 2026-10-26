import { axiosClient } from './axiosClient';
import type { AuthResponse } from '../types';

export const authApi = {
  login: async (email: string, password: string): Promise<AuthResponse> => {
    const response = await axiosClient.post<AuthResponse>('/auth/login', { email, password });
    return response.data;
  },

  register: async (fullName: string, email: string, password: string, confirmPassword?: string): Promise<AuthResponse> => {
    const response = await axiosClient.post<AuthResponse>('/auth/register', {
      fullName,
      email,
      password,
      confirmPassword: confirmPassword || password,
    });
    return response.data;
  },

  getProfile: async (): Promise<AuthResponse> => {
    const response = await axiosClient.get<AuthResponse>('/auth/me');
    return response.data;
  },
};

