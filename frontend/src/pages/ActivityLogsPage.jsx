import React, { useState, useEffect } from 'react';
import { activityApi } from '../api/activityApi';
import EmptyState from '../components/EmptyState';
import Pagination from '../components/Pagination';
import { History, Search, Filter, Eye, X, ShieldCheck } from 'lucide-react';

export default function ActivityLogsPage() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [entityFilter, setEntityFilter] = useState('');
  const [search, setSearch] = useState('');
  const [selectedLog, setSelectedLog] = useState(null);

  useEffect(() => {
    fetchLogs(page);
  }, [page, entityFilter]);

  const fetchLogs = async (pageNum = 0) => {
    try {
      setLoading(true);
      const params = { page: pageNum, size: 25 };
      if (entityFilter) params.entityType = entityFilter;
      const res = await activityApi.getLogs(params);
      setLogs(res?.data?.data?.content || []);
      setTotalPages(res?.data?.data?.totalPages || 1);
      setPage(res?.data?.data?.currentPage || 0);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getActionBadgeClass = (action = '') => {
    if (action.includes('CREATE') || action.includes('ISSUE') || action.includes('RESOLV')) {
      return 'badge-success';
    }
    if (action.includes('DELETE') || action.includes('REJECT') || action.includes('FAULT')) {
      return 'badge-danger';
    }
    if (action.includes('UPDATE') || action.includes('MAINT') || action.includes('ASSIGN')) {
      return 'badge-warning';
    }
    return 'badge-info';
  };

  const filteredLogs = logs.filter((log) => {
    const term = search.toLowerCase();
    return (
      log.action?.toLowerCase().includes(term) ||
      log.performedBy?.toLowerCase().includes(term) ||
      log.entityType?.toLowerCase().includes(term) ||
      log.details?.toLowerCase().includes(term)
    );
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Header */}
      <div>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 700, margin: 0 }}>System Audit & Activity Logs</h1>
        <p style={{ color: 'var(--text-muted)', margin: '0.25rem 0 0 0' }}>
          Immutable activity trail recording equipment movements, security events, and approvals
        </p>
      </div>

      {/* Filter and Search */}
      <div className="card" style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: '240px' }}>
          <input
            type="text"
            placeholder="Search activity by action, user, or details..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="form-control"
          />
        </div>
        <select
          value={entityFilter}
          onChange={(e) => { setEntityFilter(e.target.value); setPage(0); }}
          className="form-control"
          style={{ width: '180px' }}
        >
          <option value="">All Entities</option>
          <option value="ASSET">Assets</option>
          <option value="CHECKOUT">Checkouts</option>
          <option value="MAINTENANCE">Maintenance</option>
          <option value="PROJECT">Projects</option>
          <option value="FAULT">Faults</option>
          <option value="USER">Users</option>
        </select>
      </div>

      {/* Audit Log Table */}
      {loading ? (
        <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>Loading audit logs...</div>
      ) : filteredLogs.length === 0 ? (
        <EmptyState
          icon={History}
          title="No activity recorded"
          description="Activity logs will appear here when assets, checkouts, or repairs are updated."
        />
      ) : (
        <div className="table-responsive">
          <table className="table">
            <thead>
              <tr>
                <th>Timestamp</th>
                <th>Action</th>
                <th>Entity</th>
                <th>Operator</th>
                <th>Event Description</th>
                <th style={{ textAlign: 'right' }}>Payload</th>
              </tr>
            </thead>
            <tbody>
              {filteredLogs.map((log) => (
                <tr key={log.id}>
                  <td style={{ fontSize: '0.8rem', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                    {log.timestamp ? new Date(log.timestamp).toLocaleString() : 'N/A'}
                  </td>
                  <td>
                    <span className={`badge ${getActionBadgeClass(log.action)}`} style={{ fontSize: '0.75rem', fontWeight: 600 }}>
                      {log.action}
                    </span>
                  </td>
                  <td>
                    <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--primary)' }}>
                      {log.entityType || 'SYSTEM'}
                    </span>
                    {log.entityId && (
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>#{log.entityId.substring(0, 10)}</div>
                    )}
                  </td>
                  <td>
                    <span style={{ fontWeight: 600, fontSize: '0.85rem' }}>{log.performedBy || 'System'}</span>
                  </td>
                  <td style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', maxWidth: '320px' }}>
                    {log.details || 'Action completed successfully.'}
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <button
                      className="btn btn-outline"
                      style={{ padding: '0.2rem 0.5rem', fontSize: '0.75rem' }}
                      onClick={() => setSelectedLog(log)}
                    >
                      <Eye size={13} />
                      <span>Inspect</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <Pagination
            currentPage={page}
            totalPages={totalPages}
            onPageChange={(p) => setPage(p)}
          />
        </div>
      )}

      {/* Inspect Log Modal */}
      {selectedLog && (
        <div className="modal-backdrop">
          <div className="modal-content" style={{ maxWidth: '520px' }}>
            <div className="modal-header">
              <h2 style={{ fontSize: '1.25rem', fontWeight: 600, margin: 0 }}>Audit Entry: {selectedLog.action}</h2>
              <button onClick={() => setSelectedLog(null)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>
            <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.8rem', fontSize: '0.85rem' }}>
                <div><strong>Timestamp:</strong> {new Date(selectedLog.timestamp).toLocaleString()}</div>
                <div><strong>Operator:</strong> {selectedLog.performedBy}</div>
                <div><strong>Entity Type:</strong> {selectedLog.entityType}</div>
                <div><strong>Entity ID:</strong> {selectedLog.entityId || 'N/A'}</div>
              </div>

              <div>
                <strong>Event Message:</strong>
                <p style={{ marginTop: '0.3rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>{selectedLog.details}</p>
              </div>

              {selectedLog.metadata && Object.keys(selectedLog.metadata).length > 0 && (
                <div>
                  <strong>Metadata / Snapshot:</strong>
                  <pre style={{
                    background: 'var(--bg-card)',
                    padding: '0.75rem',
                    borderRadius: '4px',
                    border: '1px solid var(--border)',
                    fontSize: '0.8rem',
                    overflowX: 'auto',
                    marginTop: '0.3rem'
                  }}>
                    {JSON.stringify(selectedLog.metadata, null, 2)}
                  </pre>
                </div>
              )}
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-outline" onClick={() => setSelectedLog(null)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
