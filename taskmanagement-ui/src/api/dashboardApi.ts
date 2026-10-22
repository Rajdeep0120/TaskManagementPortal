import { axiosClient } from './axiosClient';
import type { DashboardSummary } from '../types';

export const dashboardApi = {
  getSummary: async (projectId?: string): Promise<DashboardSummary> => {
    const response = await axiosClient.get<DashboardSummary>('/dashboard/summary', {
      params: projectId ? { projectId } : undefined,
    });
    return response.data;
  },
};
