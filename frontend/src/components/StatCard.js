import React from 'react';

const StatCard = ({ label, value, icon, color, subtitle }) => {
  return (
    <div className="stat-card" style={{ borderTop: `3px solid ${color || '#0ea5e9'}` }}>
      <div className="stat-header">
        <span className="stat-label">{label}</span>
        <span className="stat-icon">{icon}</span>
      </div>
      <div className="stat-value" style={{ color: color || '#ffffff' }}>
        {value}
      </div>
      {subtitle && <div className="stat-footer">{subtitle}</div>}
    </div>
  );
};

export default StatCard;

