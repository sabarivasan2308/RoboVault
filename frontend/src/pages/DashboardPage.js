import React, { useEffect, useState } from 'react';
import StatCard from '../components/StatCard';
import StatusBadge from '../components/StatusBadge';
import { dashboardApi, assetApi } from '../services/api';

const DashboardPage = ({ setActiveTab }) => {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [recentAssets, setRecentAssets] = useState([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const data = await dashboardApi.getSummary();
      setSummary(data);
      const assets = await assetApi.getAll();
      setRecentAssets(assets.slice(0, 5));
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="page-content" style={{ color: '#94a3b8' }}>Loading laboratory telemetry...</div>;
  }

  const utilizationRate = summary?.totalAssets
    ? Math.round((summary.inUseAssets / summary.totalAssets) * 100)
    : 0;

  return (
    <div className="page-content">
      {/* Metrics Row */}
      <div className="stat-grid">
        <StatCard
          label="Total Assets"
          value={summary?.totalAssets || 0}
          icon="📦"
          color="#38bdf8"
          subtitle="Cataloged in RoboVault"
        />
        <StatCard
          label="Available"
          value={summary?.availableAssets || 0}
          icon="✅"
          color="#10b981"
          subtitle="Ready for student checkout"
        />
        <StatCard
          label="In Use"
          value={summary?.inUseAssets || 0}
          icon="⚡"
          color="#0284c7"
          subtitle={`${utilizationRate}% utilization rate`}
        />
        <StatCard
          label="Maintenance"
          value={summary?.maintenanceAssets || 0}
          icon="🔧"
          color="#f59e0b"
          subtitle="Under repair / calibration"
        />
        <StatCard
          label="Damaged"
          value={summary?.damagedAssets || 0}
          icon="⚠️"
          color="#ef4444"
          subtitle="Requires attention"
        />
        <StatCard
          label="Overdue"
          value={summary?.overdueAssets || 0}
          icon="⏰"
          color="#ec4899"
          subtitle="Past expected return"
        />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '20px', marginBottom: '24px' }}>
        {/* Quick Asset Overview */}
        <div className="table-card">
          <div className="table-header-title">
            <h3>Featured Robotics Lab Equipment</h3>
            <button className="btn-secondary" onClick={() => setActiveTab('assets')}>
              View All Assets →
            </button>
          </div>
          <table className="responsive-table">
            <thead>
              <tr>
                <th>Asset ID</th>
                <th>Name</th>
                <th>Category</th>
                <th>Location</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {recentAssets.map((asset) => (
                <tr key={asset.id || asset.assetId}>
                  <td className="mono-font" style={{ fontWeight: 600, color: '#38bdf8' }}>
                    {asset.assetId}
                  </td>
                  <td>{asset.name}</td>
                  <td>
                    <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
                      {asset.category?.replace('_', ' ')}
                    </span>
                  </td>
                  <td>{asset.location}</td>
                  <td>
                    <StatusBadge status={asset.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Live Activity Stream */}
        <div className="table-card">
          <div className="table-header-title">
            <h3>Laboratory Activity Log</h3>
          </div>
          <div className="activity-list">
            {summary?.recentActivity && summary.recentActivity.length > 0 ? (
              summary.recentActivity.map((act, i) => (
                <div key={act.id || i} className="activity-item">
                  <div className="activity-bullet"></div>
                  <div className="activity-content">
                    <p>{act.description}</p>
                    <div className="activity-meta">
                      By {act.performedBy} • {new Date(act.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div style={{ padding: '20px', color: '#64748b' }}>No recent activities logged</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;

