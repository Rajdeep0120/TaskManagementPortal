import React, { useEffect, useState } from 'react';
import { reportApi } from '../api/reportApi';
import type { TasksPerUserReport } from '../types';
import { BarChart3, RefreshCw, AlertCircle, User } from 'lucide-react';

export const ReportsPage: React.FC = () => {
  const [reports, setReports] = useState<TasksPerUserReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadReport = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await reportApi.getTasksPerUser();
      setReports(data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load report data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReport();
  }, []);

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">Tasks Per User Report</h1>
          <p className="page-subtitle">
            Admin reporting dashboard powered by a high-performance raw SQL query executed via Dapper.
          </p>
        </div>
        <button className="btn btn-outline" onClick={loadReport} disabled={loading}>
          <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          <span>Refresh Report</span>
        </button>
      </div>

      {error && (
        <div className="alert alert-danger">
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      {/* SQL Query explanation banner */}
      {/* <div className="info-banner">
        <div className="info-badge">Dapper + Raw PostgreSQL Query</div>
        <p>
          Aggregates task status counts per user using conditional <code>COUNT(CASE WHEN ...)</code> groupings across the <code>Users</code> and <code>Tasks</code> tables.
        </p>
      </div> */}

      {loading ? (
        <div className="flex-center py-16">
          <div className="spinner"></div>
        </div>
      ) : reports.length === 0 ? (
        <div className="empty-state">
          <BarChart3 size={48} className="text-muted" />
          <h3>No report data available</h3>
          <p>Assign tasks to users to see workload distribution here.</p>
        </div>
      ) : (
        <div className="table-card">
          <table className="data-table">
            <thead>
              <tr>
                <th>Team Member</th>
                <th>Email</th>
                <th className="text-center">To Do</th>
                <th className="text-center">In Progress</th>
                <th className="text-center">Done</th>
                <th className="text-center">Total Assigned</th>
                <th>Workload & Completion</th>
              </tr>
            </thead>
            <tbody>
              {reports.map((row) => {
                const completionRate = row.totalCount > 0
                  ? Math.round((row.doneCount / row.totalCount) * 100)
                  : 0;

                return (
                  <tr key={row.userId}>
                    <td>
                      <div className="user-table-cell">
                        <div className="avatar-circle">
                          <User size={16} />
                        </div>
                        <span className="font-semibold">{row.fullName}</span>
                      </div>
                    </td>
                    <td className="text-muted">{row.email}</td>
                    <td className="text-center">
                      <span className="badge-pill bg-amber-50 text-amber-700">
                        {row.toDoCount}
                      </span>
                    </td>
                    <td className="text-center">
                      <span className="badge-pill bg-indigo-50 text-indigo-700">
                        {row.inProgressCount}
                      </span>
                    </td>
                    <td className="text-center">
                      <span className="badge-pill bg-emerald-50 text-emerald-700">
                        {row.doneCount}
                      </span>
                    </td>
                    <td className="text-center font-bold">
                      {row.totalCount}
                    </td>
                    <td>
                      <div className="progress-cell">
                        <div className="progress-track-sm">
                          <div
                            className="progress-fill-sm"
                            style={{ width: `${completionRate}%` }}
                          ></div>
                        </div>
                        <span className="text-xs text-muted font-medium">
                          {completionRate}% ({row.doneCount}/{row.totalCount})
                        </span>
                      </div>
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
