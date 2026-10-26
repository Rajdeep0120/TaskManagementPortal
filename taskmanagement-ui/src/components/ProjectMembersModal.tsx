import React, { useState, useEffect, useCallback } from 'react';
import type { Project, ProjectMember, User } from '../types';
import { projectApi } from '../api/projectApi';
import { userApi } from '../api/userApi';
import { useAuth } from '../context/AuthContext';
import { X, Users, UserPlus, Trash2, Calendar, AlertCircle } from 'lucide-react';

interface ProjectMembersModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: Project | null;
  onMembersUpdated?: () => void;
}

export const ProjectMembersModal: React.FC<ProjectMembersModalProps> = ({
  isOpen,
  onClose,
  project,
  onMembersUpdated,
}) => {
  const { isAdmin } = useAuth();
  const [members, setMembers] = useState<ProjectMember[]>([]);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    if (!project) return;
    try {
      setLoading(true);
      setError(null);
      const [membersData, usersData] = await Promise.all([
        projectApi.getMembers(project.id),
        userApi.getAll(),
      ]);
      setMembers(membersData);
      setAllUsers(usersData);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load project members.');
    } finally {
      setLoading(false);
    }
  }, [project]);

  useEffect(() => {
    if (isOpen && project) {
      loadData();
      setSelectedUserId('');
    }
  }, [isOpen, project, loadData]);

  if (!isOpen || !project) return null;

  const availableUsers = allUsers.filter(
    (u) => !members.some((m) => m.userId === u.id)
  );

  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUserId) return;

    try {
      setActionLoading(true);
      setError(null);
      await projectApi.addMember(project.id, selectedUserId);
      setSelectedUserId('');
      await loadData();
      onMembersUpdated?.();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to add member to project.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleRemoveMember = async (userId: string, userName: string) => {
    if (!window.confirm(`Are you sure you want to remove ${userName} from "${project.name}"?`)) {
      return;
    }

    try {
      setActionLoading(true);
      setError(null);
      await projectApi.removeMember(project.id, userId);
      await loadData();
      onMembersUpdated?.();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to remove member.');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="modal-backdrop">
      <div className="modal-content modal-md">
        <div className="modal-header">
          <div className="modal-title-wrap">
            <Users size={20} className="text-primary" />
            <h2>Team Members — {project.name}</h2>
          </div>
          <button className="btn-close" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className="members-modal-body">
          {error && (
            <div className="alert alert-danger">
              <AlertCircle size={16} />
              <span>{error}</span>
            </div>
          )}

          {/* Add Member Form (Admin only) */}
          {isAdmin && (
            <form onSubmit={handleAddMember} className="add-member-form">
              <div className="form-group flex-1">
                <label htmlFor="select-new-member">Add Team Member</label>
                <select
                  id="select-new-member"
                  className="form-input"
                  value={selectedUserId}
                  onChange={(e) => setSelectedUserId(e.target.value)}
                  disabled={actionLoading || availableUsers.length === 0}
                >
                  <option value="">
                    {availableUsers.length === 0
                      ? 'All registered users are already members'
                      : 'Select a user to add...'}
                  </option>
                  {availableUsers.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.fullName} ({u.email}) — {u.role}
                    </option>
                  ))}
                </select>
              </div>
              <button
                type="submit"
                className="btn btn-primary btn-add-member"
                disabled={actionLoading || !selectedUserId}
              >
                <UserPlus size={16} />
                <span>Add</span>
              </button>
            </form>
          )}

          {/* Member List */}
          <div className="members-section-header">
            <h4>Current Members ({members.length})</h4>
          </div>

          {loading ? (
            <div className="flex-center py-8">
              <div className="spinner"></div>
            </div>
          ) : members.length === 0 ? (
            <div className="empty-members">
              <p>No members added to this project yet.</p>
            </div>
          ) : (
            <div className="members-list">
              {members.map((member) => (
                <div key={member.userId} className="member-item">
                  <div className="member-avatar">
                    {member.fullName ? member.fullName.charAt(0).toUpperCase() : 'U'}
                  </div>
                  <div className="member-info">
                    <span className="member-name">{member.fullName || 'Unknown User'}</span>
                    <span className="member-email">{member.email}</span>
                    <span className="member-joined">
                      <Calendar size={12} />
                      Joined {new Date(member.joinedAt).toLocaleDateString()}
                    </span>
                  </div>
                  {isAdmin && (
                    <button
                      className="btn-icon-danger"
                      title={`Remove ${member.fullName || 'user'}`}
                      disabled={actionLoading}
                      onClick={() => handleRemoveMember(member.userId, member.fullName || 'user')}
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="modal-actions">
          <button type="button" className="btn btn-secondary" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

