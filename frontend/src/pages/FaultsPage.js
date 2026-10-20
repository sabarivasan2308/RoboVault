import React, { useState, useEffect } from 'react';
import StatusBadge from '../components/StatusBadge';
import { faultApi, assetApi } from '../services/api';

const FaultsPage = ({ currentUser }) => {
  const [faults, setFaults] = useState([]);
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  const [newFault, setNewFault] = useState({
    assetId: '',
    title: '',
    description: '',
    severity: 'MEDIUM',
    reportedBy: currentUser.name,
    reporterEmail: currentUser.email
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await faultApi.getAll();
      setFaults(data);
      const allAssets = await assetApi.getAll();
      setAssets(allAssets);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await faultApi.create(newFault);
      setShowModal(false);
      loadData();
    } catch (e) {
      alert("Error reporting fault: " + (e.response?.data?.message || e.message));
    }
  };

  const handleSendToMaintenance = async (faultId) => {
    try {
      await faultApi.sendToMaintenance(faultId, currentUser.name);
      loadData();
      alert("Fault dispatched to Maintenance Queue!");
    } catch (e) {
      alert("Error: " + e.message);
    }
  };

  return (
    <div className="page-content">
      <div className="control-bar">
        <div>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Fault & Malfunction Reporting</h2>
          <p style={{ fontSize: '0.82rem', color: '#94a3b8' }}>
            Flag damaged sensors, fried microcontrollers, stripped gears, and laboratory safety issues
          </p>
        </div>

        <button className="btn-primary" onClick={() => {
          setNewFault({
            assetId: assets[0]?.assetId || '',
            title: '',
            description: '',
            severity: 'MEDIUM',
            reportedBy: currentUser.name,
            reporterEmail: currentUser.email
          });
          setShowModal(true);
        }}>
          <span>⚠️</span> File Incident / Defect
        </button>
      </div>

      <div className="table-card">
        <div className="table-header-title">
          <h3>Logged Fault Dispatches</h3>
        </div>

        {loading ? (
          <div style={{ padding: '24px', color: '#94a3b8' }}>Loading faults...</div>
        ) : (
          <table className="responsive-table">
            <thead>
              <tr>
                <th>Hardware ID / Component</th>
                <th>Incident Title</th>
                <th>Description</th>
                <th>Severity</th>
                <th>Reported By</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {faults.map((f) => (
                <tr key={f.id}>
                  <td>
                    <div className="mono-font" style={{ fontWeight: 700, color: '#38bdf8' }}>{f.assetId}</div>
                    <div style={{ fontSize: '0.85rem' }}>{f.assetName}</div>
                  </td>
                  <td style={{ fontWeight: 600 }}>{f.title}</td>
                  <td style={{ maxWidth: '280px', fontSize: '0.85rem' }}>{f.description}</td>
                  <td>
                    <StatusBadge status={f.severity} />
                  </td>
                  <td>{f.reportedBy}</td>
                  <td>
                    <span style={{ fontSize: '0.8rem', color: '#fbbf24', fontWeight: 600 }}>
                      {f.status}
                    </span>
                  </td>
                  <td>
                    {f.status !== 'IN_MAINTENANCE' && f.status !== 'RESOLVED' && (
                      <button
                        className="btn-secondary"
                        style={{ padding: '5px 10px', fontSize: '0.8rem' }}
                        onClick={() => handleSendToMaintenance(f.id)}
                      >
                        🔧 Send to Maint.
                      </button>
                    )}
                    {f.status === 'IN_MAINTENANCE' && (
                      <span style={{ fontSize: '0.78rem', color: '#a78bfa' }}>In Workshop</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Report Fault Modal */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-card">
            <div className="modal-header">
              <h3>File Hardware Defect / Fault Report</h3>
              <button className="close-btn" onClick={() => setShowModal(false)}>✕</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="form-group">
                  <label>Affected Laboratory Equipment*</label>
                  <select
                    className="form-control mono-font"
                    required
                    value={newFault.assetId}
                    onChange={(e) => setNewFault({ ...newFault, assetId: e.target.value })}
                  >
                    {assets.map((a) => (
                      <option key={a.assetId} value={a.assetId}>
                        {a.assetId} - {a.name} ({a.location})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Incident Severity*</label>
                    <select
                      className="form-control"
                      value={newFault.severity}
                      onChange={(e) => setNewFault({ ...newFault, severity: e.target.value })}
                    >
                      <option value="LOW">LOW - Cosmetic / Minor Glitch</option>
                      <option value="MEDIUM">MEDIUM - Impaired Functionality</option>
                      <option value="HIGH">HIGH - Inoperable / Broken</option>
                      <option value="CRITICAL">CRITICAL - Electrical Hazard / Fire Risk</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Reported By*</label>
                    <input
                      type="text"
                      className="form-control"
                      required
                      value={newFault.reportedBy}
                      onChange={(e) => setNewFault({ ...newFault, reportedBy: e.target.value })}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Incident Summary Title*</label>
                  <input
                    type="text"
                    className="form-control"
                    required
                    placeholder="e.g. Overvoltage on 5V pin, motor driver smoke"
                    value={newFault.title}
                    onChange={(e) => setNewFault({ ...newFault, title: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label>Detailed Diagnostic Information*</label>
                  <textarea
                    rows="3"
                    className="form-control"
                    required
                    placeholder="Describe how the malfunction occurred, error lights, smells, or thermal indicators..."
                    value={newFault.description}
                    onChange={(e) => setNewFault({ ...newFault, description: e.target.value })}
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn-secondary" onClick={() => setShowModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary" style={{ background: '#ef4444' }}>
                  Submit Defect Ticket
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default FaultsPage;

