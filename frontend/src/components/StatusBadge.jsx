import React from 'react';

export const StatusBadge = ({ status }) => {
  if (!status) return null;
  const norm = status.toString().toLowerCase().replace(/\s+/g, '_');
  return (
    <span className={`badge badge-${norm}`}>
      <span style={{ fontSize: '8px' }}>●</span> {status.toString().replace('_', ' ')}
    </span>
  );
};

export default StatusBadge;
