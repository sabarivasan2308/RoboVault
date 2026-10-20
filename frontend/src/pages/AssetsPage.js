import React, { useState, useEffect } from 'react';
import StatusBadge from '../components/StatusBadge';
import { assetApi } from '../services/api';

const CATEGORIES = [
  { value: '', label: 'All Categories' },
  { value: 'ROBOTS', label: 'Robots' },
  { value: 'MICROCONTROLLERS', label: 'Microcontrollers' },
  { value: 'DEVELOPMENT_BOARDS', label: 'Development Boards' },
  { value: 'SENSORS', label: 'Sensors' },
  { value: 'MOTORS', label: 'Motors' },
  { value: 'MOTOR_DRIVERS', label: 'Motor Drivers' },
  { value: 'COMMUNICATION_MODULES', label: 'Communication Modules' },
  { value: 'POWER_SUPPLIES', label: 'Power Supplies' },
  { value: 'ELECTRONIC_COMPONENTS', label: 'Electronic Components' },
  { value: 'TOOLS', label: 'Tools' },
  { value: 'TEST_EQUIPMENT', label: 'Test Equipment' },
  { value: 'THREE_D_PRINTERS', label: '3D Printers' }
];

const STATUSES = [
  { value: '', label: 'All Statuses' },
  { value: 'AVAILABLE', label: 'Available' },
  { value: 'IN_USE', label: 'In Use' },
  { value: 'RESERVED', label: 'Reserved' },
  { value: 'MAINTENANCE', label: 'Maintenance' },
  { value: 'DAMAGED', label: 'Damaged' },
  { value: 'LOST', label: 'Lost' },
  { value: 'RETIRED', label: 'Retired' }
];

const AssetsPage = ({ currentUser }) => {
  const [assets, setAssets] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [loading, setLoading] = useState(true);

  // Modal states
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
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
  }, [categoryFilter, statusFilter]);

  const fetchAssets = async () => {
    setLoading(true);
    try {
      const data = await assetApi.search(searchQuery, categoryFilter, statusFilter);
      setAssets(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchAssets();
  };

  const handleOpenAdd = () => {
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
    setShowAddModal(true);
  };

  const handleOpenEdit = (asset) => {
    setSelectedAsset(asset);
    setFormData({ ...asset });
    setShowEditModal(true);
  };

  const handleSaveAdd = async (e) => {
    e.preventDefault();
    try {
      await assetApi.create(formData);
      setShowAddModal(false);
      fetchAssets();
    } catch (e) {
      alert("Error saving asset: " + (e.response?.data?.message || e.message));
    }
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    try {
      await assetApi.update(selectedAsset.id || selectedAsset.assetId, formData);
      setShowEditModal(false);
      fetchAssets();
    } catch (e) {
      alert("Error updating asset: " + (e.response?.data?.message || e.message));
    }
  };

  const handleDelete = async (asset) => {
    if (window.confirm(`Are you sure you want to remove asset ${asset.name} (${asset.assetId})?`)) {
      try {
        await assetApi.delete(asset.id || asset.assetId);
        fetchAssets();
      } catch (e) {
        alert("Error deleting asset: " + e.message);
      }
    }
  };

  return (
    <div className="page-content">
      {/* Control bar */}
      <div className="control-bar">
        <form onSubmit={handleSearchSubmit} className="search-input-group">
          <span className="search-icon-placeholder">🔍</span>
          <input
            type="text"
            className="search-input"
            placeholder="Search by ID, name, brand, model..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </form>

        <div className="filter-group">
          <select
            className="filter-select"
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
          >
            {CATEGORIES.map((c) => (
              <option key={c.value} value={c.value}>{c.label}</option>
            ))}
          </select>

          <select
            className="filter-select"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            {STATUSES.map((s) => (
              <option key={s.value} value={s.value}>{s.label}</option>
            ))}
          </select>

          <button className="btn-primary" onClick={handleOpenAdd}>
            <span>+</span> Register New Asset
          </button>
        </div>
      </div>

      {/* Assets Table */}
      <div className="table-card">
        <div className="table-header-title">
          <h3>Hardware & Instrumentation ({assets.length} items)</h3>
        </div>

        {loading ? (
          <div style={{ padding: '24px', color: '#94a3b8' }}>Loading laboratory items...</div>
        ) : (
          <table className="responsive-table">
            <thead>
              <tr>
                <th>Asset ID</th>
                <th>Item Name</th>
                <th>Category</th>
                <th>Brand / Model</th>
                <th>Location</th>
                <th>Qty</th>
                <th>Condition</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {assets.map((asset) => (
                <tr key={asset.id || asset.assetId}>
                  <td className="mono-font" style={{ fontWeight: 700, color: '#38bdf8' }}>
                    {asset.assetId}
                  </td>
                  <td>
                    <div style={{ fontWeight: 600 }}>{asset.name}</div>
                    {asset.allocatedProjectName && (
                      <div style={{ fontSize: '0.75rem', color: '#a78bfa' }}>
                        🔗 Allocated: {asset.allocatedProjectName}
                      </div>
                    )}
                  </td>
                  <td>{asset.category?.replace('_', ' ')}</td>
                  <td>{asset.brand} {asset.model}</td>
                  <td>{asset.location}</td>
                  <td>{asset.quantity}</td>
                  <td>
                    <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>{asset.condition}</span>
                  </td>
                  <td>
                    <StatusBadge status={asset.status} />
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button className="btn-secondary" style={{ padding: '5px 10px', fontSize: '0.8rem' }} onClick={() => handleOpenEdit(asset)}>
                        Edit
                      </button>
                      {currentUser?.role === 'ADMIN' && (
                        <button className="btn-danger" style={{ padding: '5px 10px', fontSize: '0.8rem' }} onClick={() => handleDelete(asset)}>
                          Delete
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Add / Edit Asset Modal */}
      {(showAddModal || showEditModal) && (
        <div className="modal-overlay">
          <div className="modal-card">
            <div className="modal-header">
              <h3>{showAddModal ? "Register Laboratory Hardware Asset" : "Update Asset Specs"}</h3>
              <button className="close-btn" onClick={() => { setShowAddModal(false); setShowEditModal(false); }}>✕</button>
            </div>
            <form onSubmit={showAddModal ? handleSaveAdd : handleSaveEdit}>
              <div className="modal-body">
                <div className="form-row">
                  <div className="form-group">
                    <label>Asset ID (Unique Identifier)*</label>
                    <input
                      type="text"
                      className="form-control mono-font"
                      required
                      value={formData.assetId}
                      disabled={showEditModal}
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
                      {CATEGORIES.filter(c => c.value).map(c => (
                        <option key={c.value} value={c.value}>{c.label}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label>Asset Name*</label>
                  <input
                    type="text"
                    className="form-control"
                    required
                    placeholder="e.g. STM32 Nucleo-F401RE"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Brand / Manufacturer</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="e.g. STMicroelectronics"
                      value={formData.brand || ''}
                      onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label>Model Number</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="e.g. NUCLEO-F401RE"
                      value={formData.model || ''}
                      onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Serial Number</label>
                    <input
                      type="text"
                      className="form-control mono-font"
                      placeholder="e.g. STM32F4-9901"
                      value={formData.serialNumber || ''}
                      onChange={(e) => setFormData({ ...formData, serialNumber: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label>Laboratory Location*</label>
                    <input
                      type="text"
                      className="form-control"
                      required
                      placeholder="e.g. Robotics Lab - Rack A1"
                      value={formData.location || ''}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Quantity</label>
                    <input
                      type="number"
                      className="form-control"
                      min="1"
                      value={formData.quantity || 1}
                      onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) || 1 })}
                    />
                  </div>
                  <div className="form-group">
                    <label>Current Status</label>
                    <select
                      className="form-control"
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    >
                      {STATUSES.filter(s => s.value).map(s => (
                        <option key={s.value} value={s.value}>{s.label}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label>Hardware Description & Specs</label>
                  <textarea
                    rows="3"
                    className="form-control"
                    placeholder="Enter technical specifications, operating voltage, accessories..."
                    value={formData.description || ''}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn-secondary" onClick={() => { setShowAddModal(false); setShowEditModal(false); }}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  {showAddModal ? "Register Equipment" : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AssetsPage;

