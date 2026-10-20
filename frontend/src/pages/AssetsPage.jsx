import React, { useState, useEffect } from 'react';
import { assetApi } from '../api/assetApi';
import StatusBadge from '../components/StatusBadge';
import Pagination from '../components/Pagination';
import EmptyState from '../components/EmptyState';
import { useAuth } from '../auth/AuthContext';
import { Search, Plus, Edit, Trash2 } from 'lucide-react';

const CATEGORIES = [
  'ROBOTS', 'MICROCONTROLLERS', 'DEVELOPMENT_BOARDS', 'SENSORS',
  'MOTORS', 'MOTOR_DRIVERS', 'COMMUNICATION_MODULES', 'POWER_SUPPLIES',
  'ELECTRONIC_COMPONENTS', 'TOOLS', 'TEST_EQUIPMENT', 'THREE_D_PRINTERS'
];

const STATUSES = ['AVAILABLE', 'IN_USE', 'RESERVED', 'MAINTENANCE', 'DAMAGED', 'LOST', 'RETIRED'];

export const AssetsPage = () => {
  const { hasRole } = useAuth();
  const [assets, setAssets] = useState([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('');
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(true);

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState(null);
  const [formData, setFormData] = useState({
    assetId: '',
    name: '',
    category: 'DEVELOPMENT_BOARDS',
    brand: '',
    model: '',
    serialNumber: '',
    quantity: 1,
    location: '',
    status: 'AVAILABLE',
    condition: 'GOOD',
    description: '',
    purchaseDate: ''
  });

  useEffect(() => {
    fetchAssets();
  }, [page, category, status]);

  const fetchAssets = async () => {
    setLoading(true);
    try {
      const res = await assetApi.getAssets(page, 15, query, category, status);
      if (res) {
        setAssets(res.content || []);
        setTotalPages(res.totalPages || 1);
        setTotalItems(res.totalElements || 0);
      }
    } catch (e) {
      console.error("Asset fetch error:", e);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(0);
    fetchAssets();
  };

  const openCreateModal = () => {
    setIsEditing(false);
    setFormData({
      assetId: `RB-DEV-${Math.floor(100 + Math.random() * 900)}`,
      name: '',
      category: 'DEVELOPMENT_BOARDS',
      brand: '',
      model: '',
      serialNumber: '',
      quantity: 1,
      location: 'Robotics Lab - Rack A1',
      status: 'AVAILABLE',
      condition: 'GOOD',
      description: '',
      purchaseDate: new Date().toISOString().split('T')[0]
    });
    setShowModal(true);
  };

  const openEditModal = (asset) => {
    setIsEditing(true);
    setSelectedAsset(asset);
    setFormData({ ...asset });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isEditing) {
        await assetApi.update(selectedAsset.id, formData);
      } else {
        await assetApi.create(formData);
      }
      setShowModal(false);
      fetchAssets();
    } catch (err) {
      alert("Error saving asset: " + (err.response?.data?.message || err.message));
    }
  };

  const handleDelete = async (id, name, assetId) => {
    if (window.confirm(`Permanently remove ${name} (${assetId})?`)) {
      try {
        await assetApi.delete(id);
        fetchAssets();
      } catch (err) {
        alert("Deletion prevented: " + (err.response?.data?.message || err.message));
      }
    }
  };

  return (
    <div>
      <div className="control-bar">
        <form onSubmit={handleSearch} className="search-box">
          <Search size={18} className="search-icon" />
          <input
            type="text"
            className="search-input"
            placeholder="Search by ID, name, brand, model, serial..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </form>

        <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
          <select 
            className="form-control" 
            style={{ width: 'auto', padding: '8px 12px' }}
            value={category}
            onChange={(e) => { setCategory(e.target.value); setPage(0); }}
          >
            <option value="">All Categories</option>
            {CATEGORIES.map(c => (
              <option key={c} value={c}>{c.replace(/_/g, ' ')}</option>
            ))}
          </select>

          <select 
            className="form-control" 
            style={{ width: 'auto', padding: '8px 12px' }}
            value={status}
            onChange={(e) => { setStatus(e.target.value); setPage(0); }}
          >
            <option value="">All Statuses</option>
            {STATUSES.map(s => (
              <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>
            ))}
          </select>

          {hasRole(['ADMIN', 'LAB_ASSISTANT']) && (
            <button className="btn btn-primary" onClick={openCreateModal}>
              <Plus size={16} /> Register Asset
            </button>
          )}
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Laboratory Inventory ({totalItems} cataloged items)</h3>
        </div>

        {loading ? (
          <div style={{ padding: '40px', color: '#94a3b8', textAlign: 'center' }}>Loading hardware items...</div>
        ) : assets.length === 0 ? (
          <EmptyState message="No matching hardware assets found" actionText="Clear Filters" onAction={() => { setQuery(''); setCategory(''); setStatus(''); }} />
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Asset ID</th>
                <th>Item Name & Specs</th>
                <th>Category</th>
                <th>Location</th>
                <th>Total / Avail</th>
                <th>Condition</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {assets.map((asset) => (
                <tr key={asset.id}>
                  <td className="mono" style={{ color: '#38bdf8', fontWeight: 700 }}>{asset.assetId}</td>
                  <td>
                    <div style={{ fontWeight: 600 }}>{asset.name}</div>
                    <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{asset.brand} {asset.model} • SN: {asset.serialNumber || 'N/A'}</div>
                    {asset.allocatedProjectName && (
                      <div style={{ fontSize: '0.72rem', color: '#a78bfa' }}>🔗 {asset.allocatedProjectName}</div>
                    )}
                  </td>
                  <td style={{ fontSize: '0.8rem', color: '#cbd5e1' }}>{asset.category?.replace(/_/g, ' ')}</td>
                  <td>{asset.location}</td>
                  <td>
                    <span className="mono" style={{ fontWeight: 700, color: '#fff' }}>{asset.availableQuantity}</span> / {asset.quantity}
                  </td>
                  <td>
                    <StatusBadge status={asset.condition} />
                  </td>
                  <td>
                    <StatusBadge status={asset.status} />
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      {hasRole(['ADMIN', 'LAB_ASSISTANT']) && (
                        <button className="btn btn-secondary" style={{ padding: '4px 8px' }} onClick={() => openEditModal(asset)}>
                          <Edit size={14} />
                        </button>
                      )}
                      {hasRole(['ADMIN']) && (
                        <button className="btn btn-danger" style={{ padding: '4px 8px' }} onClick={() => handleDelete(asset.id, asset.name, asset.assetId)}>
                          <Trash2 size={14} />
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

      {/* Asset Modal */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-box">
            <div className="modal-header">
              <h3>{isEditing ? `Edit Hardware: ${formData.name}` : 'Register New Laboratory Asset'}</h3>
              <button onClick={() => setShowModal(false)} style={{ background: 'transparent', color: '#94a3b8' }}>✕</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="form-grid-2">
                  <div className="form-group">
                    <label>Asset ID (Unique Code)*</label>
                    <input
                      type="text"
                      className="form-control mono"
                      required
                      disabled={isEditing}
                      value={formData.assetId}
                      onChange={(e) => setFormData({ ...formData, assetId: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label>Category*</label>
                    <select
                      className="form-control"
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    >
                      {CATEGORIES.map(c => (
                        <option key={c} value={c}>{c.replace(/_/g, ' ')}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label>Hardware Name*</label>
                  <input
                    type="text"
                    className="form-control"
                    required
                    placeholder="e.g. STM32 Nucleo-F401RE"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>

                <div className="form-grid-2">
                  <div className="form-group">
                    <label>Brand / Manufacturer</label>
                    <input
                      type="text"
                      className="form-control"
                      value={formData.brand || ''}
                      onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label>Model Number</label>
                    <input
                      type="text"
                      className="form-control"
                      value={formData.model || ''}
                      onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                    />
                  </div>
                </div>

                <div className="form-grid-2">
                  <div className="form-group">
                    <label>Serial Number</label>
                    <input
                      type="text"
                      className="form-control mono"
                      value={formData.serialNumber || ''}
                      onChange={(e) => setFormData({ ...formData, serialNumber: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label>Lab Location*</label>
                    <input
                      type="text"
                      className="form-control"
                      required
                      placeholder="e.g. Rack A1, Sensor Drawer 3"
                      value={formData.location || ''}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    />
                  </div>
                </div>

                <div className="form-grid-2">
                  <div className="form-group">
                    <label>Total Units Tracked</label>
                    <input
                      type="number"
                      className="form-control"
                      min="1"
                      value={formData.quantity || 1}
                      onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) || 1 })}
                    />
                  </div>
                  <div className="form-group">
                    <label>Status</label>
                    <select
                      className="form-control"
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    >
                      {STATUSES.map(s => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label>Technical Description & Pinout Notes</label>
                  <textarea
                    rows="3"
                    className="form-control"
                    value={formData.description || ''}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">{isEditing ? 'Save Changes' : 'Register Equipment'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AssetsPage;

