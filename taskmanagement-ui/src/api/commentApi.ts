import { axiosClient } from './axiosClient';
import type { TaskComment } from '../types';

export const commentApi = {
  getByTaskId: async (taskId: string): Promise<TaskComment[]> => {
    const response = await axiosClient.get<TaskComment[]>(`/tasks/${taskId}/comments`);
    return response.data;
  },

  create: async (taskId: string, content: string): Promise<TaskComment> => {
    const response = await axiosClient.post<TaskComment>(`/tasks/${taskId}/comments`, { content });
    return response.data;
  },

  delete: async (taskId: string, commentId: string): Promise<void> => {
    await axiosClient.delete(`/tasks/${taskId}/comments/${commentId}`);
  },
};

