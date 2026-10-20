import React, { useState, useEffect } from 'react';
import { faultApi } from '../api/faultApi';
import { assetApi } from '../api/assetApi';
import { useAuth } from '../auth/AuthContext';
import StatusBadge from '../components/StatusBadge';
import EmptyState from '../components/EmptyState';
import { AlertTriangle, Plus, X, Wrench, CheckCircle, ShieldAlert, FileText, UserCheck } from 'lucide-react';

export default function FaultsPage() {
  const { user } = useAuth();
  const [faults, setFaults] = useState([]);
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [severityFilter, setSeverityFilter] = useState('');
  const [search, setSearch] = useState('');

  // Modals
  const [showReportModal, setShowReportModal] = useState(false);
  const [showResolveModal, setShowResolveModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedFault, setSelectedFault] = useState(null);

  // Forms
  const [reportForm, setReportForm] = useState({
    assetId: '',
    title: '',
    description: '',
    symptoms: '',
    severity: 'MEDIUM'
  });

  const [resolveForm, setResolveForm] = useState({
    diagnosis: '',
    resolution: ''
  });

  const [assignTech, setAssignTech] = useState('');
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState(null);

  const isStaff = ['ADMIN', 'LAB_ASSISTANT'].includes(user?.role);

  useEffect(() => {
    fetchFaults();
    fetchAssets();
  }, [statusFilter, severityFilter]);

  const fetchFaults = async () => {
    try {
      setLoading(true);
      const res = await faultApi.getFaults(0, 50, statusFilter, severityFilter);
      setFaults(res?.content || []);
    } catch (err) {
      console.error(err);
      setFeedback({ type: 'error', text: 'Failed to load fault reports.' });
    } finally {
      setLoading(false);
    }
  };

  const fetchAssets = async () => {
    try {
      const res = await assetApi.getAll();
      setAssets(res || []);
    } catch (err) {
      console.error(err);
    }
  };

  const handleReportSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await faultApi.create(reportForm);
      setFeedback({ type: 'success', text: 'Hardware fault reported. Lab staff notified.' });
      setShowReportModal(false);
      setReportForm({
        assetId: '',
        title: '',
        description: '',
        symptoms: '',
        severity: 'MEDIUM'
      });
      fetchFaults();
    } catch (err) {
      setFeedback({ type: 'error', text: err?.response?.data?.message || 'Error submitting fault report.' });
    } finally {
      setSaving(false);
    }
  };

  const handleAssignSubmit = async (e) => {
    e.preventDefault();
    if (!selectedFault) return;
    setSaving(true);
    try {
      await faultApi.assignTechnician(selectedFault.id, assignTech);
      setFeedback({ type: 'success', text: `Technician ${assignTech} assigned.` });
      setShowAssignModal(false);
      fetchFaults();
    } catch (err) {
      setFeedback({ type: 'error', text: err?.response?.data?.message || 'Failed to assign technician.' });
    } finally {
      setSaving(false);
    }
  };

  const handleResolveSubmit = async (e) => {
    e.preventDefault();
    if (!selectedFault) return;
    setSaving(true);
    try {
      await faultApi.resolve(selectedFault.id, resolveForm.diagnosis, resolveForm.resolution);
      setFeedback({ type: 'success', text: `Fault #${selectedFault.id.substring(0, 8)} resolved.` });
      setShowResolveModal(false);
      setResolveForm({ diagnosis: '', resolution: '' });
      fetchFaults();
    } catch (err) {
      setFeedback({ type: 'error', text: err?.response?.data?.message || 'Failed to resolve fault.' });
    } finally {
      setSaving(false);
    }
  };

  const handleConvertToMaintenance = async (fault) => {
    if (!window.confirm(`Escalate fault on ${fault.assetName || fault.assetId} to a formal Maintenance Ticket?`)) return;
    try {
      await faultApi.convertToMaintenance(fault.id, user?.fullName || user?.username || 'Lab Staff');
      setFeedback({ type: 'success', text: 'Ticket successfully escalated to Maintenance pipeline.' });
      fetchFaults();
    } catch (err) {
      setFeedback({ type: 'error', text: err?.response?.data?.message || 'Escalation failed.' });
    }
  };

  const filteredFaults = faults.filter(f => {
    const term = search.toLowerCase();
    return (
      f.title?.toLowerCase().includes(term) ||
      f.assetId?.toLowerCase().includes(term) ||
      f.assetName?.toLowerCase().includes(term) ||
      f.reportedBy?.toLowerCase().includes(term)
    );
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Page Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 700, margin: 0 }}>Equipment Fault & Defect Reports</h1>
          <p style={{ color: 'var(--text-muted)', margin: '0.25rem 0 0 0' }}>
            Report malfunctioning robotics parts, damaged sensors, and request lab diagnostics
          </p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowReportModal(true)}>
          <AlertTriangle size={18} />
          <span>Report Defect</span>
        </button>
      </div>

      {feedback && (
        <div className={`alert alert-${feedback.type === 'error' ? 'danger' : 'success'}`} style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span>{feedback.text}</span>
          <button onClick={() => setFeedback(null)} style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer' }}>×</button>
        </div>
      )}

      {/* Filter Bar */}
      <div className="card" style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
        <input
          type="text"
          placeholder="Search by defect title, asset ID, or reporter..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="form-control"
          style={{ flex: 1, minWidth: '240px' }}
        />
        <select
          value={severityFilter}
          onChange={(e) => setSeverityFilter(e.target.value)}
          className="form-control"
          style={{ width: '160px' }}
        >
          <option value="">All Severities</option>
          <option value="CRITICAL">Critical</option>
          <option value="HIGH">High</option>
          <option value="MEDIUM">Medium</option>
          <option value="LOW">Low</option>
        </select>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="form-control"
          style={{ width: '170px' }}
        >
          <option value="">All Statuses</option>
          <option value="REPORTED">Reported</option>
          <option value="INVESTIGATING">Investigating</option>
          <option value="IN_REPAIR">In Repair</option>
          <option value="RESOLVED">Resolved</option>
          <option value="DISMISSED">Dismissed</option>
        </select>
      </div>

      {/* Faults List */}
      {loading ? (
        <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>Loading fault records...</div>
      ) : filteredFaults.length === 0 ? (
        <EmptyState
          icon={AlertTriangle}
          title="No fault reports recorded"
          description="Hardware systems and sensors are currently operating within normal parameters."
          actionText="Report Defect"
          onAction={() => setShowReportModal(true)}
        />
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '1.25rem' }}>
          {filteredFaults.map((f) => (
            <div key={f.id} className="card" style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem', borderLeft: f.severity === 'CRITICAL' ? '4px solid var(--danger)' : f.severity === 'HIGH' ? '4px solid var(--warning)' : '1px solid var(--border)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--primary)', fontWeight: 600 }}>
                    {f.assetId}
                  </span>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 600, margin: '0.2rem 0' }}>{f.title}</h3>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{f.assetName}</div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem', alignItems: 'flex-end' }}>
                  <StatusBadge status={f.status} />
                  <StatusBadge status={f.severity} />
                </div>
              </div>

              <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', background: 'rgba(255,255,255,0.02)', padding: '0.6rem', borderRadius: '4px' }}>
                <strong>Symptoms:</strong> {f.symptoms || f.description || 'N/A'}
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                <div>Reported by: <strong>{f.reportedBy}</strong> on {f.reportedAt ? new Date(f.reportedAt).toLocaleDateString() : 'Recent'}</div>
                {f.assignedTechnician && (
                  <div>Assigned Tech: <strong style={{ color: 'var(--text-primary)' }}>{f.assignedTechnician}</strong></div>
                )}
                {f.resolution && (
                  <div style={{ marginTop: '0.25rem', color: 'var(--success)' }}>
                    ✓ <strong>Resolution:</strong> {f.resolution}
                  </div>
                )}
              </div>

              {/* Action Buttons for Staff */}
              {isStaff && f.status !== 'RESOLVED' && f.status !== 'DISMISSED' && (
                <div style={{ display: 'flex', gap: '0.5rem', marginTop: 'auto', paddingTop: '0.75rem', borderTop: '1px solid var(--border)', flexWrap: 'wrap' }}>
                  <button
                    className="btn btn-outline"
                    style={{ padding: '0.3rem 0.6rem', fontSize: '0.8rem' }}
                    onClick={() => { setSelectedFault(f); setAssignTech(f.assignedTechnician || ''); setShowAssignModal(true); }}
                  >
                    <UserCheck size={14} />
                    <span>Assign</span>
                  </button>

                  <button
                    className="btn btn-outline"
                    style={{ padding: '0.3rem 0.6rem', fontSize: '0.8rem' }}
                    onClick={() => { setSelectedFault(f); setShowResolveModal(true); }}
                  >
                    <CheckCircle size={14} />
                    <span>Resolve</span>
                  </button>

                  <button
                    className="btn btn-outline"
                    style={{ padding: '0.3rem 0.6rem', fontSize: '0.8rem', color: 'var(--warning)', borderColor: 'rgba(245, 158, 11, 0.4)' }}
                    onClick={() => handleConvertToMaintenance(f)}
                  >
                    <Wrench size={14} />
                    <span>Send to Maintenance</span>
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Report Defect Modal */}
      {showReportModal && (
        <div className="modal-backdrop">
          <div className="modal-content" style={{ maxWidth: '520px' }}>
            <div className="modal-header">
              <h2 style={{ fontSize: '1.25rem', fontWeight: 600, margin: 0 }}>Report Defective Hardware</h2>
              <button onClick={() => setShowReportModal(false)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleReportSubmit}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Affected Equipment *</label>
                  <select
                    required
                    className="form-control"
                    value={reportForm.assetId}
                    onChange={(e) => setReportForm({ ...reportForm, assetId: e.target.value })}
                  >
                    <option value="">-- Choose Asset --</option>
                    {assets.map((a) => (
                      <option key={a.assetId} value={a.assetId}>
                        [{a.assetId}] {a.name} — Status: {a.status}
                      </option>
                    ))}
                  </select>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1rem' }}>
                  <div className="form-group">
                    <label className="form-label">Fault Title *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Servo motor stalls at 90 degrees"
                      className="form-control"
                      value={reportForm.title}
                      onChange={(e) => setReportForm({ ...reportForm, title: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Severity *</label>
                    <select
                      className="form-control"
                      value={reportForm.severity}
                      onChange={(e) => setReportForm({ ...reportForm, severity: e.target.value })}
                    >
                      <option value="LOW">Low</option>
                      <option value="MEDIUM">Medium</option>
                      <option value="HIGH">High</option>
                      <option value="CRITICAL">Critical</option>
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Symptoms & Observed Behavior *</label>
                  <textarea
                    rows={3}
                    required
                    placeholder="Describe weird sounds, error codes, overheat, smoke, or sensor disconnects..."
                    className="form-control"
                    value={reportForm.symptoms}
                    onChange={(e) => setReportForm({ ...reportForm, symptoms: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Full Description & Reproduction Steps</label>
                  <textarea
                    rows={2}
                    placeholder="Steps taken when the error triggered..."
                    className="form-control"
                    value={reportForm.description}
                    onChange={(e) => setReportForm({ ...reportForm, description: e.target.value })}
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-outline" onClick={() => setShowReportModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? 'Submitting...' : 'Submit Defect Report'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Assign Technician Modal */}
      {showAssignModal && selectedFault && (
        <div className="modal-backdrop">
          <div className="modal-content" style={{ maxWidth: '420px' }}>
            <div className="modal-header">
              <h2 style={{ fontSize: '1.25rem', fontWeight: 600, margin: 0 }}>Assign Technician</h2>
              <button onClick={() => setShowAssignModal(false)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleAssignSubmit}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                  Assigning technician to diagnose fault: <strong>{selectedFault.title}</strong>
                </p>
                <div className="form-group">
                  <label className="form-label">Technician Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Alex Rivera, Senior Lab Tech"
                    className="form-control"
                    value={assignTech}
                    onChange={(e) => setAssignTech(e.target.value)}
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-outline" onClick={() => setShowAssignModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? 'Saving...' : 'Assign Technician'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Resolve Fault Modal */}
      {showResolveModal && selectedFault && (
        <div className="modal-backdrop">
          <div className="modal-content" style={{ maxWidth: '480px' }}>
            <div className="modal-header">
              <h2 style={{ fontSize: '1.25rem', fontWeight: 600, margin: 0 }}>Resolve Defect Report</h2>
              <button onClick={() => setShowResolveModal(false)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleResolveSubmit}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Diagnosis Findings *</label>
                  <textarea
                    rows={2}
                    required
                    placeholder="Root cause identified (e.g., loose wiring, firmware mismatch)..."
                    className="form-control"
                    value={resolveForm.diagnosis}
                    onChange={(e) => setResolveForm({ ...resolveForm, diagnosis: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Resolution Actions Taken *</label>
                  <textarea
                    rows={3}
                    required
                    placeholder="Repairs done, component resoldered, or re-calibrated..."
                    className="form-control"
                    value={resolveForm.resolution}
                    onChange={(e) => setResolveForm({ ...resolveForm, resolution: e.target.value })}
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-outline" onClick={() => setShowResolveModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? 'Saving...' : 'Confirm Resolution'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
