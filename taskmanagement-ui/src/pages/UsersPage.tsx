import React, { useState, useEffect, useCallback } from 'react';
import { userApi } from '../api/userApi';
import { useAuth } from '../context/AuthContext';
import type { User } from '../types';
import {
  Users,
  Shield,
  Trash2,
  Search,
  AlertCircle,
  CheckCircle2,
  Mail,
  UserCheck
} from 'lucide-react';

export const UsersPage: React.FC = () => {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  const loadUsers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await userApi.getAll();
      setUsers(data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load users.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  const handleRoleChange = async (targetUser: User, newRoleNum: number) => {
    const roleName = newRoleNum === 1 ? 'Admin' : 'Member';
    if (!window.confirm(`Change role of "${targetUser.fullName}" to ${roleName}?`)) {
      return;
    }

    try {
      setActionLoadingId(targetUser.id);
      setError(null);
      setSuccess(null);
      await userApi.updateRole(targetUser.id, newRoleNum);
      setSuccess(`Updated role for ${targetUser.fullName} to ${roleName}.`);
      await loadUsers();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update user role.');
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleDeleteUser = async (targetUser: User) => {
    if (
      !window.confirm(
        `Are you sure you want to permanently delete user "${targetUser.fullName}" (${targetUser.email})?`
      )
    ) {
      return;
    }

    try {
      setActionLoadingId(targetUser.id);
      setError(null);
      setSuccess(null);
      await userApi.delete(targetUser.id);
      setSuccess(`User "${targetUser.fullName}" has been deleted.`);
      await loadUsers();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to delete user.');
    } finally {
      setActionLoadingId(null);
    }
  };

  const filteredUsers = users.filter(
    (u) =>
      u.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const adminCount = users.filter((u) => u.role === 'Admin').length;
  const memberCount = users.filter((u) => u.role === 'Member').length;

  return (
    <div className="page-container">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">User & Role Management</h1>
          <p className="page-subtitle">
            Manage system users, assign administrative privileges, and control account access.
          </p>
        </div>
      </div>

      {/* Metric Highlights */}
      <div className="metrics-grid">
        <div className="metric-card">
          <div className="metric-icon-wrap bg-blue-100 text-blue-600">
            <Users size={22} />
          </div>
          <div className="metric-content">
            <span className="metric-label">Total Users</span>
            <span className="metric-value">{users.length}</span>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon-wrap bg-purple-100 text-purple-600">
            <Shield size={22} />
          </div>
          <div className="metric-content">
            <span className="metric-label">Admins</span>
            <span className="metric-value">{adminCount}</span>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon-wrap bg-emerald-100 text-emerald-600">
            <UserCheck size={22} />
          </div>
          <div className="metric-content">
            <span className="metric-label">Members</span>
            <span className="metric-value">{memberCount}</span>
          </div>
        </div>
      </div>

      {/* Notifications */}
      {error && (
        <div className="alert alert-danger mb-4">
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="alert alert-success mb-4">
          <CheckCircle2 size={18} />
          <span>{success}</span>
        </div>
      )}

      {/* Search and Filters */}
      <div className="filter-bar">
        <div className="search-input-wrap">
          <Search size={18} className="search-icon" />
          <input
            type="text"
            placeholder="Search users by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="form-input search-input"
          />
        </div>
      </div>

      {/* Users Table */}
      {loading ? (
        <div className="flex-center py-16">
          <div className="spinner"></div>
        </div>
      ) : filteredUsers.length === 0 ? (
        <div className="empty-state">
          <Users size={48} className="empty-icon" />
          <h3>No users found</h3>
          <p>No registered users match your search criteria.</p>
        </div>
      ) : (
        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th>User</th>
                <th>Email</th>
                <th>Role</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((u) => {
                const isCurrent = u.id === currentUser?.id;
                const isActionLoading = actionLoadingId === u.id;

                return (
                  <tr key={u.id}>
                    <td>
                      <div className="user-cell">
                        <div className="member-avatar">
                          {u.fullName ? u.fullName.charAt(0).toUpperCase() : 'U'}
                        </div>
                        <div className="user-cell-meta">
                          <span className="font-semibold text-color">
                            {u.fullName}
                            {isCurrent && <span className="you-pill">You</span>}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="flex-center-left gap-2 text-muted">
                        <Mail size={14} />
                        <span>{u.email}</span>
                      </div>
                    </td>
                    <td>
                      {isCurrent ? (
                        <span className="role-badge admin">Admin</span>
                      ) : (
                        <select
                          className="form-input select-role"
                          value={u.role === 'Admin' ? 1 : 0}
                          disabled={isActionLoading}
                          onChange={(e) =>
                            handleRoleChange(u, parseInt(e.target.value, 10))
                          }
                        >
                          <option value={0}>Member</option>
                          <option value={1}>Admin</option>
                        </select>
                      )}
                    </td>
                    <td>
                      {isCurrent ? (
                        <span className="text-muted text-xs italic">Protected (Logged In)</span>
                      ) : (
                        <button
                          type="button"
                          className="btn btn-outline-danger btn-sm"
                          title={`Delete ${u.fullName}`}
                          disabled={isActionLoading}
                          onClick={() => handleDeleteUser(u)}
                        >
                          <Trash2 size={15} />
                          <span>Delete</span>
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
