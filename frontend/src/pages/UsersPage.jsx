import React, { useState, useEffect } from 'react';
import { userApi } from '../api/userApi';
import { useAuth } from '../auth/AuthContext';
import StatusBadge from '../components/StatusBadge';
import EmptyState from '../components/EmptyState';
import { Users, UserPlus, Shield, Edit2, Check, X, Lock } from 'lucide-react';

export default function UsersPage() {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [roleFilter, setRoleFilter] = useState('');
  const [search, setSearch] = useState('');

  // Modals
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  // Form states
  const [newUser, setNewUser] = useState({
    username: '',
    email: '',
    fullName: '',
    password: '',
    role: 'STUDENT',
    department: 'Robotics & Automation',
    phoneNumber: ''
  });

  const [editUser, setEditUser] = useState({
    fullName: '',
    email: '',
    role: '',
    department: '',
    phoneNumber: ''
  });

  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState(null);

  useEffect(() => {
    fetchUsers();
  }, [roleFilter]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const params = {};
      if (roleFilter) params.role = roleFilter;
      const res = await userApi.getUsers(params);
      setUsers(res?.data?.data?.content || []);
    } catch (err) {
      console.error(err);
      setFeedback({ type: 'error', text: 'Failed to load user accounts.' });
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await userApi.createUser(newUser);
      setFeedback({ type: 'success', text: `Account for ${newUser.username} created successfully.` });
      setShowCreateModal(false);
      setNewUser({
        username: '',
        email: '',
        fullName: '',
        password: '',
        role: 'STUDENT',
        department: 'Robotics & Automation',
        phoneNumber: ''
      });
      fetchUsers();
    } catch (err) {
      setFeedback({ type: 'error', text: err?.response?.data?.message || 'Error creating user.' });
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = async (e) => {
    e.preventDefault();
    if (!selectedUser) return;
    setSaving(true);
    try {
      await userApi.updateUser(selectedUser.id, editUser);
      setFeedback({ type: 'success', text: `User ${selectedUser.username} updated successfully.` });
      setShowEditModal(false);
      fetchUsers();
    } catch (err) {
      setFeedback({ type: 'error', text: err?.response?.data?.message || 'Error updating user.' });
    } finally {
      setSaving(false);
    }
  };

  const handleToggleStatus = async (user) => {
    if (user.id === currentUser?.id) {
      alert('You cannot deactivate your own account.');
      return;
    }
    const newStatus = !user.active;
    const action = newStatus ? 'activate' : 'deactivate';
    if (!window.confirm(`Are you sure you want to ${action} user ${user.username}?`)) return;

    try {
      await userApi.toggleStatus(user.id, newStatus);
      setFeedback({ type: 'success', text: `User ${user.username} has been ${action}d.` });
      fetchUsers();
    } catch (err) {
      setFeedback({ type: 'error', text: err?.response?.data?.message || `Failed to ${action} user.` });
    }
  };

  const openEditModal = (user) => {
    setSelectedUser(user);
    setEditUser({
      fullName: user.fullName || '',
      email: user.email || '',
      role: user.role || 'STUDENT',
      department: user.department || '',
      phoneNumber: user.phoneNumber || ''
    });
    setShowEditModal(true);
  };

  const filteredUsers = users.filter((u) => {
    const term = search.toLowerCase();
    return (
      u.username?.toLowerCase().includes(term) ||
      u.fullName?.toLowerCase().includes(term) ||
      u.email?.toLowerCase().includes(term) ||
      u.department?.toLowerCase().includes(term)
    );
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Page Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 700, margin: 0 }}>Laboratory User Directory</h1>
          <p style={{ color: 'var(--text-muted)', margin: '0.25rem 0 0 0' }}>
            Manage staff privileges, student authorization, faculty access, and role assignments
          </p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowCreateModal(true)}>
          <UserPlus size={18} />
          <span>Add User</span>
        </button>
      </div>

      {feedback && (
        <div className={`alert alert-${feedback.type === 'error' ? 'danger' : 'success'}`} style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span>{feedback.text}</span>
          <button onClick={() => setFeedback(null)} style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer' }}>×</button>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="card" style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
        <input
          type="text"
          placeholder="Search by name, username, email, department..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="form-control"
          style={{ flex: 1, minWidth: '240px' }}
        />
        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="form-control"
          style={{ width: '180px' }}
        >
          <option value="">All Roles</option>
          <option value="ADMIN">Administrator</option>
          <option value="LAB_ASSISTANT">Lab Assistant</option>
          <option value="FACULTY">Faculty</option>
          <option value="STUDENT">Student</option>
        </select>
      </div>

      {/* Users Table */}
      {loading ? (
        <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>Loading accounts...</div>
      ) : filteredUsers.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No users found"
          description="Create accounts for lab technicians, students, and faculty researchers."
          actionText="Add User"
          onAction={() => setShowCreateModal(true)}
        />
      ) : (
        <div className="table-responsive">
          <table className="table">
            <thead>
              <tr>
                <th>User Details</th>
                <th>Role</th>
                <th>Department</th>
                <th>Status</th>
                <th>Created</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((u) => (
                <tr key={u.id}>
                  <td>
                    <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{u.fullName}</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>@{u.username} • {u.email}</div>
                  </td>
                  <td>
                    <StatusBadge status={u.role} />
                  </td>
                  <td>
                    <span style={{ fontSize: '0.85rem' }}>{u.department || 'General'}</span>
                  </td>
                  <td>
                    <span style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.3rem',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      padding: '0.2rem 0.6rem',
                      borderRadius: '12px',
                      background: u.active ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                      color: u.active ? 'var(--success)' : 'var(--danger)'
                    }}>
                      <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'currentColor' }}></span>
                      {u.active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : 'N/A'}
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <div style={{ display: 'inline-flex', gap: '0.4rem' }}>
                      <button
                        className="btn btn-outline"
                        style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}
                        onClick={() => openEditModal(u)}
                        title="Edit User"
                      >
                        <Edit2 size={13} />
                        <span>Edit</span>
                      </button>
                      <button
                        className="btn btn-outline"
                        style={{
                          padding: '0.25rem 0.5rem',
                          fontSize: '0.75rem',
                          color: u.active ? 'var(--danger)' : 'var(--success)',
                          borderColor: u.active ? 'rgba(239,68,68,0.3)' : 'rgba(16,185,129,0.3)'
                        }}
                        onClick={() => handleToggleStatus(u)}
                        disabled={u.id === currentUser?.id}
                      >
                        {u.active ? 'Deactivate' : 'Activate'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Create User Modal */}
      {showCreateModal && (
        <div className="modal-backdrop">
          <div className="modal-content" style={{ maxWidth: '520px' }}>
            <div className="modal-header">
              <h2 style={{ fontSize: '1.25rem', fontWeight: 600, margin: 0 }}>Create User Account</h2>
              <button onClick={() => setShowCreateModal(false)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleCreate}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="form-group">
                    <label className="form-label">Username *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. jdoe"
                      className="form-control"
                      value={newUser.username}
                      onChange={(e) => setNewUser({ ...newUser, username: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Role *</label>
                    <select
                      className="form-control"
                      value={newUser.role}
                      onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                    >
                      <option value="STUDENT">Student</option>
                      <option value="FACULTY">Faculty</option>
                      <option value="LAB_ASSISTANT">Lab Assistant</option>
                      <option value="ADMIN">Administrator</option>
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Full Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. John Doe"
                    className="form-control"
                    value={newUser.fullName}
                    onChange={(e) => setNewUser({ ...newUser, fullName: e.target.value })}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="form-group">
                    <label className="form-label">Email Address *</label>
                    <input
                      type="email"
                      required
                      placeholder="user@university.edu"
                      className="form-control"
                      value={newUser.email}
                      onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Initial Password *</label>
                    <input
                      type="password"
                      required
                      placeholder="••••••••"
                      className="form-control"
                      value={newUser.password}
                      onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="form-group">
                    <label className="form-label">Department</label>
                    <input
                      type="text"
                      placeholder="e.g. Robotics & Mechatronics"
                      className="form-control"
                      value={newUser.department}
                      onChange={(e) => setNewUser({ ...newUser, department: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Phone Number</label>
                    <input
                      type="text"
                      placeholder="e.g. +1 555-0199"
                      className="form-control"
                      value={newUser.phoneNumber}
                      onChange={(e) => setNewUser({ ...newUser, phoneNumber: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-outline" onClick={() => setShowCreateModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? 'Creating...' : 'Register Account'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {showEditModal && selectedUser && (
        <div className="modal-backdrop">
          <div className="modal-content" style={{ maxWidth: '500px' }}>
            <div className="modal-header">
              <h2 style={{ fontSize: '1.25rem', fontWeight: 600, margin: 0 }}>Edit User: @{selectedUser.username}</h2>
              <button onClick={() => setShowEditModal(false)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleEdit}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Full Name *</label>
                  <input
                    type="text"
                    required
                    className="form-control"
                    value={editUser.fullName}
                    onChange={(e) => setEditUser({ ...editUser, fullName: e.target.value })}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="form-group">
                    <label className="form-label">Email *</label>
                    <input
                      type="email"
                      required
                      className="form-control"
                      value={editUser.email}
                      onChange={(e) => setEditUser({ ...editUser, email: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Role *</label>
                    <select
                      className="form-control"
                      value={editUser.role}
                      onChange={(e) => setEditUser({ ...editUser, role: e.target.value })}
                    >
                      <option value="STUDENT">Student</option>
                      <option value="FACULTY">Faculty</option>
                      <option value="LAB_ASSISTANT">Lab Assistant</option>
                      <option value="ADMIN">Administrator</option>
                    </select>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="form-group">
                    <label className="form-label">Department</label>
                    <input
                      type="text"
                      className="form-control"
                      value={editUser.department}
                      onChange={(e) => setEditUser({ ...editUser, department: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Phone Number</label>
                    <input
                      type="text"
                      className="form-control"
                      value={editUser.phoneNumber}
                      onChange={(e) => setEditUser({ ...editUser, phoneNumber: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-outline" onClick={() => setShowEditModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? 'Updating...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

