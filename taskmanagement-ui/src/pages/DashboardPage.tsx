import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { dashboardApi } from '../api/dashboardApi';
import { taskApi } from '../api/taskApi';
import { projectApi } from '../api/projectApi';
import { userApi } from '../api/userApi';
import { useAuth } from '../context/AuthContext';
import type { DashboardSummary, TaskItem, Project, User } from '../types';
import {
  CheckCircle2,
  Clock,
  ListTodo,
  TrendingUp,
  FolderKanban,
  Plus,
  ArrowRight,
  AlertCircle
} from 'lucide-react';
import { TaskModal } from '../components/TaskModal';

export const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [recentTasks, setRecentTasks] = useState<TaskItem[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [summaryData, tasksData, projectsData, usersData] = await Promise.all([
        dashboardApi.getSummary(),
        taskApi.getFiltered({ page: 1, pageSize: 5 }),
        projectApi.getAll(1, 100),
        userApi.getAll(),
      ]);

      setSummary(summaryData);
      setRecentTasks(tasksData.items);
      setProjects(projectsData.items);
      setUsers(usersData);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load dashboard data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  const handleCreateTask = async (data: any) => {
    await taskApi.create(data);
    await loadDashboardData();
  };

  if (loading) {
    return (
      <div className="page-container flex-center">
        <div className="spinner"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="page-container">
        <div className="alert alert-danger">
          <AlertCircle size={20} />
          <span>{error}</span>
        </div>
      </div>
    );
  }

  const completionRate = summary && summary.totalCount > 0
    ? Math.round((summary.doneCount / summary.totalCount) * 100)
    : 0;

  return (
    <div className="page-container">
      {/* Welcome & Actions Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Welcome back, {user?.fullName}! 👋</h1>
          <p className="page-subtitle">Here is a quick overview of your team's tasks and project progress.</p>
        </div>
        <div className="header-actions">
          <button className="btn btn-primary" onClick={() => setIsTaskModalOpen(true)}>
            <Plus size={18} />
            <span>New Task</span>
          </button>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="metrics-grid">
        <div className="metric-card metric-total">
          <div className="metric-icon-wrap bg-blue-100 text-blue-600">
            <TrendingUp size={24} />
          </div>
          <div className="metric-content">
            <span className="metric-label">Total Tasks</span>
            <span className="metric-value">{summary?.totalCount ?? 0}</span>
          </div>
          <div className="metric-footer">Across {projects.length} active projects</div>
        </div>

        <div className="metric-card metric-todo">
          <div className="metric-icon-wrap bg-amber-100 text-amber-600">
            <ListTodo size={24} />
          </div>
          <div className="metric-content">
            <span className="metric-label">To Do</span>
            <span className="metric-value">{summary?.toDoCount ?? 0}</span>
          </div>
          <div className="metric-footer">Waiting to be started</div>
        </div>

        <div className="metric-card metric-progress">
          <div className="metric-icon-wrap bg-indigo-100 text-indigo-600">
            <Clock size={24} />
          </div>
          <div className="metric-content">
            <span className="metric-label">In Progress</span>
            <span className="metric-value">{summary?.inProgressCount ?? 0}</span>
          </div>
          <div className="metric-footer">Currently being worked on</div>
        </div>

        <div className="metric-card metric-done">
          <div className="metric-icon-wrap bg-emerald-100 text-emerald-600">
            <CheckCircle2 size={24} />
          </div>
          <div className="metric-content">
            <span className="metric-label">Done</span>
            <span className="metric-value">{summary?.doneCount ?? 0}</span>
          </div>
          <div className="metric-footer">{completionRate}% Completion Rate</div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="dashboard-card progress-card">
        <div className="progress-header">
          <h3>Overall Team Completion</h3>
          <span className="progress-percentage">{completionRate}%</span>
        </div>
        <div className="progress-bar-track">
          <div
            className="progress-bar-fill"
            style={{ width: `${completionRate}%` }}
          ></div>
        </div>
      </div>

      {/* Dashboard 2-column layout */}
      <div className="dashboard-grid">
        {/* Recent Tasks */}
        <div className="dashboard-card">
          <div className="card-header-row">
            <h3>Recent Tasks</h3>
            <button className="link-action" onClick={() => navigate('/board')}>
              <span>View Board</span>
              <ArrowRight size={16} />
            </button>
          </div>

          {recentTasks.length === 0 ? (
            <div className="empty-state-sm">
              <p>No tasks created yet.</p>
            </div>
          ) : (
            <div className="task-list-simple">
              {recentTasks.map((task) => (
                <div key={task.id} className="task-row-simple" onClick={() => navigate('/board')}>
                  <div className="task-row-info">
                    <span className={`status-dot status-dot-${task.statusName.toLowerCase()}`}></span>
                    <span className="task-row-title">{task.title}</span>
                  </div>
                  <div className="task-row-meta">
                    <span className={`priority-badge priority-${task.priorityName.toLowerCase()}`}>
                      {task.priorityName}
                    </span>
                    <span className="text-muted text-sm">{task.projectName}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Projects Overview */}
        <div className="dashboard-card">
          <div className="card-header-row">
            <h3>Projects Overview</h3>
            <button className="link-action" onClick={() => navigate('/projects')}>
              <span>All Projects</span>
              <ArrowRight size={16} />
            </button>
          </div>

          {projects.length === 0 ? (
            <div className="empty-state-sm">
              <p>No projects yet.</p>
            </div>
          ) : (
            <div className="projects-list-simple">
              {projects.map((project) => (
                <div
                  key={project.id}
                  className="project-row-simple"
                  onClick={() => navigate(`/board?projectId=${project.id}`)}
                >
                  <div className="project-row-icon">
                    <FolderKanban size={20} />
                  </div>
                  <div className="project-row-info">
                    <h4>{project.name}</h4>
                    <p>{project.description || 'No description'}</p>
                  </div>
                  <div className="project-row-stats">
                    <span className="badge-count">{project.taskCount} tasks</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Create Task Modal */}
      <TaskModal
        isOpen={isTaskModalOpen}
        onClose={() => setIsTaskModalOpen(false)}
        onSubmit={handleCreateTask}
        projects={projects}
        users={users}
      />
    </div>
  );
};

