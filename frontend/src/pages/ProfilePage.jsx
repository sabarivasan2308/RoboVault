import React from 'react';
import { useAuth } from '../auth/AuthContext';
import StatusBadge from '../components/StatusBadge';
import { User, Shield, Mail, Building, Clock, Key, CheckCircle, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function ProfilePage() {
  const { user } = useAuth();

  const getRolePermissions = (role) => {
    switch (role) {
      case 'ADMIN':
        return [
          'Full read & write access across all laboratory assets and inventory',
          'Approve, reject, issue, and inspect checkouts and returns',
          'Create, assign, resolve, and close maintenance and repair work-orders',
          'User administration: create accounts, adjust roles, toggle active status',
          'Full access to immutable activity audit trails and utilization analytics',
          'Project hardware pool dedication and override capability'
        ];
      case 'LAB_ASSISTANT':
        return [
          'Manage physical inventory, locations, and condition inspections',
          'Fulfill approved equipment checkouts and process return evaluations',
          'Execute diagnostic maintenance tickets and record repair parts/costs',
          'Assign defect reports and report physical damage or hardware failure',
          'Inspect system audit trails for operational verification'
        ];
      case 'FACULTY':
        return [
          'Create, lead, and manage research and robotics projects',
          'Request multi-unit equipment checkouts for academic cohorts',
          'Inspect real-time inventory levels and component availability',
          'Report equipment malfunctions and view dedicated project allocations'
        ];
      case 'STUDENT':
      default:
        return [
          'Browse and filter laboratory robots, microcontrollers, and sensors',
          'Submit equipment checkout requests with expected return timelines',
          'Track personal borrow history, approval status, and active return deadlines',
          'Report hardware defects, damaged components, or faulty behavior'
        ];
    }
  };

  const permissions = getRolePermissions(user?.role);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', maxWidth: '960px', margin: '0 auto' }}>
      {/* Page Title */}
      <div>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 700, margin: 0 }}>Operator Profile & Permissions</h1>
        <p style={{ color: 'var(--text-muted)', margin: '0.25rem 0 0 0' }}>
          Account credentials, role-based authorization matrix, and active session details
        </p>
      </div>

      {/* Profile Card */}
      <div className="card" style={{ display: 'flex', gap: '1.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
        <div style={{
          width: '80px',
          height: '80px',
          borderRadius: '50%',
          background: 'linear-gradient(135deg, var(--primary) 0%, #3b82f6 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#fff',
          boxShadow: '0 4px 14px rgba(6, 182, 212, 0.4)'
        }}>
          <User size={40} />
        </div>

        <div style={{ flex: 1, minWidth: '220px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 700, margin: 0 }}>{user?.fullName || 'Lab Operator'}</h2>
            <StatusBadge status={user?.role || 'STUDENT'} />
          </div>
          <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '0.25rem' }}>
            @{user?.username} • {user?.department || 'Robotics Laboratory'}
          </div>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          <Link to="/checkouts" className="btn btn-outline" style={{ fontSize: '0.85rem' }}>
            <span>My Checkouts</span>
            <ArrowRight size={14} />
          </Link>
          <Link to="/assets" className="btn btn-primary" style={{ fontSize: '0.85rem' }}>
            <span>Browse Assets</span>
          </Link>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
        {/* Account Details */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.1rem', fontWeight: 600 }}>
            <Shield size={18} style={{ color: 'var(--primary)' }} />
            <span>Account Specifications</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.9rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem' }}>
              <span style={{ color: 'var(--text-muted)' }}>Email</span>
              <strong style={{ color: 'var(--text-primary)' }}>{user?.email || 'N/A'}</strong>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem' }}>
              <span style={{ color: 'var(--text-muted)' }}>Department</span>
              <strong style={{ color: 'var(--text-primary)' }}>{user?.department || 'Robotics Engineering'}</strong>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem' }}>
              <span style={{ color: 'var(--text-muted)' }}>Assigned Role</span>
              <strong style={{ color: 'var(--primary)' }}>{user?.role}</strong>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem' }}>
              <span style={{ color: 'var(--text-muted)' }}>Account State</span>
              <span style={{ color: 'var(--success)', fontWeight: 600 }}>Active & Verified</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-muted)' }}>Authentication Protocol</span>
              <span style={{ color: 'var(--text-secondary)' }}>HMAC-SHA256 JWT</span>
            </div>
          </div>
        </div>

        {/* Role Permissions Card */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.1rem', fontWeight: 600 }}>
            <Key size={18} style={{ color: 'var(--secondary)' }} />
            <span>Authorized Privileges</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
            {permissions.map((perm, idx) => (
              <div key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', fontSize: '0.85rem' }}>
                <CheckCircle size={15} style={{ color: 'var(--success)', marginTop: '0.15rem', flexShrink: 0 }} />
                <span style={{ color: 'var(--text-secondary)' }}>{perm}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

