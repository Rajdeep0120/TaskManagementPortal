import React, { useEffect, useState, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { taskApi } from '../api/taskApi';
import { projectApi } from '../api/projectApi';
import { useAuth } from '../context/AuthContext';
import type { TaskItem, Project } from '../types';
import { TaskItemStatus } from '../types';
import {
  Plus,
  Search,
  Calendar,
  MessageSquare,
  AlertCircle,
  ArrowRight,
  ArrowLeft,
  Filter
} from 'lucide-react';
import { TaskModal } from '../components/TaskModal';
import { TaskDetailModal } from '../components/TaskDetailModal';

export const TaskBoardPage: React.FC = () => {
  const { isAdmin } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const urlProjectId = searchParams.get('projectId') || '';

  const [projects, setProjects] = useState<Project[]>([]);
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string>(urlProjectId);
  const [selectedPriority, setSelectedPriority] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('createdat');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modals
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<TaskItem | null>(null);
  const [detailTask, setDetailTask] = useState<TaskItem | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const projectsData = await projectApi.getAll(1, 100);
      setProjects(projectsData.items);

      const filterParams: any = {
        page: 1,
        pageSize: 100,
        sortBy: sortBy,
        sortDescending: sortBy === 'createdat',
      };

      if (selectedProjectId) {
        filterParams.projectId = selectedProjectId;
      }

      if (selectedPriority !== 'all') {
        // filterParams can include priority or we can filter locally
      }

      const tasksData = await taskApi.getFiltered(filterParams);
      setTasks(tasksData.items);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load tasks.');
    } finally {
      setLoading(false);
    }
  }, [selectedProjectId, sortBy, selectedPriority]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleProjectChange = (projectId: string) => {
    setSelectedProjectId(projectId);
    if (projectId) {
      setSearchParams({ projectId });
    } else {
      setSearchParams({});
    }
  };

  const handleStatusChange = async (taskId: string, newStatus: number, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await taskApi.updateStatus(taskId, newStatus);
      setTasks((prev) =>
        prev.map((t) => (t.id === taskId ? { ...t, status: newStatus as TaskItemStatus } : t))
      );
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to update status.');
    }
  };

  const handleCreateOrUpdateTask = async (data: any) => {
    if (editingTask) {
      await taskApi.update(editingTask.id, data);
    } else {
      await taskApi.create(data);
    }
    await loadData();
    setEditingTask(null);
  };

  const handleDeleteTask = async (taskId: string) => {
    try {
      await taskApi.delete(taskId);
      setTasks((prev) => prev.filter((t) => t.id !== taskId));
      setIsDetailOpen(false);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to delete task.');
    }
  };

  // Filter tasks locally by search and priority
  const filteredTasks = tasks.filter((task) => {
    const matchesSearch =
      task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (task.description?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false);

    const matchesPriority =
      selectedPriority === 'all' || task.priority === parseInt(selectedPriority, 10);

    return matchesSearch && matchesPriority;
  });

  const todoTasks = filteredTasks.filter((t) => t.status === TaskItemStatus.ToDo);
  const inProgressTasks = filteredTasks.filter((t) => t.status === TaskItemStatus.InProgress);
  const doneTasks = filteredTasks.filter((t) => t.status === TaskItemStatus.Done);

  const renderTaskCard = (task: TaskItem) => (
    <div
      key={task.id}
      className="task-board-card"
      onClick={() => {
        setDetailTask(task);
        setIsDetailOpen(true);
      }}
    >
      <div className="task-card-top">
        <span className={`priority-badge priority-${task.priorityName.toLowerCase()}`}>
          {task.priorityName}
        </span>
        <span className="task-card-project">{task.projectName}</span>
      </div>

      <h4 className="task-card-title">{task.title}</h4>
      {task.description && <p className="task-card-desc">{task.description}</p>}

      <div className="task-card-bottom">
        <div className="task-card-meta">
          {task.dueDate && (
            <span className="task-card-due">
              <Calendar size={13} />
              {new Date(task.dueDate).toLocaleDateString()}
            </span>
          )}
          <span className="task-card-comments">
            <MessageSquare size={13} />
            {task.commentCount}
          </span>
        </div>

        {/* Quick status transitions */}
        <div className="status-shift-actions" onClick={(e) => e.stopPropagation()}>
          {task.status === TaskItemStatus.ToDo && (
            <button
              className="btn-status-shift"
              title="Move to In Progress"
              onClick={(e) => handleStatusChange(task.id, TaskItemStatus.InProgress, e)}
            >
              <span>Start</span>
              <ArrowRight size={13} />
            </button>
          )}

          {task.status === TaskItemStatus.InProgress && (
            <div className="btn-shift-group">
              <button
                className="btn-status-shift"
                title="Move back to To Do"
                onClick={(e) => handleStatusChange(task.id, TaskItemStatus.ToDo, e)}
              >
                <ArrowLeft size={13} />
              </button>
              <button
                className="btn-status-shift shift-done"
                title="Mark as Done"
                onClick={(e) => handleStatusChange(task.id, TaskItemStatus.Done, e)}
              >
                <span>Done</span>
                <ArrowRight size={13} />
              </button>
            </div>
          )}

          {task.status === TaskItemStatus.Done && (
            <button
              className="btn-status-shift"
              title="Reopen task"
              onClick={(e) => handleStatusChange(task.id, TaskItemStatus.InProgress, e)}
            >
              <ArrowLeft size={13} />
              <span>Reopen</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="page-container">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Task Board</h1>
          <p className="page-subtitle">Interactive Kanban board to track and manage task progression.</p>
        </div>
        <button
          className="btn btn-primary"
          onClick={() => {
            setEditingTask(null);
            setIsTaskModalOpen(true);
          }}
        >
          <Plus size={18} />
          <span>New Task</span>
        </button>
      </div>

      {/* Control Bar: Filter by Project, Priority, Sort & Search */}
      <div className="board-controls">
        <div className="control-group">
          <label htmlFor="filter-project">
            <Filter size={15} /> Project
          </label>
          <select
            id="filter-project"
            className="form-input control-select"
            value={selectedProjectId}
            onChange={(e) => handleProjectChange(e.target.value)}
          >
            <option value="">All Projects</option>
            {projects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </div>

        <div className="control-group">
          <label htmlFor="filter-priority">Priority</label>
          <select
            id="filter-priority"
            className="form-input control-select"
            value={selectedPriority}
            onChange={(e) => setSelectedPriority(e.target.value)}
          >
            <option value="all">All Priorities</option>
            <option value="0">Low</option>
            <option value="1">Medium</option>
            <option value="2">High</option>
          </select>
        </div>

        <div className="control-group">
          <label htmlFor="filter-sort">Sort By</label>
          <select
            id="filter-sort"
            className="form-input control-select"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            <option value="createdat">Newest First</option>
            <option value="duedate">Due Date</option>
            <option value="priority">Priority</option>
            <option value="title">Title (A-Z)</option>
          </select>
        </div>

        <div className="control-group search-group">
          <div className="search-input-wrap">
            <Search size={16} className="search-icon" />
            <input
              type="text"
              placeholder="Search tasks..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="form-input search-input"
            />
          </div>
        </div>
      </div>

      {error && (
        <div className="alert alert-danger">
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      {loading ? (
        <div className="flex-center py-16">
          <div className="spinner"></div>
        </div>
      ) : (
        /* Kanban Columns */
        <div className="kanban-board">
          {/* TO DO COLUMN */}
          <div className="kanban-column column-todo">
            <div className="column-header">
              <div className="column-title-wrap">
                <span className="column-dot dot-todo"></span>
                <h3>To Do</h3>
              </div>
              <span className="column-badge">{todoTasks.length}</span>
            </div>

            <div className="column-body">
              {todoTasks.length === 0 ? (
                <div className="column-empty">
                  <p>No tasks in To Do</p>
                </div>
              ) : (
                todoTasks.map(renderTaskCard)
              )}
            </div>
          </div>

          {/* IN PROGRESS COLUMN */}
          <div className="kanban-column column-progress">
            <div className="column-header">
              <div className="column-title-wrap">
                <span className="column-dot dot-progress"></span>
                <h3>In Progress</h3>
              </div>
              <span className="column-badge">{inProgressTasks.length}</span>
            </div>

            <div className="column-body">
              {inProgressTasks.length === 0 ? (
                <div className="column-empty">
                  <p>No tasks in Progress</p>
                </div>
              ) : (
                inProgressTasks.map(renderTaskCard)
              )}
            </div>
          </div>

          {/* DONE COLUMN */}
          <div className="kanban-column column-done">
            <div className="column-header">
              <div className="column-title-wrap">
                <span className="column-dot dot-done"></span>
                <h3>Done</h3>
              </div>
              <span className="column-badge">{doneTasks.length}</span>
            </div>

            <div className="column-body">
              {doneTasks.length === 0 ? (
                <div className="column-empty">
                  <p>No completed tasks</p>
                </div>
              ) : (
                doneTasks.map(renderTaskCard)
              )}
            </div>
          </div>
        </div>
      )}

      {/* Create / Edit Modal */}
      <TaskModal
        isOpen={isTaskModalOpen}
        onClose={() => {
          setIsTaskModalOpen(false);
          setEditingTask(null);
        }}
        onSubmit={handleCreateOrUpdateTask}
        task={editingTask}
        projects={projects}
        defaultProjectId={selectedProjectId}
      />

      {/* Task Details & Comments Modal */}
      <TaskDetailModal
        isOpen={isDetailOpen}
        onClose={() => {
          setIsDetailOpen(false);
          setDetailTask(null);
        }}
        task={detailTask}
        onEdit={(task) => {
          setIsDetailOpen(false);
          setEditingTask(task);
          setIsTaskModalOpen(true);
        }}
        onDelete={isAdmin ? handleDeleteTask : undefined}
      />
    </div>
  );
};
