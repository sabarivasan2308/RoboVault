import React, { useState, useEffect } from 'react';
import StatusBadge from '../components/StatusBadge';
import { checkoutApi, assetApi } from '../services/api';

const CheckoutsPage = ({ currentUser }) => {
  const [checkouts, setCheckouts] = useState([]);
  const [availableAssets, setAvailableAssets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [showReturnModal, setShowReturnModal] = useState(false);
  const [selectedCheckout, setSelectedCheckout] = useState(null);

  const [returnCondition, setReturnCondition] = useState('GOOD');
  const [returnRemarks, setReturnRemarks] = useState('');

  const [requestData, setRequestData] = useState({
    assetId: '',
    userName: currentUser.name,
    userEmail: currentUser.email,
    purpose: '',
    expectedReturnDate: '',
    projectName: ''
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await checkoutApi.getAll();
      setCheckouts(data);
      const assets = await assetApi.getAll();
      setAvailableAssets(assets.filter(a => a.status === 'AVAILABLE'));
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleRequestSubmit = async (e) => {
    e.preventDefault();
    try {
      await checkoutApi.request(requestData);
      setShowRequestModal(false);
      loadData();
    } catch (e) {
      alert("Error submitting checkout request: " + (e.response?.data?.message || e.message));
    }
  };

  const handleApprove = async (id) => {
    try {
      await checkoutApi.approve(id, currentUser.name);
      loadData();
    } catch (e) {
      alert("Error approving checkout: " + e.message);
    }
  };

  const handleIssue = async (id) => {
    try {
      await checkoutApi.issue(id, currentUser.name);
      loadData();
    } catch (e) {
      alert("Error issuing equipment: " + e.message);
    }
  };

  const handleReturnSubmit = async (e) => {
    e.preventDefault();
    try {
      await checkoutApi.returnItem(selectedCheckout.id, returnCondition, returnRemarks);
      setShowReturnModal(false);
      loadData();
    } catch (e) {
      alert("Error processing return: " + e.message);
    }
  };

  return (
    <div className="page-content">
      <div className="control-bar">
        <div>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Equipment Custody & Borrowing</h2>
          <p style={{ fontSize: '0.82rem', color: '#94a3b8' }}>
            Multi-stage custody lifecycle: Request → Approval → Handover → Return & Condition Verification
          </p>
        </div>

        <button className="btn-primary" onClick={() => {
          setRequestData({
            assetId: availableAssets[0]?.assetId || '',
            userName: currentUser.name,
            userEmail: currentUser.email,
            purpose: '',
            expectedReturnDate: new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
            projectName: 'Autonomous Delivery Robot'
          });
          setShowRequestModal(true);
        }}>
          <span>+</span> Request Hardware Checkout
        </button>
      </div>

      <div className="table-card">
        <div className="table-header-title">
          <h3>Active & Historical Checkout Records</h3>
        </div>

        {loading ? (
          <div style={{ padding: '24px', color: '#94a3b8' }}>Loading records...</div>
        ) : (
          <table className="responsive-table">
            <thead>
              <tr>
                <th>Asset ID / Name</th>
                <th>Requested By</th>
                <th>Project</th>
                <th>Purpose</th>
                <th>Due Date</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {checkouts.map((rec) => (
                <tr key={rec.id}>
                  <td>
                    <div className="mono-font" style={{ fontWeight: 700, color: '#38bdf8' }}>{rec.assetId}</div>
                    <div style={{ fontSize: '0.85rem' }}>{rec.assetName}</div>
                  </td>
                  <td>
                    <div>{rec.userName}</div>
                    <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{rec.userEmail}</div>
                  </td>
                  <td>{rec.projectName || 'Individual Lab Study'}</td>
                  <td style={{ maxWidth: '200px', fontSize: '0.85rem' }}>{rec.purpose}</td>
                  <td className="mono-font" style={{ fontSize: '0.85rem' }}>{rec.expectedReturnDate}</td>
                  <td>
                    <StatusBadge status={rec.status} />
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      {rec.status === 'REQUESTED' && (currentUser.role === 'ADMIN' || currentUser.role === 'ASSISTANT') && (
                        <button className="btn-success" onClick={() => handleApprove(rec.id)}>
                          Approve
                        </button>
                      )}
                      {(rec.status === 'APPROVED' || rec.status === 'REQUESTED') && (currentUser.role === 'ADMIN' || currentUser.role === 'ASSISTANT') && (
                        <button className="btn-primary" style={{ padding: '6px 10px', fontSize: '0.8rem' }} onClick={() => handleIssue(rec.id)}>
                          Issue
                        </button>
                      )}
                      {rec.status === 'ISSUED' && (
                        <button className="btn-secondary" style={{ padding: '6px 10px', fontSize: '0.8rem' }} onClick={() => {
                          setSelectedCheckout(rec);
                          setShowReturnModal(true);
                        }}>
                          Process Return
                        </button>
                      )}
                      {rec.status === 'RETURNED' && (
                        <span style={{ fontSize: '0.8rem', color: '#10b981' }}>✓ Returned ({rec.returnCondition || 'GOOD'})</span>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Checkout Request Modal */}
      {showRequestModal && (
        <div className="modal-overlay">
          <div className="modal-card">
            <div className="modal-header">
              <h3>Equipment Checkout Request</h3>
              <button className="close-btn" onClick={() => setShowRequestModal(false)}>✕</button>
            </div>
            <form onSubmit={handleRequestSubmit}>
              <div className="modal-body">
                <div className="form-group">
                  <label>Select Available Hardware Item*</label>
                  <select
                    className="form-control mono-font"
                    required
                    value={requestData.assetId}
                    onChange={(e) => setRequestData({ ...requestData, assetId: e.target.value })}
                  >
                    {availableAssets.length === 0 ? (
                      <option value="">No assets currently marked as AVAILABLE</option>
                    ) : (
                      availableAssets.map(a => (
                        <option key={a.assetId} value={a.assetId}>
                          {a.assetId} - {a.name} ({a.location})
                        </option>
                      ))
                    )}
                  </select>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Borrower Name*</label>
                    <input
                      type="text"
                      className="form-control"
                      required
                      value={requestData.userName}
                      onChange={(e) => setRequestData({ ...requestData, userName: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label>Associated Project</label>
                    <input
                      type="text"
                      className="form-control"
                      value={requestData.projectName}
                      onChange={(e) => setRequestData({ ...requestData, projectName: e.target.value })}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Expected Return Date*</label>
                  <input
                    type="date"
                    className="form-control mono-font"
                    required
                    value={requestData.expectedReturnDate}
                    onChange={(e) => setRequestData({ ...requestData, expectedReturnDate: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label>Purpose / Intended Experiments*</label>
                  <textarea
                    rows="3"
                    className="form-control"
                    required
                    placeholder="Describe laboratory experiment or robotics test requirements..."
                    value={requestData.purpose}
                    onChange={(e) => setRequestData({ ...requestData, purpose: e.target.value })}
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn-secondary" onClick={() => setShowRequestModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary" disabled={availableAssets.length === 0}>
                  Submit Request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Return Modal */}
      {showReturnModal && selectedCheckout && (
        <div className="modal-overlay">
          <div className="modal-card">
            <div className="modal-header">
              <h3>Equipment Return & Condition Inspection</h3>
              <button className="close-btn" onClick={() => setShowReturnModal(false)}>✕</button>
            </div>
            <form onSubmit={handleReturnSubmit}>
              <div className="modal-body">
                <p style={{ fontSize: '0.9rem', color: '#94a3b8' }}>
                  Receiving <strong style={{ color: '#fff' }}>{selectedCheckout.assetName}</strong> ({selectedCheckout.assetId}) from {selectedCheckout.userName}.
                </p>

                <div className="form-group">
                  <label>Hardware Condition Check*</label>
                  <select
                    className="form-control"
                    value={returnCondition}
                    onChange={(e) => setReturnCondition(e.target.value)}
                  >
                    <option value="GOOD">GOOD - Fully functional & clean</option>
                    <option value="FAIR">FAIR - Operational with minor cosmetic wear</option>
                    <option value="DAMAGED">DAMAGED - Malfunctioning or broken components</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Inspection Notes / Remarks</label>
                  <textarea
                    rows="3"
                    className="form-control"
                    placeholder="Note any missing cables, pins bent, firmware modifications..."
                    value={returnRemarks}
                    onChange={(e) => setReturnRemarks(e.target.value)}
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn-secondary" onClick={() => setShowReturnModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  Confirm Return & Update Stock
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CheckoutsPage;

