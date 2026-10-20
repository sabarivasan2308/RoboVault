import React, { useState, useEffect } from 'react';
import { maintenanceApi } from '../api/maintenanceApi';
import { assetApi } from '../api/assetApi';
import StatusBadge from '../components/StatusBadge';
import Pagination from '../components/Pagination';
import EmptyState from '../components/EmptyState';
import { useAuth } from '../auth/AuthContext';
import { Plus, Wrench, CheckCircle } from 'lucide-react';

export const MaintenancePage = () => {
  const { hasRole } = useAuth();
  const [records, setRecords] = useState([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');
  const [loading, setLoading] = useState(true);

  const [assets, setAssets] = useState([]);
  const [showLogModal, setShowLogModal] = useState(false);
  const [showResolveModal, setShowResolveModal] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);

  const [newLog, setNewLog] = useState({
    assetId: '',
    problemDescription: '',
    maintenanceType: 'CORRECTIVE',
    priority: 'MEDIUM',
    assignedTechnician: 'Alex Rivera'
  });

  const [resolveData, setResolveData] = useState({
    resolutionDetails: '',
    partsReplaced: '',
    repairCost: 0
  });

  useEffect(() => {
    fetchRecords();
  }, [page, statusFilter]);

  const fetchRecords = async () => {
    setLoading(true);
    try {
      const res = await maintenanceApi.getRecords(page, 15, statusFilter);
      if (res) {
        setRecords(res.content || []);
        setTotalPages(res.totalPages || 1);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const openLogModal = async () => {
    try {
      const all = await assetApi.getAll();
      setAssets(all);
      if (all.length > 0) {
        setNewLog(prev => ({ ...prev, assetId: all[0].assetId }));
      }
      setShowLogModal(true);
    } catch (e) {
      alert("Error loading assets: " + e.message);
    }
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    try {
      await maintenanceApi.create(newLog);
      setShowLogModal(false);
      fetchRecords();
    } catch (err) {
      alert("Error logging maintenance: " + (err.response?.data?.message || err.message));
    }
  };

  const handleResolveSubmit = async (e) => {
    e.preventDefault();
    try {
      await maintenanceApi.resolve(
        selectedRecord.id,
        resolveData.resolutionDetails,
        resolveData.partsReplaced,
        resolveData.repairCost
      );
      setShowResolveModal(false);
      fetchRecords();
    } catch (err) {
      alert("Error resolving record: " + (err.response?.data?.message || err.message));
    }
  };

  const handleClose = async (id) => {
    if (window.confirm("Verify and close maintenance ticket? Equipment will be restored to active inventory.")) {
      try {
        await maintenanceApi.close(id);
        fetchRecords();
      } catch (err) {
        alert("Error closing ticket: " + (err.response?.data?.message || err.message));
      }
    }
  };

  return (
    <div>
      <div className="control-bar">
        <div>
          <h2 style={{ fontSize: '1.2rem', fontWeight: 700 }}>Diagnostics, Repairs & Calibration</h2>
          <p style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
            Lifecycle: OPEN → DIAGNOSING → IN_PROGRESS → RESOLVED → CLOSED (Restored to stock)
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <select
            className="form-control"
            style={{ width: 'auto', padding: '8px 12px' }}
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setPage(0); }}
          >
            <option value="">All Stages</option>
            <option value="OPEN">OPEN</option>
            <option value="DIAGNOSING">DIAGNOSING</option>
            <option value="IN_PROGRESS">IN_PROGRESS</option>
            <option value="RESOLVED">RESOLVED</option>
            <option value="CLOSED">CLOSED</option>
          </select>

          {hasRole(['ADMIN', 'LAB_ASSISTANT']) && (
            <button className="btn btn-primary" onClick={openLogModal}>
              <Plus size={16} /> Log Maintenance Case
            </button>
          )}
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Laboratory Service Records</h3>
        </div>

        {loading ? (
          <div style={{ padding: '40px', color: '#94a3b8', textAlign: 'center' }}>Loading maintenance queue...</div>
        ) : records.length === 0 ? (
          <EmptyState message="No maintenance records found." />
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Ticket ID</th>
                <th>Hardware Item</th>
                <th>Problem Description</th>
                <th>Priority</th>
                <th>Technician</th>
                <th>Parts Replaced</th>
                <th>Repair Cost</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {records.map((rec) => (
                <tr key={rec.id}>
                  <td className="mono" style={{ color: '#38bdf8', fontWeight: 600 }}>{rec.maintenanceId}</td>
                  <td>
                    <div style={{ fontWeight: 600 }}>{rec.assetName}</div>
                    <div className="mono" style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{rec.assetId}</div>
                  </td>
                  <td style={{ maxWidth: '240px', fontSize: '0.84rem' }}>{rec.problemDescription}</td>
                  <td><StatusBadge status={rec.priority} /></td>
                  <td>{rec.assignedTechnician || 'Unassigned'}</td>
                  <td style={{ fontSize: '0.8rem' }}>{rec.partsReplaced || 'None'}</td>
                  <td className="mono" style={{ color: '#34d399', fontWeight: 600 }}>
                    ${(rec.repairCost || 0).toFixed(2)}
                  </td>
                  <td><StatusBadge status={rec.status} /></td>
                  <td>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      {rec.status !== 'RESOLVED' && rec.status !== 'CLOSED' && hasRole(['ADMIN', 'LAB_ASSISTANT']) && (
                        <button
                          className="btn btn-secondary"
                          style={{ padding: '4px 8px', fontSize: '0.75rem' }}
                          onClick={() => { setSelectedRecord(rec); setShowResolveModal(true); }}
                        >
                          <Wrench size={14} /> Resolve
                        </button>
                      )}
                      {rec.status === 'RESOLVED' && hasRole(['ADMIN', 'LAB_ASSISTANT']) && (
                        <button
                          className="btn btn-success"
                          style={{ padding: '4px 8px', fontSize: '0.75rem' }}
                          onClick={() => handleClose(rec.id)}
                        >
                          <CheckCircle size={14} /> Close & Restock
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
      </div>

      {/* Log Maintenance Modal */}
      {showLogModal && (
        <div className="modal-overlay">
          <div className="modal-box">
            <div className="modal-header">
              <h3>Log Laboratory Hardware Defect</h3>
              <button onClick={() => setShowLogModal(false)} style={{ background: 'transparent', color: '#94a3b8' }}>✕</button>
            </div>
            <form onSubmit={handleCreateSubmit}>
              <div className="modal-body">
                <div className="form-group">
                  <label>Affected Laboratory Item*</label>
                  <select
                    className="form-control mono"
                    required
                    value={newLog.assetId}
                    onChange={(e) => setNewLog({ ...newLog, assetId: e.target.value })}
                  >
                    {assets.map(a => (
                      <option key={a.assetId} value={a.assetId}>
                        {a.assetId} — {a.name} ({a.status})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-grid-2">
                  <div className="form-group">
                    <label>Maintenance Type</label>
                    <select
                      className="form-control"
                      value={newLog.maintenanceType}
                      onChange={(e) => setNewLog({ ...newLog, maintenanceType: e.target.value })}
                    >
                      <option value="CORRECTIVE">CORRECTIVE (Repair defect)</option>
                      <option value="PREVENTIVE">PREVENTIVE (Routine inspection)</option>
                      <option value="CALIBRATION">CALIBRATION (Precision tuning)</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Priority</label>
                    <select
                      className="form-control"
                      value={newLog.priority}
                      onChange={(e) => setNewLog({ ...newLog, priority: e.target.value })}
                    >
                      <option value="LOW">LOW</option>
                      <option value="MEDIUM">MEDIUM</option>
                      <option value="HIGH">HIGH</option>
                      <option value="CRITICAL">CRITICAL</option>
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label>Assigned Lead Technician</label>
                  <input
                    type="text"
                    className="form-control"
                    value={newLog.assignedTechnician}
                    onChange={(e) => setNewLog({ ...newLog, assignedTechnician: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label>Problem Description & Diagnostic Symptoms*</label>
                  <textarea
                    rows="3"
                    className="form-control"
                    required
                    placeholder="Describe how failure occurred: e.g. voltage drop, cold solder joint, broken gear teeth..."
                    value={newLog.problemDescription}
                    onChange={(e) => setNewLog({ ...newLog, problemDescription: e.target.value })}
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowLogModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Open Service Ticket</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Resolve Maintenance Modal */}
      {showResolveModal && selectedRecord && (
        <div className="modal-overlay">
          <div className="modal-box">
            <div className="modal-header">
              <h3>Resolve Maintenance: {selectedRecord.assetName}</h3>
              <button onClick={() => setShowResolveModal(false)} style={{ background: 'transparent', color: '#94a3b8' }}>✕</button>
            </div>
            <form onSubmit={handleResolveSubmit}>
              <div className="modal-body">
                <div className="form-group">
                  <label>Resolution & Corrective Actions Taken*</label>
                  <textarea
                    rows="3"
                    className="form-control"
                    required
                    placeholder="Detail the repair steps: reflowed solder, recalibrated PID, replaced motor brushes..."
                    value={resolveData.resolutionDetails}
                    onChange={(e) => setResolveData({ ...resolveData, resolutionDetails: e.target.value })}
                  />
                </div>

                <div className="form-grid-2">
                  <div className="form-group">
                    <label>Parts / Components Replaced</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="e.g. BNC Jack, LM2596 IC"
                      value={resolveData.partsReplaced}
                      onChange={(e) => setResolveData({ ...resolveData, partsReplaced: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label>Actual Repair Cost ($)</label>
                    <input
                      type="number"
                      step="0.01"
                      className="form-control"
                      value={resolveData.repairCost}
                      onChange={(e) => setResolveData({ ...resolveData, repairCost: parseFloat(e.target.value) || 0 })}
                    />
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowResolveModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Mark as Resolved</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default MaintenancePage;

