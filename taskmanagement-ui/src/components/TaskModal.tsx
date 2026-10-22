import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import type { TaskItem, Project } from '../types';
import { X } from 'lucide-react';

const taskSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters').max(200, 'Title cannot exceed 200 characters'),
  description: z.string().max(2000, 'Description cannot exceed 2000 characters').optional().or(z.literal('')),
  priority: z.coerce.number().min(0).max(2),
  status: z.coerce.number().min(0).max(2).optional(),
  dueDate: z.string().optional().or(z.literal('')),
  projectId: z.string().min(1, 'Please select a project'),
  assignedToUserId: z.string().optional().or(z.literal('')),
});

type TaskFormData = z.infer<typeof taskSchema>;

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: TaskFormData) => Promise<void>;
  task?: TaskItem | null;
  projects: Project[];
  defaultProjectId?: string;
}

export const TaskModal: React.FC<TaskModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  task,
  projects,
  defaultProjectId,
}) => {
  const isEditing = !!task;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<TaskFormData>({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      title: '',
      description: '',
      priority: 1,
      status: 0,
      dueDate: '',
      projectId: defaultProjectId || (projects[0]?.id || ''),
      assignedToUserId: '',
    },
  });

  useEffect(() => {
    if (task) {
      reset({
        title: task.title,
        description: task.description || '',
        priority: task.priority,
        status: task.status,
        dueDate: task.dueDate ? task.dueDate.split('T')[0] : '',
        projectId: task.projectId,
        assignedToUserId: task.assignedToUserId || '',
      });
    } else {
      reset({
        title: '',
        description: '',
        priority: 1,
        status: 0,
        dueDate: '',
        projectId: defaultProjectId || (projects[0]?.id || ''),
        assignedToUserId: '',
      });
    }
  }, [task, defaultProjectId, projects, reset]);

  if (!isOpen) return null;

  const onFormSubmit = async (data: TaskFormData) => {
    try {
      await onSubmit(data);
      onClose();
    } catch (error) {
      console.error('Failed to save task:', error);
    }
  };

  return (
    <div className="modal-backdrop">
      <div className="modal-content">
        <div className="modal-header">
          <h2>{isEditing ? 'Edit Task' : 'Create New Task'}</h2>
          <button className="btn-close" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit(onFormSubmit)} className="form">
          <div className="form-group">
            <label htmlFor="title">Task Title *</label>
            <input
              id="title"
              type="text"
              placeholder="e.g. Implement user authentication"
              className={`form-input ${errors.title ? 'is-invalid' : ''}`}
              {...register('title')}
            />
            {errors.title && <span className="error-message">{errors.title.message}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              rows={3}
              placeholder="Detailed description of the task..."
              className={`form-input ${errors.description ? 'is-invalid' : ''}`}
              {...register('description')}
            />
            {errors.description && <span className="error-message">{errors.description.message}</span>}
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="projectId">Project *</label>
              <select
                id="projectId"
                className={`form-input ${errors.projectId ? 'is-invalid' : ''}`}
                {...register('projectId')}
                disabled={isEditing}
              >
                <option value="">Select project</option>
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
              {errors.projectId && <span className="error-message">{errors.projectId.message}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="priority">Priority</label>
              <select id="priority" className="form-input" {...register('priority')}>
                <option value={0}>Low</option>
                <option value={1}>Medium</option>
                <option value={2}>High</option>
              </select>
            </div>
          </div>

          {isEditing && (
            <div className="form-group">
              <label htmlFor="status">Status</label>
              <select id="status" className="form-input" {...register('status')}>
                <option value={0}>To Do</option>
                <option value={1}>In Progress</option>
                <option value={2}>Done</option>
              </select>
            </div>
          )}

          <div className="form-group">
            <label htmlFor="dueDate">Due Date</label>
            <input
              id="dueDate"
              type="date"
              className="form-input"
              {...register('dueDate')}
            />
          </div>

          <div className="modal-actions">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : isEditing ? 'Save Changes' : 'Create Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
