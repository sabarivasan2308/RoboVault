import React, { useState, useEffect } from 'react';
import { projectApi, assetApi } from '../services/api';

const ProjectsPage = ({ currentUser }) => {
  const [projects, setProjects] = useState([]);
  const [availableAssets, setAvailableAssets] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showNewModal, setShowNewModal] = useState(false);
  const [showAllocateModal, setShowAllocateModal] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const [selectedAssetId, setSelectedAssetId] = useState('');

  const [projectForm, setProjectForm] = useState({
    code: '',
    name: '',
    description: '',
    projectLead: currentUser.name
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await projectApi.getAll();
      setProjects(data);
      const assets = await assetApi.getAll();
      setAvailableAssets(assets);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProject = async (e) => {
    e.preventDefault();
    try {
      await projectApi.create(projectForm);
      setShowNewModal(false);
      loadData();
    } catch (e) {
      alert("Error creating project: " + (e.response?.data?.message || e.message));
    }
  };

  const handleAllocate = async (e) => {
    e.preventDefault();
    try {
      await projectApi.allocateAsset(selectedProject.id, selectedAssetId);
      setShowAllocateModal(false);
      loadData();
    } catch (e) {
      alert("Error allocating asset: " + e.message);
    }
  };

  const handleDeallocate = async (projectId, assetId) => {
    if (window.confirm(`Deallocate ${assetId} from this project?`)) {
      try {
        await projectApi.deallocateAsset(projectId, assetId);
        loadData();
      } catch (e) {
        alert("Error deallocating: " + e.message);
      }
    }
  };

  return (
    <div className="page-content">
      <div className="control-bar">
        <div>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Robotics & Embedded Systems Research Projects</h2>
          <p style={{ fontSize: '0.82rem', color: '#94a3b8' }}>
            Allocate microcontrollers, sensor arrays, and motors directly to active robotics initiatives
          </p>
        </div>

        <button className="btn-primary" onClick={() => {
          setProjectForm({
            code: `PRJ-ROBO-0${projects.length + 1}`,
            name: '',
            description: '',
            projectLead: currentUser.name
          });
          setShowNewModal(true);
        }}>
          <span>+</span> Create New Project
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '20px' }}>
        {projects.map((prj) => (
          <div key={prj.id} className="table-card" style={{ padding: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
              <span className="mono-font" style={{ color: '#38bdf8', fontWeight: 700, fontSize: '0.85rem' }}>
                {prj.code}
              </span>
              <span className="status-badge available">ACTIVE</span>
            </div>

            <h3 style={{ fontSize: '1.15rem', color: '#fff', marginBottom: '6px' }}>{prj.name}</h3>
            <p style={{ fontSize: '0.85rem', color: '#94a3b8', marginBottom: '16px' }}>
              {prj.description}
            </p>

            <div style={{ fontSize: '0.8rem', color: '#64748b', marginBottom: '16px' }}>
              <div>Lead: <strong style={{ color: '#f8fafc' }}>{prj.projectLead}</strong></div>
              <div>Team: {prj.teamMembers?.join(', ') || 'Independent'}</div>
            </div>

            <div style={{ borderTop: '1px solid #273552', paddingTop: '14px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#f8fafc', textTransform: 'uppercase' }}>
                  Allocated Hardware ({prj.allocatedAssetIds?.length || 0})
                </span>
                <button
                  className="btn-secondary"
                  style={{ padding: '4px 8px', fontSize: '0.75rem' }}
                  onClick={() => {
                    setSelectedProject(prj);
                    setSelectedAssetId(availableAssets[0]?.assetId || '');
                    setShowAllocateModal(true);
                  }}
                >
                  + Assign Asset
                </button>
              </div>

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {prj.allocatedAssetIds && prj.allocatedAssetIds.length > 0 ? (
                  prj.allocatedAssetIds.map((aid) => (
                    <span
                      key={aid}
                      className="mono-font"
                      style={{
                        background: 'rgba(56, 189, 248, 0.1)',
                        border: '1px solid rgba(56, 189, 248, 0.3)',
                        borderRadius: '6px',
                        padding: '3px 8px',
                        fontSize: '0.78rem',
                        color: '#38bdf8',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px'
                      }}
                    >
                      {aid}
                      <button
                        style={{ background: 'transparent', color: '#f87171', fontSize: '11px', cursor: 'pointer' }}
                        onClick={() => handleDeallocate(prj.id, aid)}
                      >
                        ✕
                      </button>
                    </span>
                  ))
                ) : (
                  <span style={{ fontSize: '0.8rem', color: '#64748b' }}>No hardware allocated yet</span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* New Project Modal */}
      {showNewModal && (
        <div className="modal-overlay">
          <div className="modal-card">
            <div className="modal-header">
              <h3>Create Research / Lab Project</h3>
              <button className="close-btn" onClick={() => setShowNewModal(false)}>✕</button>
            </div>
            <form onSubmit={handleCreateProject}>
              <div className="modal-body">
                <div className="form-row">
                  <div className="form-group">
                    <label>Project Code*</label>
                    <input
                      type="text"
                      className="form-control mono-font"
                      required
                      value={projectForm.code}
                      onChange={(e) => setProjectForm({ ...projectForm, code: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label>Project Lead*</label>
                    <input
                      type="text"
                      className="form-control"
                      required
                      value={projectForm.projectLead}
                      onChange={(e) => setProjectForm({ ...projectForm, projectLead: e.target.value })}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Project Name*</label>
                  <input
                    type="text"
                    className="form-control"
                    required
                    placeholder="e.g. Autonomous Delivery Robot"
                    value={projectForm.name}
                    onChange={(e) => setProjectForm({ ...projectForm, name: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label>Project Scope & Objective</label>
                  <textarea
                    rows="3"
                    className="form-control"
                    placeholder="Brief description of the robotics system being constructed..."
                    value={projectForm.description}
                    onChange={(e) => setProjectForm({ ...projectForm, description: e.target.value })}
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn-secondary" onClick={() => setShowNewModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  Create Project
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Allocate Asset Modal */}
      {showAllocateModal && selectedProject && (
        <div className="modal-overlay">
          <div className="modal-card">
            <div className="modal-header">
              <h3>Allocate Hardware to {selectedProject.name}</h3>
              <button className="close-btn" onClick={() => setShowAllocateModal(false)}>✕</button>
            </div>
            <form onSubmit={handleAllocate}>
              <div className="modal-body">
                <div className="form-group">
                  <label>Choose Laboratory Asset*</label>
                  <select
                    className="form-control mono-font"
                    required
                    value={selectedAssetId}
                    onChange={(e) => setSelectedAssetId(e.target.value)}
                  >
                    {availableAssets.map((a) => (
                      <option key={a.assetId} value={a.assetId}>
                        {a.assetId} - {a.name} ({a.category})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn-secondary" onClick={() => setShowAllocateModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  Confirm Allocation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectsPage;

