import React from 'react';

const StatusBadge = ({ status }) => {
  const norm = (status || '').toLowerCase().replace('-', '_');
  
  const getBadgeClass = () => {
    switch (norm) {
      case 'available':
        return 'status-badge available';
      case 'in_use':
      case 'issued':
        return 'status-badge in_use';
      case 'reserved':
      case 'requested':
      case 'approved':
        return 'status-badge reserved';
      case 'maintenance':
      case 'in_repair':
      case 'diagnosis':
        return 'status-badge maintenance';
      case 'damaged':
      case 'critical':
      case 'high':
        return 'status-badge damaged';
      case 'overdue':
        return 'status-badge overdue';
      default:
        return 'status-badge available';
    }
  };

  return (
    <span className={getBadgeClass()}>
      <span style={{ fontSize: '8px' }}>●</span> {status}
    </span>
  );
};

export default StatusBadge;

