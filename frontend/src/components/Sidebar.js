import React from 'react';

const Sidebar = ({ activeTab, setActiveTab, currentUser }) => {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: '📊' },
    { id: 'assets', label: 'Assets Inventory', icon: '🤖' },
    { id: 'checkouts', label: 'Checkout Requests', icon: '📋' },
    { id: 'maintenance', label: 'Maintenance Logs', icon: '🔧' },
    { id: 'projects', label: 'Project Allocations', icon: '🚀' },
    { id: 'faults', label: 'Fault Reports', icon: '⚠️' },
    { id: 'users', label: 'Lab Users', icon: '👥' },
  ];

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <div className="brand-badge">
          <div className="brand-icon">⚡</div>
          <div>
            <div className="brand-title">RoboVault</div>
            <div className="brand-subtitle">Lab & Asset Ops</div>
          </div>
        </div>
      </div>

      <nav className="sidebar-nav">
        {menuItems.map((item) => (
          <button
            key={item.id}
            className={`nav-item ${activeTab === item.id ? 'active' : ''}`}
            onClick={() => setActiveTab(item.id)}
          >
            <span className="nav-icon">{item.icon}</span>
            <span>{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="sidebar-footer">
        <div>Logged in as:</div>
        <div style={{ fontWeight: 600, color: '#f8fafc', marginTop: '2px' }}>
          {currentUser.name}
        </div>
        <div className="role-pill">{currentUser.role}</div>
      </div>
    </aside>
  );
};

export default Sidebar;

