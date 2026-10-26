export interface User {
  id: string;
  fullName: string;
  email: string;
  role: 'Admin' | 'Member';
}

export interface AuthResponse {
  id: string;
  token: string;
  email: string;
  fullName: string;
  role: 'Admin' | 'Member';
}

export interface Project {
  id: string;
  name: string;
  description: string;
  createdByUserId: string;
  createdByName?: string;
  createdAt: string;
  updatedAt?: string;
  memberCount: number;
  taskCount: number;
}

export interface ProjectMember {
  userId: string;
  fullName: string;
  email: string;
  joinedAt: string;
}

export const TaskItemStatus = {
  ToDo: 0,
  InProgress: 1,
  Done: 2,
} as const;

export type TaskItemStatus = (typeof TaskItemStatus)[keyof typeof TaskItemStatus];

export const TaskPriority = {
  Low: 0,
  Medium: 1,
  High: 2,
} as const;

export type TaskPriority = (typeof TaskPriority)[keyof typeof TaskPriority];

export interface TaskItem {
  id: string;
  title: string;
  description?: string;
  status: TaskItemStatus;
  statusName: string;
  priority: TaskPriority;
  priorityName: string;
  dueDate?: string;
  projectId: string;
  projectName?: string;
  assignedToUserId?: string;
  assignedToName?: string;
  createdByUserId: string;
  createdByName?: string;
  createdAt: string;
  updatedAt?: string;
  commentCount: number;
}

export interface TaskComment {
  id: string;
  content: string;
  taskId: string;
  userId: string;
  userName?: string;
  createdAt: string;
}

export interface DashboardSummary {
  toDoCount: number;
  inProgressCount: number;
  doneCount: number;
  totalCount: number;
}

export interface TasksPerUserReport {
  userId: string;
  fullName: string;
  email: string;
  toDoCount: number;
  inProgressCount: number;
  doneCount: number;
  totalCount: number;
}

export interface PagedResult<T> {
  items: T[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

