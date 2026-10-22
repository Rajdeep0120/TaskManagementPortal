import { axiosClient } from './axiosClient';
import type { TasksPerUserReport } from '../types';

export const reportApi = {
  getTasksPerUser: async (): Promise<TasksPerUserReport[]> => {
    const response = await axiosClient.get<TasksPerUserReport[]>('/reports/tasks-per-user');
    return response.data;
  },
};
