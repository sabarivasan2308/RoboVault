import React, { useState, useEffect } from 'react';
import StatusBadge from '../components/StatusBadge';
import { maintenanceApi, assetApi } from '../services/api';

const MaintenancePage = ({ currentUser }) => {
  const [records, setRecords] = useState([]);
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showLogModal, setShowLogModal] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);

  const [newLog, setNewLog] = useState({
    assetId: '',
    issueDescription: '',
    technicianName: currentUser.name,
    cost: 0.0
  });

  const [updateData, setUpdateData] = useState({
    status: 'IN_REPAIR',
    diagnosis: '',
    actionTaken: '',
    partsReplaced: '',
    cost: 0.0,
    technicianName: currentUser.name,
    notes: ''
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await maintenanceApi.getAll();
      setRecords(data);
      const allAssets = await assetApi.getAll();
      setAssets(allAssets);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    try {
      await maintenanceApi.create(newLog);
      setShowLogModal(false);
      loadData();
    } catch (e) {
      alert("Error logging maintenance: " + (e.response?.data?.message || e.message));
    }
  };

  const handleOpenUpdate = (rec) => {
    setSelectedRecord(rec);
    setUpdateData({
      status: rec.status,
      diagnosis: rec.diagnosis || '',
      actionTaken: rec.actionTaken || '',
      partsReplaced: rec.partsReplaced || '',
      cost: rec.cost || 0.0,
      technicianName: rec.technicianName || currentUser.name,
      notes: rec.notes || ''
    });
    setShowUpdateModal(true);
  };

  const handleUpdateSubmit = async (e) => {
    e.preventDefault();
    try {
      await maintenanceApi.update(selectedRecord.id, updateData);
      setShowUpdateModal(false);
      loadData();
    } catch (e) {
      alert("Error updating maintenance record: " + e.message);
    }
  };

  return (
    <div className="page-content">
      <div className="control-bar">
        <div>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Diagnostics, Repairs & Calibration</h2>
          <p style={{ fontSize: '0.82rem', color: '#94a3b8' }}>
            Lifecycle: Fault Report → Diagnosis → Repair → Resolved → Closed
          </p>
        </div>

        <button className="btn-primary" onClick={() => {
          setNewLog({
            assetId: assets[0]?.assetId || '',
            issueDescription: '',
            technicianName: currentUser.name,
            cost: 0.0
          });
          setShowLogModal(true);
        }}>
          <span>+</span> Log Equipment Issue
        </button>
      </div>

      <div className="table-card">
        <div className="table-header-title">
          <h3>Lab Maintenance & Repair History</h3>
        </div>

        {loading ? (
          <div style={{ padding: '24px', color: '#94a3b8' }}>Loading maintenance logs...</div>
        ) : (
          <table className="responsive-table">
            <thead>
              <tr>
                <th>Asset ID & Name</th>
                <th>Reported Issue</th>
                <th>Diagnosis & Action</th>
                <th>Parts Replaced</th>
                <th>Cost ($)</th>
                <th>Technician</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {records.map((rec) => (
                <tr key={rec.id}>
                  <td>
                    <div className="mono-font" style={{ fontWeight: 700, color: '#38bdf8' }}>{rec.assetId}</div>
                    <div style={{ fontSize: '0.85rem' }}>{rec.assetName}</div>
                  </td>
                  <td style={{ maxWidth: '220px', fontSize: '0.85rem' }}>
                    {rec.issueDescription}
                  </td>
                  <td style={{ maxWidth: '220px', fontSize: '0.85rem' }}>
                    <div><strong>Diag:</strong> {rec.diagnosis || 'Pending'}</div>
                    {rec.actionTaken && <div><strong>Action:</strong> {rec.actionTaken}</div>}
                  </td>
                  <td>{rec.partsReplaced || 'None'}</td>
                  <td className="mono-font" style={{ color: '#34d399', fontWeight: 600 }}>
                    ${(rec.cost || 0).toFixed(2)}
                  </td>
                  <td>{rec.technicianName}</td>
                  <td>
                    <StatusBadge status={rec.status} />
                  </td>
                  <td>
                    <button className="btn-secondary" style={{ padding: '5px 10px', fontSize: '0.8rem' }} onClick={() => handleOpenUpdate(rec)}>
                      Update
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Log Issue Modal */}
      {showLogModal && (
        <div className="modal-overlay">
          <div className="modal-card">
            <div className="modal-header">
              <h3>Log Hardware Maintenance</h3>
              <button className="close-btn" onClick={() => setShowLogModal(false)}>✕</button>
            </div>
            <form onSubmit={handleCreateSubmit}>
              <div className="modal-body">
                <div className="form-group">
                  <label>Select Laboratory Equipment*</label>
                  <select
                    className="form-control mono-font"
                    required
                    value={newLog.assetId}
                    onChange={(e) => setNewLog({ ...newLog, assetId: e.target.value })}
                  >
                    {assets.map(a => (
                      <option key={a.assetId} value={a.assetId}>
                        {a.assetId} - {a.name} ({a.status})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>Defect / Issue Symptoms Description*</label>
                  <textarea
                    rows="3"
                    className="form-control"
                    required
                    placeholder="Describe failure mode: e.g. motor skipping steps, BNC connector loose, overheating..."
                    value={newLog.issueDescription}
                    onChange={(e) => setNewLog({ ...newLog, issueDescription: e.target.value })}
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Lead Technician*</label>
                    <input
                      type="text"
                      className="form-control"
                      required
                      value={newLog.technicianName}
                      onChange={(e) => setNewLog({ ...newLog, technicianName: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label>Initial Estimated Cost ($)</label>
                    <input
                      type="number"
                      step="0.01"
                      className="form-control"
                      value={newLog.cost}
                      onChange={(e) => setNewLog({ ...newLog, cost: parseFloat(e.target.value) || 0 })}
                    />
                  </div>
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn-secondary" onClick={() => setShowLogModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  Begin Maintenance Case
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Update Maintenance Modal */}
      {showUpdateModal && selectedRecord && (
        <div className="modal-overlay">
          <div className="modal-card">
            <div className="modal-header">
              <h3>Update Service Case: {selectedRecord.assetName}</h3>
              <button className="close-btn" onClick={() => setShowUpdateModal(false)}>✕</button>
            </div>
            <form onSubmit={handleUpdateSubmit}>
              <div className="modal-body">
                <div className="form-row">
                  <div className="form-group">
                    <label>Stage / Status*</label>
                    <select
                      className="form-control"
                      value={updateData.status}
                      onChange={(e) => setUpdateData({ ...updateData, status: e.target.value })}
                    >
                      <option value="REPORTED">REPORTED - Logged in queue</option>
                      <option value="DIAGNOSIS">DIAGNOSIS - Testing component failure</option>
                      <option value="IN_REPAIR">IN_REPAIR - Soldering / replacement underway</option>
                      <option value="RESOLVED">RESOLVED - Calibration verified / Operational</option>
                      <option value="CLOSED">CLOSED - Returned to active lab stock</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Technician Name</label>
                    <input
                      type="text"
                      className="form-control"
                      value={updateData.technicianName}
                      onChange={(e) => setUpdateData({ ...updateData, technicianName: e.target.value })}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Root Cause Diagnosis</label>
                  <textarea
                    rows="2"
                    className="form-control"
                    placeholder="Findings: e.g. blown MOSFET driver gate, cold solder joint..."
                    value={updateData.diagnosis}
                    onChange={(e) => setUpdateData({ ...updateData, diagnosis: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label>Corrective Action Taken</label>
                  <textarea
                    rows="2"
                    className="form-control"
                    placeholder="e.g. replaced electrolytic capacitor, recalibrated PID loop..."
                    value={updateData.actionTaken}
                    onChange={(e) => setUpdateData({ ...updateData, actionTaken: e.target.value })}
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Parts Replaced</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="e.g. BNC Jack Receptacle, LM2596"
                      value={updateData.partsReplaced}
                      onChange={(e) => setUpdateData({ ...updateData, partsReplaced: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label>Total Repair Cost ($)</label>
                    <input
                      type="number"
                      step="0.01"
                      className="form-control"
                      value={updateData.cost}
                      onChange={(e) => setUpdateData({ ...updateData, cost: parseFloat(e.target.value) || 0 })}
                    />
                  </div>
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn-secondary" onClick={() => setShowUpdateModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  Save Updates
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default MaintenancePage;

