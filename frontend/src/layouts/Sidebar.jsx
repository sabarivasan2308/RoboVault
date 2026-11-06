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
  Zap,
  Compass,
  Activity,
  Layers,
  TrendingUp,
  Calendar,
  FileText
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
          <div className="brand-name">ROBO VAULT <span style={{ fontSize: '0.65rem', background: '#0284c7', padding: '1px 5px', borderRadius: '3px', verticalAlign: 'middle' }}>NEXUS</span></div>
          <div className="brand-subtitle">Robotics Intelligence</div>
        </div>
      </div>

      <nav className="sidebar-menu">
        <div className="nav-section-label" style={{ padding: '8px 16px 4px 16px', fontSize: '0.68rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
          Mission Control
        </div>

        <NavLink to="/dashboard" className={({ isActive }) => `nav-link-btn ${isActive ? 'active' : ''}`}>
          <LayoutDashboard size={18} />
          <span>Mission Command</span>
        </NavLink>

        <NavLink to="/fleet-tracker" className={({ isActive }) => `nav-link-btn ${isActive ? 'active' : ''}`}>
          <Compass size={18} />
          <span>Fleet Mission Simulator</span>
        </NavLink>

        <NavLink to="/digital-twin" className={({ isActive }) => `nav-link-btn ${isActive ? 'active' : ''}`}>
          <Layers size={18} />
          <span>Digital Twin Studio</span>
        </NavLink>

        <NavLink to="/fleet-telemetry" className={({ isActive }) => `nav-link-btn ${isActive ? 'active' : ''}`}>
          <Activity size={18} />
          <span>Robot Fleet Telemetry</span>
        </NavLink>

        <NavLink to="/predictive-health" className={({ isActive }) => `nav-link-btn ${isActive ? 'active' : ''}`}>
          <TrendingUp size={18} />
          <span>Predictive Health</span>
        </NavLink>

        <NavLink to="/scheduling" className={({ isActive }) => `nav-link-btn ${isActive ? 'active' : ''}`}>
          <Calendar size={18} />
          <span>Resource Scheduling</span>
        </NavLink>

        <div className="nav-section-label" style={{ padding: '12px 16px 4px 16px', fontSize: '0.68rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
          Hardware & Custody
        </div>

        <NavLink to="/assets" className={({ isActive }) => `nav-link-btn ${isActive ? 'active' : ''}`}>
          <Cpu size={18} />
          <span>Assets & QR Catalog</span>
        </NavLink>

        <NavLink to="/checkouts" className={({ isActive }) => `nav-link-btn ${isActive ? 'active' : ''}`}>
          <ClipboardCheck size={18} />
          <span>Equipment Custody</span>
        </NavLink>

        <NavLink to="/maintenance" className={({ isActive }) => `nav-link-btn ${isActive ? 'active' : ''}`}>
          <Wrench size={18} />
          <span>Maintenance Workbench</span>
        </NavLink>

        <NavLink to="/projects" className={({ isActive }) => `nav-link-btn ${isActive ? 'active' : ''}`}>
          <Rocket size={18} />
          <span>Research Projects</span>
        </NavLink>

        <NavLink to="/faults" className={({ isActive }) => `nav-link-btn ${isActive ? 'active' : ''}`}>
          <AlertTriangle size={18} />
          <span>Fault Reporting</span>
        </NavLink>

        <div className="nav-section-label" style={{ padding: '12px 16px 4px 16px', fontSize: '0.68rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
          Enterprise Intelligence
        </div>

        <NavLink to="/research-intelligence" className={({ isActive }) => `nav-link-btn ${isActive ? 'active' : ''}`}>
          <Zap size={18} />
          <span>Research Scenario Studio</span>
        </NavLink>

        <NavLink to="/reports" className={({ isActive }) => `nav-link-btn ${isActive ? 'active' : ''}`}>
          <FileText size={18} />
          <span>Reporting & CSV Export</span>
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
