import React, { useState, useEffect } from 'react';
import { projectApi } from '../api/projectApi';
import { assetApi } from '../api/assetApi';
import { useAuth } from '../auth/AuthContext';
import StatusBadge from '../components/StatusBadge';
import EmptyState from '../components/EmptyState';
import { FolderGit2, Plus, Box, X, Check, Calendar, Users, Cpu } from 'lucide-react';

export default function ProjectsPage() {
  const { user } = useAuth();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [search, setSearch] = useState('');
  const [assets, setAssets] = useState([]);

  // Modals
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showAllocateModal, setShowAllocateModal] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);

  // Form states
  const [newProject, setNewProject] = useState({
    name: '',
    code: '',
    description: '',
    leadFaculty: '',
    leadStudent: '',
    department: 'Robotics Engineering',
    status: 'ACTIVE',
    startDate: new Date().toISOString().split('T')[0],
    targetCompletionDate: ''
  });

  const [allocationForm, setAllocationForm] = useState({
    assetId: '',
    quantity: 1
  });

  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState(null);

  const canManage = ['ADMIN', 'FACULTY', 'LAB_ASSISTANT'].includes(user?.role);
  const canCreate = ['ADMIN', 'FACULTY'].includes(user?.role);

  useEffect(() => {
    fetchProjects();
    fetchAssets();
  }, [statusFilter]);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const res = await projectApi.getProjects(0, 50, statusFilter);
      setProjects(res?.content || []);
    } catch (err) {
      console.error(err);
      setFeedback({ type: 'error', text: 'Failed to fetch projects.' });
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

  const handleCreateProject = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await projectApi.create(newProject);
      setFeedback({ type: 'success', text: `Project "${newProject.name}" registered successfully.` });
      setShowCreateModal(false);
      setNewProject({
        name: '',
        code: '',
        description: '',
        leadFaculty: '',
        leadStudent: '',
        department: 'Robotics Engineering',
        status: 'ACTIVE',
        startDate: new Date().toISOString().split('T')[0],
        targetCompletionDate: ''
      });
      fetchProjects();
    } catch (err) {
      setFeedback({ type: 'error', text: err?.response?.data?.message || 'Error creating project.' });
    } finally {
      setSaving(false);
    }
  };

  const handleAllocate = async (e) => {
    e.preventDefault();
    if (!selectedProject || !allocationForm.assetId) return;
    setSaving(true);
    try {
      await projectApi.allocateAsset(selectedProject.id, allocationForm.assetId, Number(allocationForm.quantity));
      setFeedback({ type: 'success', text: `Hardware assigned to project ${selectedProject.name}.` });
      setShowAllocateModal(false);
      setAllocationForm({ assetId: '', quantity: 1 });
      fetchProjects();
    } catch (err) {
      setFeedback({ type: 'error', text: err?.response?.data?.message || 'Failed to allocate asset.' });
    } finally {
      setSaving(false);
    }
  };

  const handleRelease = async (projectId, allocationId, assetName) => {
    if (!window.confirm(`Release ${assetName} back to general laboratory stock?`)) return;
    try {
      await projectApi.releaseAllocation(projectId, allocationId);
      setFeedback({ type: 'success', text: 'Hardware released successfully.' });
      fetchProjects();
    } catch (err) {
      setFeedback({ type: 'error', text: err?.response?.data?.message || 'Failed to release allocation.' });
    }
  };

  const filteredProjects = projects.filter(p => {
    const term = search.toLowerCase();
    return (
      p.name?.toLowerCase().includes(term) ||
      p.code?.toLowerCase().includes(term) ||
      p.leadFaculty?.toLowerCase().includes(term) ||
      p.department?.toLowerCase().includes(term)
    );
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Page Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 700, margin: 0 }}>Research & Robotics Projects</h1>
          <p style={{ color: 'var(--text-muted)', margin: '0.25rem 0 0 0' }}>
            Coordinate hardware allocations, supervised robotics teams, and project asset pools
          </p>
        </div>
        {canCreate && (
          <button className="btn btn-primary" onClick={() => setShowCreateModal(true)}>
            <Plus size={18} />
            <span>New Project</span>
          </button>
        )}
      </div>

      {feedback && (
        <div className={`alert alert-${feedback.type === 'error' ? 'danger' : 'success'}`} style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span>{feedback.text}</span>
          <button onClick={() => setFeedback(null)} style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer' }}>×</button>
        </div>
      )}

      {/* Filter Toolbar */}
      <div className="card" style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
        <input
          type="text"
          placeholder="Search by project name, code, lead, or department..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="form-control"
          style={{ flex: 1, minWidth: '240px' }}
        />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="form-control"
          style={{ width: '180px' }}
        >
          <option value="">All Statuses</option>
          <option value="PLANNING">Planning</option>
          <option value="ACTIVE">Active</option>
          <option value="ON_HOLD">On Hold</option>
          <option value="COMPLETED">Completed</option>
          <option value="ARCHIVED">Archived</option>
        </select>
      </div>

      {/* Projects Grid */}
      {loading ? (
        <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>Loading projects...</div>
      ) : filteredProjects.length === 0 ? (
        <EmptyState
          icon={FolderGit2}
          title="No projects found"
          description="Create a project to allocate dedicated robotics assets and components."
          actionText={canCreate ? "Create Project" : null}
          onAction={() => setShowCreateModal(true)}
        />
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '1.25rem' }}>
          {filteredProjects.map((proj) => (
            <div key={proj.id} className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--primary)', fontWeight: 600, letterSpacing: '0.05em' }}>
                    {proj.code || 'PROJECT'}
                  </div>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 600, margin: '0.2rem 0' }}>{proj.name}</h3>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{proj.department}</div>
                </div>
                <StatusBadge status={proj.status} />
              </div>

              <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', margin: 0, minHeight: '2.8rem' }}>
                {proj.description || 'No description provided.'}
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', fontSize: '0.85rem', borderTop: '1px solid var(--border)', paddingTop: '0.75rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Users size={15} style={{ color: 'var(--text-muted)' }} />
                  <span><strong>Lead:</strong> {proj.leadFaculty || proj.leadStudent || 'Unassigned'}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Calendar size={15} style={{ color: 'var(--text-muted)' }} />
                  <span><strong>Timeline:</strong> {proj.startDate || 'N/A'} {proj.targetCompletionDate ? `→ ${proj.targetCompletionDate}` : ''}</span>
                </div>
              </div>

              {/* Hardware Allocations Section */}
              <div style={{ background: 'rgba(255,255,255,0.02)', padding: '0.75rem', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem', fontWeight: 600 }}>
                    <Cpu size={14} style={{ color: 'var(--primary)' }} />
                    <span>Allocated Hardware ({proj.allocations?.length || 0})</span>
                  </div>
                  {canManage && proj.status === 'ACTIVE' && (
                    <button
                      className="btn btn-outline"
                      style={{ padding: '0.2rem 0.5rem', fontSize: '0.75rem' }}
                      onClick={() => { setSelectedProject(proj); setShowAllocateModal(true); }}
                    >
                      + Allocate
                    </button>
                  )}
                </div>

                {(!proj.allocations || proj.allocations.length === 0) ? (
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                    No hardware currently dedicated to this project.
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                    {proj.allocations.map((alloc) => (
                      <div
                        key={alloc.id || alloc.assetId}
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          padding: '0.35rem 0.6rem',
                          background: 'var(--bg-card)',
                          borderRadius: '4px',
                          fontSize: '0.8rem'
                        }}
                      >
                        <div>
                          <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{alloc.assetName || alloc.assetId}</span>
                          <span style={{ marginLeft: '0.5rem', color: 'var(--text-muted)' }}>x{alloc.quantity}</span>
                        </div>
                        {canManage && (
                          <button
                            title="Release hardware back to lab stock"
                            onClick={() => handleRelease(proj.id, alloc.id, alloc.assetName || alloc.assetId)}
                            style={{
                              background: 'transparent',
                              border: 'none',
                              color: 'var(--danger)',
                              cursor: 'pointer',
                              padding: '2px 4px',
                              borderRadius: '4px'
                            }}
                          >
                            Release
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Project Modal */}
      {showCreateModal && (
        <div className="modal-backdrop">
          <div className="modal-content" style={{ maxWidth: '540px' }}>
            <div className="modal-header">
              <h2 style={{ fontSize: '1.25rem', fontWeight: 600, margin: 0 }}>Register Robotics Project</h2>
              <button onClick={() => setShowCreateModal(false)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleCreateProject}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="form-group">
                    <label className="form-label">Project Code *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. PRJ-ROBO-01"
                      className="form-control"
                      value={newProject.code}
                      onChange={(e) => setNewProject({ ...newProject, code: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Status</label>
                    <select
                      className="form-control"
                      value={newProject.status}
                      onChange={(e) => setNewProject({ ...newProject, status: e.target.value })}
                    >
                      <option value="PLANNING">Planning</option>
                      <option value="ACTIVE">Active</option>
                      <option value="ON_HOLD">On Hold</option>
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Project Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Autonomous Swarm Robotics"
                    className="form-control"
                    value={newProject.name}
                    onChange={(e) => setNewProject({ ...newProject, name: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Description</label>
                  <textarea
                    rows={3}
                    placeholder="Project mission, scope, and technical requirements..."
                    className="form-control"
                    value={newProject.description}
                    onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="form-group">
                    <label className="form-label">Faculty / Staff Lead</label>
                    <input
                      type="text"
                      placeholder="e.g. Dr. A. Vance"
                      className="form-control"
                      value={newProject.leadFaculty}
                      onChange={(e) => setNewProject({ ...newProject, leadFaculty: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Department</label>
                    <input
                      type="text"
                      placeholder="e.g. Robotics Engineering"
                      className="form-control"
                      value={newProject.department}
                      onChange={(e) => setNewProject({ ...newProject, department: e.target.value })}
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="form-group">
                    <label className="form-label">Start Date</label>
                    <input
                      type="date"
                      className="form-control"
                      value={newProject.startDate}
                      onChange={(e) => setNewProject({ ...newProject, startDate: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Target Completion</label>
                    <input
                      type="date"
                      className="form-control"
                      value={newProject.targetCompletionDate}
                      onChange={(e) => setNewProject({ ...newProject, targetCompletionDate: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-outline" onClick={() => setShowCreateModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? 'Creating...' : 'Register Project'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Allocate Asset Modal */}
      {showAllocateModal && selectedProject && (
        <div className="modal-backdrop">
          <div className="modal-content" style={{ maxWidth: '480px' }}>
            <div className="modal-header">
              <h2 style={{ fontSize: '1.25rem', fontWeight: 600, margin: 0 }}>Allocate Equipment</h2>
              <button onClick={() => setShowAllocateModal(false)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleAllocate}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                  Assigning laboratory equipment to project: <strong style={{ color: 'var(--text-primary)' }}>{selectedProject.name}</strong>
                </div>

                <div className="form-group">
                  <label className="form-label">Select Equipment *</label>
                  <select
                    required
                    className="form-control"
                    value={allocationForm.assetId}
                    onChange={(e) => setAllocationForm({ ...allocationForm, assetId: e.target.value })}
                  >
                    <option value="">-- Choose Asset --</option>
                    {assets.map((a) => (
                      <option key={a.assetId} value={a.assetId}>
                        [{a.assetId}] {a.name} — Avail: {a.availableQuantity}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Quantity to Dedicate *</label>
                  <input
                    type="number"
                    min={1}
                    max={20}
                    required
                    className="form-control"
                    value={allocationForm.quantity}
                    onChange={(e) => setAllocationForm({ ...allocationForm, quantity: e.target.value })}
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-outline" onClick={() => setShowAllocateModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? 'Allocating...' : 'Confirm Allocation'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

