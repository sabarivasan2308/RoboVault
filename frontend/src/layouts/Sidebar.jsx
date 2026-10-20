import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { 
  LayoutDashboard, 
  Cpu, 
  ClipboardCheck, 
  Wrench, 
  Rocket, 
  AlertTriangle, 
  Users, 
  History, 
  User, 
  LogOut,
  Zap
} from 'lucide-react';

export const Sidebar = () => {
  const { user, logout, hasRole } = useAuth();

  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <div className="brand-icon-box">
          <Zap size={22} />
        </div>
        <div>
          <div className="brand-name">RoboVault</div>
          <div className="brand-subtitle">Robotics Lab Ops</div>
        </div>
      </div>

      <nav className="sidebar-menu">
        <NavLink to="/dashboard" className={({ isActive }) => `nav-link-btn ${isActive ? 'active' : ''}`}>
          <LayoutDashboard size={18} />
          <span>Dashboard</span>
        </NavLink>

        <NavLink to="/assets" className={({ isActive }) => `nav-link-btn ${isActive ? 'active' : ''}`}>
          <Cpu size={18} />
          <span>Assets Catalog</span>
        </NavLink>

        <NavLink to="/checkouts" className={({ isActive }) => `nav-link-btn ${isActive ? 'active' : ''}`}>
          <ClipboardCheck size={18} />
          <span>Equipment Custody</span>
        </NavLink>

        <NavLink to="/maintenance" className={({ isActive }) => `nav-link-btn ${isActive ? 'active' : ''}`}>
          <Wrench size={18} />
          <span>Maintenance & Repairs</span>
        </NavLink>

        <NavLink to="/projects" className={({ isActive }) => `nav-link-btn ${isActive ? 'active' : ''}`}>
          <Rocket size={18} />
          <span>Projects & Allocations</span>
        </NavLink>

        <NavLink to="/faults" className={({ isActive }) => `nav-link-btn ${isActive ? 'active' : ''}`}>
          <AlertTriangle size={18} />
          <span>Fault Reporting</span>
        </NavLink>

        {hasRole(['ADMIN']) && (
          <NavLink to="/users" className={({ isActive }) => `nav-link-btn ${isActive ? 'active' : ''}`}>
            <Users size={18} />
            <span>User Management</span>
          </NavLink>
        )}

        {hasRole(['ADMIN', 'LAB_ASSISTANT']) && (
          <NavLink to="/activity-logs" className={({ isActive }) => `nav-link-btn ${isActive ? 'active' : ''}`}>
            <History size={18} />
            <span>Audit Activity</span>
          </NavLink>
        )}

        <NavLink to="/profile" className={({ isActive }) => `nav-link-btn ${isActive ? 'active' : ''}`}>
          <User size={18} />
          <span>My Profile</span>
        </NavLink>
      </nav>

      <div className="sidebar-user">
        <div>
          <div style={{ fontWeight: 600, color: '#f8fafc' }}>{user?.fullName || 'User'}</div>
          <div style={{ fontSize: '0.72rem', color: '#38bdf8' }}>{user?.role}</div>
        </div>
        <button 
          onClick={logout} 
          title="Sign Out" 
          style={{ background: 'transparent', color: '#f87171', padding: '6px' }}
        >
          <LogOut size={16} />
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
