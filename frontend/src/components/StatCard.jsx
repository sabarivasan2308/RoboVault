import React from 'react';

export const StatCard = ({ title, value, icon, color = '#38bdf8', subtitle }) => {
  return (
    <div className="stat-card" style={{ borderTop: `3px solid ${color}` }}>
      <div className="stat-card-title">
        <span>{title}</span>
        <span style={{ color }}>{icon}</span>
      </div>
      <div className="stat-card-value" style={{ color }}>
        {value}
      </div>
      {subtitle && <div className="stat-card-sub">{subtitle}</div>}
    </div>
  );
};

export default StatCard;
