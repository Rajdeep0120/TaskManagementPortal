import { axiosClient } from './axiosClient';
import type { User } from '../types';

export const userApi = {
  getAll: async (): Promise<User[]> => {
    const response = await axiosClient.get<User[]>('/users');
    return response.data;
  },

  getById: async (id: string): Promise<User> => {
    const response = await axiosClient.get<User>(`/users/${id}`);
    return response.data;
  },

  updateRole: async (id: string, role: number): Promise<User> => {
    const response = await axiosClient.patch<User>(`/users/${id}/role`, { role });
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await axiosClient.delete(`/users/${id}`);
  },
};

