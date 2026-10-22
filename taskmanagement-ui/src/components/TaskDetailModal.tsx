import React, { useState, useEffect, useCallback } from 'react';
import type { TaskItem, TaskComment } from '../types';
import { commentApi } from '../api/commentApi';
import { useAuth } from '../context/AuthContext';
import { X, MessageSquare, Trash2, Calendar, User, Tag, Clock } from 'lucide-react';

interface TaskDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  task: TaskItem | null;
  onEdit: (task: TaskItem) => void;
  onDelete?: (taskId: string) => void;
}

export const TaskDetailModal: React.FC<TaskDetailModalProps> = ({
  isOpen,
  onClose,
  task,
  onEdit,
  onDelete,
}) => {
  const { user, isAdmin } = useAuth();
  const [comments, setComments] = useState<TaskComment[]>([]);
  const [commentText, setCommentText] = useState('');
  const [loadingComments, setLoadingComments] = useState(false);
  const [submittingComment, setSubmittingComment] = useState(false);

  const loadComments = useCallback(async () => {
    if (!task) return;
    try {
      setLoadingComments(true);
      const data = await commentApi.getByTaskId(task.id);
      setComments(data);
    } catch (err) {
      console.error('Failed to load comments:', err);
    } finally {
      setLoadingComments(false);
    }
  }, [task]);

  useEffect(() => {
    if (isOpen && task) {
      loadComments();
    }
  }, [isOpen, task, loadComments]);

  if (!isOpen || !task) return null;

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    try {
      setSubmittingComment(true);
      await commentApi.create(task.id, commentText.trim());
      setCommentText('');
      await loadComments();
    } catch (err) {
      console.error('Failed to add comment:', err);
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    if (!window.confirm('Are you sure you want to delete this comment?')) return;
    try {
      await commentApi.delete(task.id, commentId);
      setComments((prev) => prev.filter((c) => c.id !== commentId));
    } catch (err) {
      console.error('Failed to delete comment:', err);
    }
  };

  return (
    <div className="modal-backdrop">
      <div className="modal-content modal-lg">
        <div className="modal-header">
          <div className="modal-title-wrap">
            <span className={`status-badge status-${task.statusName.toLowerCase()}`}>
              {task.statusName}
            </span>
            <h2>{task.title}</h2>
          </div>
          <button className="btn-close" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className="task-detail-body">
          <div className="task-detail-meta">
            <div className="meta-item">
              <Tag size={16} />
              <span>Project: <strong>{task.projectName || 'General'}</strong></span>
            </div>
            <div className="meta-item">
              <span className={`priority-badge priority-${task.priorityName.toLowerCase()}`}>
                Priority: {task.priorityName}
              </span>
            </div>
            {task.dueDate && (
              <div className="meta-item">
                <Calendar size={16} />
                <span>Due: {new Date(task.dueDate).toLocaleDateString()}</span>
              </div>
            )}
            <div className="meta-item">
              <User size={16} />
              <span>Created by: {task.createdByName || 'Unknown'}</span>
            </div>
          </div>

          <div className="task-detail-desc">
            <h4>Description</h4>
            <p>{task.description || 'No description provided.'}</p>
          </div>

          <hr className="divider" />

          {/* Comments Section */}
          <div className="comments-section">
            <div className="comments-header">
              <MessageSquare size={18} />
              <h4>Comments ({comments.length})</h4>
            </div>

            <form onSubmit={handleAddComment} className="comment-form">
              <textarea
                rows={2}
                placeholder="Write a comment..."
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                className="form-input"
              />
              <button
                type="submit"
                className="btn btn-primary btn-sm"
                disabled={submittingComment || !commentText.trim()}
              >
                {submittingComment ? 'Posting...' : 'Post Comment'}
              </button>
            </form>

            <div className="comments-list">
              {loadingComments ? (
                <div className="spinner-sm"></div>
              ) : comments.length === 0 ? (
                <p className="empty-hint">No comments yet. Be the first to chime in!</p>
              ) : (
                comments.map((comment) => (
                  <div key={comment.id} className="comment-card">
                    <div className="comment-meta">
                      <span className="comment-author">{comment.userName || 'Team Member'}</span>
                      <span className="comment-time">
                        <Clock size={12} />
                        {new Date(comment.createdAt).toLocaleString()}
                      </span>
                      {(comment.userId === user?.id || isAdmin) && (
                        <button
                          onClick={() => handleDeleteComment(comment.id)}
                          className="btn-icon-danger"
                          title="Delete comment"
                        >
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>
                    <p className="comment-content">{comment.content}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        <div className="modal-actions">
          {isAdmin && onDelete && (
            <button
              type="button"
              className="btn btn-danger"
              onClick={() => {
                onDelete(task.id);
                onClose();
              }}
            >
              Delete Task
            </button>
          )}
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => {
              onClose();
              onEdit(task);
            }}
          >
            Edit Task
          </button>
          <button type="button" className="btn btn-primary" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
