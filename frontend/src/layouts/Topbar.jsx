import React from 'react';
import { useAuth } from '../auth/AuthContext';

export const Topbar = ({ title = "RoboVault", subtitle = "Laboratory Management Platform" }) => {
  const { user } = useAuth();

  return (
    <header className="topbar">
      <div className="topbar-title">
        <h1>{title}</h1>
        <p>{subtitle}</p>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <div style={{ background: 'var(--bg-tertiary)', padding: '6px 12px', borderRadius: '8px', border: '1px solid var(--border-color)', fontSize: '0.82rem' }}>
          <span style={{ color: '#94a3b8' }}>Department: </span>
          <strong style={{ color: '#fff' }}>{user?.department || 'Robotics Lab'}</strong>
        </div>
      </div>
    </header>
  );
};

export default Topbar;
