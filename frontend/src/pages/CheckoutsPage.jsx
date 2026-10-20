import React, { useState, useEffect } from 'react';
import { checkoutApi } from '../api/checkoutApi';
import { assetApi } from '../api/assetApi';
import StatusBadge from '../components/StatusBadge';
import Pagination from '../components/Pagination';
import EmptyState from '../components/EmptyState';
import { useAuth } from '../auth/AuthContext';
import { Plus, Check, X, ArrowUpRight, RotateCcw } from 'lucide-react';

export const CheckoutsPage = () => {
  const { user, hasRole } = useAuth();
  const [checkouts, setCheckouts] = useState([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');
  const [loading, setLoading] = useState(true);

  // Available assets for borrow request
  const [availableAssets, setAvailableAssets] = useState([]);

  // Modals
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [showReturnModal, setShowReturnModal] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);

  const [requestData, setRequestData] = useState({
    assetId: '',
    quantity: 1,
    projectName: 'Autonomous Delivery Robot',
    dueDate: new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
    notes: ''
  });

  const [returnCondition, setReturnCondition] = useState('GOOD');
  const [returnRemarks, setReturnRemarks] = useState('');

  useEffect(() => {
    fetchCheckouts();
  }, [page, statusFilter]);

  const fetchCheckouts = async () => {
    setLoading(true);
    try {
      const emailFilter = hasRole(['ADMIN', 'LAB_ASSISTANT']) ? '' : user?.email;
      const res = await checkoutApi.getCheckouts(page, 15, statusFilter, emailFilter);
      if (res) {
        setCheckouts(res.content || []);
        setTotalPages(res.totalPages || 1);
      }
    } catch (e) {
      console.error("Checkouts error:", e);
    } finally {
      setLoading(false);
    }
  };

  const openRequestModal = async () => {
    try {
      const all = await assetApi.getAll();
      const avail = all.filter(a => a.availableQuantity > 0 && a.status === 'AVAILABLE');
      setAvailableAssets(avail);
      if (avail.length > 0) {
        setRequestData(prev => ({ ...prev, assetId: avail[0].assetId }));
      }
      setShowRequestModal(true);
    } catch (e) {
      alert("Error loading available items: " + e.message);
    }
  };

  const handleRequestSubmit = async (e) => {
    e.preventDefault();
    try {
      await checkoutApi.request(requestData);
      setShowRequestModal(false);
      fetchCheckouts();
    } catch (err) {
      alert("Checkout failed: " + (err.response?.data?.message || err.message));
    }
  };

  const handleApprove = async (id) => {
    try {
      await checkoutApi.approve(id);
      fetchCheckouts();
    } catch (err) {
      alert("Approval error: " + (err.response?.data?.message || err.message));
    }
  };

  const handleReject = async (id) => {
    const reason = prompt("Enter mandatory reason for declining request:");
    if (!reason) return;
    try {
      await checkoutApi.reject(id, reason);
      fetchCheckouts();
    } catch (err) {
      alert("Rejection error: " + (err.response?.data?.message || err.message));
    }
  };

  const handleIssue = async (id) => {
    try {
      await checkoutApi.issue(id);
      fetchCheckouts();
    } catch (err) {
      alert("Issue error: " + (err.response?.data?.message || err.message));
    }
  };

  const handleReturnSubmit = async (e) => {
    e.preventDefault();
    try {
      await checkoutApi.returnItem(selectedRecord.id, returnCondition, returnRemarks);
      setShowReturnModal(false);
      fetchCheckouts();
    } catch (err) {
      alert("Return error: " + (err.response?.data?.message || err.message));
    }
  };

  return (
    <div>
      <div className="control-bar">
        <div>
          <h2 style={{ fontSize: '1.2rem', fontWeight: 700 }}>Equipment Custody Lifecycle</h2>
          <p style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
            Request → Faculty/Admin Approval → Lab Handover (IN_USE) → Inspection & Return
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <select
            className="form-control"
            style={{ width: 'auto', padding: '8px 12px' }}
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setPage(0); }}
          >
            <option value="">All Statuses</option>
            <option value="PENDING">PENDING</option>
            <option value="APPROVED">APPROVED</option>
            <option value="ISSUED">ISSUED (In Use)</option>
            <option value="RETURNED">RETURNED</option>
            <option value="REJECTED">REJECTED</option>
          </select>

          <button className="btn btn-primary" onClick={openRequestModal}>
            <Plus size={16} /> New Checkout Request
          </button>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Borrowing & Custody Records</h3>
        </div>

        {loading ? (
          <div style={{ padding: '40px', color: '#94a3b8', textAlign: 'center' }}>Loading custody logs...</div>
        ) : checkouts.length === 0 ? (
          <EmptyState message="No checkout records matching filter criteria." />
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Request ID</th>
                <th>Hardware Item</th>
                <th>Borrower</th>
                <th>Project</th>
                <th>Qty</th>
                <th>Due Date</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {checkouts.map((rec) => (
                <tr key={rec.id}>
                  <td className="mono" style={{ color: '#38bdf8', fontWeight: 600 }}>{rec.requestId}</td>
                  <td>
                    <div style={{ fontWeight: 600 }}>{rec.assetName}</div>
                    <div className="mono" style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{rec.assetId}</div>
                  </td>
                  <td>
                    <div>{rec.userName}</div>
                    <div style={{ fontSize: '0.72rem', color: '#64748b' }}>{rec.userEmail}</div>
                  </td>
                  <td style={{ fontSize: '0.82rem' }}>{rec.projectName || 'General Study'}</td>
                  <td className="mono" style={{ fontWeight: 700 }}>{rec.requestedQuantity}</td>
                  <td className="mono" style={{ color: rec.overdue ? '#fb7185' : '#cbd5e1' }}>
                    {rec.dueDate}
                  </td>
                  <td>
                    <StatusBadge status={rec.status} />
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      {rec.status === 'PENDING' && hasRole(['ADMIN', 'LAB_ASSISTANT', 'FACULTY']) && (
                        <>
                          <button className="btn btn-success" style={{ padding: '4px 8px' }} title="Approve Request" onClick={() => handleApprove(rec.id)}>
                            <Check size={14} />
                          </button>
                          <button className="btn btn-danger" style={{ padding: '4px 8px' }} title="Decline Request" onClick={() => handleReject(rec.id)}>
                            <X size={14} />
                          </button>
                        </>
                      )}

                      {rec.status === 'APPROVED' && hasRole(['ADMIN', 'LAB_ASSISTANT']) && (
                        <button className="btn btn-primary" style={{ padding: '4px 8px', fontSize: '0.75rem' }} onClick={() => handleIssue(rec.id)}>
                          <ArrowUpRight size={14} /> Handover
                        </button>
                      )}

                      {rec.status === 'ISSUED' && hasRole(['ADMIN', 'LAB_ASSISTANT']) && (
                        <button className="btn btn-secondary" style={{ padding: '4px 8px', fontSize: '0.75rem' }} onClick={() => { setSelectedRecord(rec); setShowReturnModal(true); }}>
                          <RotateCcw size={14} /> Receive Return
                        </button>
                      )}

                      {rec.status === 'RETURNED' && (
                        <span style={{ fontSize: '0.75rem', color: '#34d399' }}>✓ Restocked</span>
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

      {/* Checkout Request Modal */}
      {showRequestModal && (
        <div className="modal-overlay">
          <div className="modal-box">
            <div className="modal-header">
              <h3>Equipment Checkout Request</h3>
              <button onClick={() => setShowRequestModal(false)} style={{ background: 'transparent', color: '#94a3b8' }}>✕</button>
            </div>
            <form onSubmit={handleRequestSubmit}>
              <div className="modal-body">
                <div className="form-group">
                  <label>Available Laboratory Equipment*</label>
                  <select
                    className="form-control mono"
                    required
                    value={requestData.assetId}
                    onChange={(e) => setRequestData({ ...requestData, assetId: e.target.value })}
                  >
                    {availableAssets.map(a => (
                      <option key={a.assetId} value={a.assetId}>
                        {a.assetId} — {a.name} ({a.availableQuantity} available in {a.location})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-grid-2">
                  <div className="form-group">
                    <label>Borrow Quantity*</label>
                    <input
                      type="number"
                      className="form-control"
                      min="1"
                      required
                      value={requestData.quantity}
                      onChange={(e) => setRequestData({ ...requestData, quantity: parseInt(e.target.value) || 1 })}
                    />
                  </div>
                  <div className="form-group">
                    <label>Expected Due Date*</label>
                    <input
                      type="date"
                      className="form-control mono"
                      required
                      value={requestData.dueDate}
                      onChange={(e) => setRequestData({ ...requestData, dueDate: e.target.value })}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Associated Research / Capstone Project</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g. Autonomous Delivery Robot"
                    value={requestData.projectName}
                    onChange={(e) => setRequestData({ ...requestData, projectName: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label>Intended Experiment Notes</label>
                  <textarea
                    rows="3"
                    className="form-control"
                    placeholder="Describe laboratory purpose, pin requirements, or testing environment..."
                    value={requestData.notes}
                    onChange={(e) => setRequestData({ ...requestData, notes: e.target.value })}
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowRequestModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={availableAssets.length === 0}>
                  Submit Request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Return Inspection Modal */}
      {showReturnModal && selectedRecord && (
        <div className="modal-overlay">
          <div className="modal-box">
            <div className="modal-header">
              <h3>Equipment Return & Physical Condition Verification</h3>
              <button onClick={() => setShowReturnModal(false)} style={{ background: 'transparent', color: '#94a3b8' }}>✕</button>
            </div>
            <form onSubmit={handleReturnSubmit}>
              <div className="modal-body">
                <p style={{ fontSize: '0.88rem', color: '#94a3b8' }}>
                  Receiving <strong style={{ color: '#fff' }}>{selectedRecord.assetName}</strong> ({selectedRecord.assetId}) from {selectedRecord.userName}.
                </p>

                <div className="form-group">
                  <label>Hardware Physical Condition Inspection*</label>
                  <select
                    className="form-control"
                    value={returnCondition}
                    onChange={(e) => setReturnCondition(e.target.value)}
                  >
                    <option value="GOOD">GOOD — Fully operational & verified</option>
                    <option value="FAIR">FAIR — Operational with minor cosmetic signs</option>
                    <option value="POOR">POOR — Degraded performance</option>
                    <option value="DAMAGED">DAMAGED — Broken pins / burnt traces (Sent to Maintenance)</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Technician Remarks</label>
                  <textarea
                    rows="3"
                    className="form-control"
                    placeholder="Check headers, USB connectors, included cables..."
                    value={returnRemarks}
                    onChange={(e) => setReturnRemarks(e.target.value)}
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowReturnModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Verify Return & Update Stock</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CheckoutsPage;

