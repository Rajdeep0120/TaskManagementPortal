import { axiosClient } from './axiosClient';
import type { Project, ProjectMember, PagedResult } from '../types';

export const projectApi = {
  getAll: async (page = 1, pageSize = 20): Promise<PagedResult<Project>> => {
    const response = await axiosClient.get<PagedResult<Project>>('/projects', {
      params: { page, pageSize },
    });
    return response.data;
  },

  getById: async (id: string): Promise<Project> => {
    const response = await axiosClient.get<Project>(`/projects/${id}`);
    return response.data;
  },

  create: async (name: string, description: string): Promise<Project> => {
    const response = await axiosClient.post<Project>('/projects', { name, description });
    return response.data;
  },

  update: async (id: string, name: string, description: string): Promise<Project> => {
    const response = await axiosClient.put<Project>(`/projects/${id}`, { name, description });
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await axiosClient.delete(`/projects/${id}`);
  },

  getMembers: async (projectId: string): Promise<ProjectMember[]> => {
    const response = await axiosClient.get<ProjectMember[]>(`/projects/${projectId}/members`);
    return response.data;
  },

  addMember: async (projectId: string, userId: string): Promise<void> => {
    await axiosClient.post(`/projects/${projectId}/members`, { userId });
  },

  removeMember: async (projectId: string, userId: string): Promise<void> => {
    await axiosClient.delete(`/projects/${projectId}/members/${userId}`);
  },
};
