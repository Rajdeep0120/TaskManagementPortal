import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { projectApi } from '../api/projectApi';
import { useAuth } from '../context/AuthContext';
import type { Project } from '../types';
import {
  FolderKanban,
  Plus,
  Search,
  Users,
  CheckSquare,
  Edit,
  Trash2,
  Calendar,
  AlertCircle,
  ExternalLink,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { ProjectModal } from '../components/ProjectModal';
import { ProjectMembersModal } from '../components/ProjectMembersModal';
import { useDebounce } from '../hooks/useDebounce';

export const ProjectsPage: React.FC = () => {
  const { isAdmin } = useAuth();
  const navigate = useNavigate();

  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearchTerm = useDebounce(searchTerm, 300);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(6);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [isMembersModalOpen, setIsMembersModalOpen] = useState(false);
  const [membersProject, setMembersProject] = useState<Project | null>(null);

  const loadProjects = async (targetPage = page) => {
    try {
      setLoading(true);
      setError(null);
      const data = await projectApi.getAll(targetPage, pageSize);
      setProjects(data.items);
      setPage(data.page);
      setTotalPages(data.totalPages);
      setTotalCount(data.totalCount);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load projects.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProjects(1);
  }, []);

  const handleCreateOrUpdate = async (data: { name: string; description?: string }) => {
    if (editingProject) {
      await projectApi.update(editingProject.id, data.name, data.description || '');
    } else {
      await projectApi.create(data.name, data.description || '');
    }
    await loadProjects();
    setEditingProject(null);
  };

  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`Are you sure you want to delete project "${name}"? All associated tasks will be removed.`)) {
      return;
    }
    try {
      await projectApi.delete(id);
      await loadProjects();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to delete project.');
    }
  };

  const filteredProjects = projects.filter((p) =>
    p.name.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
    p.description.toLowerCase().includes(debouncedSearchTerm.toLowerCase())
  );

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">Projects</h1>
          <p className="page-subtitle">Manage your organization's workspaces and team initiatives.</p>
        </div>
        {isAdmin && (
          <button
            className="btn btn-primary"
            onClick={() => {
              setEditingProject(null);
              setIsModalOpen(true);
            }}
          >
            <Plus size={18} />
            <span>New Project</span>
          </button>
        )}
      </div>

      {/* Search and Filters */}
      <div className="filter-bar">
        <div className="search-input-wrap">
          <Search size={18} className="search-icon" />
          <input
            type="text"
            placeholder="Search projects..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="form-input search-input"
          />
        </div>
      </div>

      {error && (
        <div className="alert alert-danger">
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      {loading ? (
        <div className="flex-center py-12">
          <div className="spinner"></div>
        </div>
      ) : filteredProjects.length === 0 ? (
        <div className="empty-state">
          <FolderKanban size={48} className="text-muted" />
          <h3>No projects found</h3>
          <p>{searchTerm ? 'Try adjusting your search criteria.' : 'Create your first project to start organizing tasks.'}</p>
          {isAdmin && !searchTerm && (
            <button className="btn btn-primary mt-4" onClick={() => setIsModalOpen(true)}>
              <Plus size={18} />
              <span>Create Project</span>
            </button>
          )}
        </div>
      ) : (
        <div className="projects-grid">
          {filteredProjects.map((project) => (
            <div key={project.id} className="project-card">
              <div className="project-card-header">
                <div className="project-card-title-wrap">
                  <div className="project-avatar">
                    <FolderKanban size={22} />
                  </div>
                  <h3>{project.name}</h3>
                </div>
                {isAdmin && (
                  <div className="card-actions">
                    <button
                      className="btn-icon"
                      title="Edit project"
                      onClick={() => {
                        setEditingProject(project);
                        setIsModalOpen(true);
                      }}
                    >
                      <Edit size={16} />
                    </button>
                    <button
                      className="btn-icon-danger"
                      title="Delete project"
                      onClick={() => handleDelete(project.id, project.name)}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                )}
              </div>

              <p className="project-desc">{project.description || 'No description provided.'}</p>

              <div className="project-card-stats">
                <div className="stat-pill">
                  <CheckSquare size={16} />
                  <span>{project.taskCount} Tasks</span>
                </div>
                <button
                  type="button"
                  className="stat-pill stat-pill-clickable"
                  title="View & manage members"
                  onClick={() => {
                    setMembersProject(project);
                    setIsMembersModalOpen(true);
                  }}
                >
                  <Users size={16} />
                  <span>{project.memberCount} Members</span>
                </button>
                <div className="stat-pill">
                  <Calendar size={16} />
                  <span>{new Date(project.createdAt).toLocaleDateString()}</span>
                </div>
              </div>

              <div className="project-card-footer">
                <button
                  className="btn btn-outline btn-block"
                  onClick={() => navigate(`/board?projectId=${project.id}`)}
                >
                  <span>Open Task Board</span>
                  <ExternalLink size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="pagination">
          <button
            className="btn btn-secondary"
            disabled={page <= 1}
            onClick={() => loadProjects(page - 1)}
          >
            <ChevronLeft size={16} />
            <span>Previous</span>
          </button>
          <span className="pagination-info">
            Page {page} of {totalPages} ({totalCount} total)
          </span>
          <button
            className="btn btn-secondary"
            disabled={page >= totalPages}
            onClick={() => loadProjects(page + 1)}
          >
            <span>Next</span>
            <ChevronRight size={16} />
          </button>
        </div>
      )}

      {/* Project Modal */}
      <ProjectModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingProject(null);
        }}
        onSubmit={handleCreateOrUpdate}
        project={editingProject}
      />

      {/* Project Members Modal */}
      <ProjectMembersModal
        isOpen={isMembersModalOpen}
        onClose={() => {
          setIsMembersModalOpen(false);
          setMembersProject(null);
        }}
        project={membersProject}
        onMembersUpdated={() => loadProjects(page)}
      />
    </div>
  );
};
