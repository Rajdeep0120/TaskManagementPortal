import { axiosClient } from './axiosClient';
import type { TaskItem, PagedResult } from '../types';

export interface TaskFilterParams {
  projectId?: string;
  status?: number;
  assignedToUserId?: string;
  dueDateFrom?: string;
  dueDateTo?: string;
  sortBy?: string;
  sortDescending?: boolean;
  page?: number;
  pageSize?: number;
}

export interface CreateTaskPayload {
  title: string;
  description?: string;
  priority: number;
  dueDate?: string;
  projectId: string;
  assignedToUserId?: string;
}

export interface UpdateTaskPayload {
  title: string;
  description?: string;
  status: number;
  priority: number;
  dueDate?: string;
  assignedToUserId?: string;
}

export const taskApi = {
  getFiltered: async (params?: TaskFilterParams): Promise<PagedResult<TaskItem>> => {
    const response = await axiosClient.get<PagedResult<TaskItem>>('/tasks', { params });
    return response.data;
  },

  getById: async (id: string): Promise<TaskItem> => {
    const response = await axiosClient.get<TaskItem>(`/tasks/${id}`);
    return response.data;
  },

  create: async (payload: CreateTaskPayload): Promise<TaskItem> => {
    const response = await axiosClient.post<TaskItem>('/tasks', payload);
    return response.data;
  },

  update: async (id: string, payload: UpdateTaskPayload): Promise<TaskItem> => {
    const response = await axiosClient.put<TaskItem>(`/tasks/${id}`, payload);
    return response.data;
  },

  updateStatus: async (id: string, status: number): Promise<void> => {
    await axiosClient.patch(`/tasks/${id}/status`, { status });
  },

  delete: async (id: string): Promise<void> => {
    await axiosClient.delete(`/tasks/${id}`);
  },
};
