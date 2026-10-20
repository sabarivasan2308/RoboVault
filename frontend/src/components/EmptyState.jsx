import React from 'react';

export const EmptyState = ({ message = "No records found", actionText, onAction }) => {
  return (
    <div style={{ textAlign: 'center', padding: '48px 20px', color: '#64748b' }}>
      <div style={{ fontSize: '2rem', marginBottom: '8px' }}>🔍</div>
      <p style={{ fontSize: '0.92rem', color: '#94a3b8' }}>{message}</p>
      {actionText && (
        <button className="btn btn-primary" style={{ marginTop: '16px' }} onClick={onAction}>
          {actionText}
        </button>
      )}
    </div>
  );
};

export default EmptyState;

