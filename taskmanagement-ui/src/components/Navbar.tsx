import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LayoutDashboard, FolderKanban, CheckSquare, BarChart3, LogOut, UserCircle, Users } from 'lucide-react';

export const Navbar: React.FC = () => {
  const { user, isAdmin, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="navbar">
      <div className="nav-container">
        <div className="nav-left">
          <div className="nav-brand" onClick={() => navigate('/dashboard')}>
            <CheckSquare className="brand-icon" />
            <span>TaskPortal</span>
          </div>

          <nav className="nav-links">
            <NavLink to="/dashboard" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
              <LayoutDashboard size={18} />
              <span>Dashboard</span>
            </NavLink>
            <NavLink to="/projects" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
              <FolderKanban size={18} />
              <span>Projects</span>
            </NavLink>
            <NavLink to="/board" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
              <CheckSquare size={18} />
              <span>Task Board</span>
            </NavLink>
            {isAdmin && (
              <>
                <NavLink to="/reports" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                  <BarChart3 size={18} />
                  <span>Reports</span>
                </NavLink>
                <NavLink to="/users" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                  <Users size={18} />
                  <span>Users</span>
                </NavLink>
              </>
            )}
          </nav>
        </div>

        <div className="nav-right">
          <div className="user-profile">
            <UserCircle size={22} className="user-avatar" />
            <div className="user-info">
              <span className="user-name">{user?.fullName}</span>
              <span className={`role-badge ${isAdmin ? 'admin' : 'member'}`}>
                {user?.role}
              </span>
            </div>
          </div>
          <button onClick={handleLogout} className="btn-logout" title="Sign Out">
            <LogOut size={18} />
            <span>Logout</span>
          </button>
        </div>
      </div>
    </header>
  );
};

