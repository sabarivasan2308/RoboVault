import React from 'react';

export const Pagination = ({ currentPage = 0, totalPages = 1, onPageChange }) => {
  if (totalPages <= 1) return null;

  return (
    <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '10px', padding: '16px 20px', borderTop: '1px solid var(--border-color)' }}>
      <button
        className="btn btn-secondary"
        style={{ padding: '6px 12px', fontSize: '0.8rem' }}
        disabled={currentPage === 0}
        onClick={() => onPageChange(currentPage - 1)}
      >
        Previous
      </button>
      <span style={{ fontSize: '0.82rem', color: '#94a3b8' }}>
        Page <strong style={{ color: '#fff' }}>{currentPage + 1}</strong> of {totalPages}
      </span>
      <button
        className="btn btn-secondary"
        style={{ padding: '6px 12px', fontSize: '0.8rem' }}
        disabled={currentPage >= totalPages - 1}
        onClick={() => onPageChange(currentPage + 1)}
      >
        Next
      </button>
    </div>
  );
};

export default Pagination;

