import React, { useEffect, useState } from 'react';
import { dashboardApi } from '../api/dashboardApi';
import StatCard from '../components/StatCard';
import StatusBadge from '../components/StatusBadge';
import { 
  Cpu, 
  CheckCircle, 
  Zap, 
  Wrench, 
  AlertTriangle, 
  Clock, 
  Activity 
} from 'lucide-react';
import { 
  PieChart, 
  Pie, 
  Cell, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';

const COLORS = ['#10b981', '#0ea5e9', '#8b5cf6', '#f59e0b', '#ef4444', '#ec4899', '#64748b'];

export const DashboardPage = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      const summary = await dashboardApi.getSummary();
      setData(summary);
    } catch (e) {
      console.error("Dashboard telemetry error:", e);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div style={{ color: '#94a3b8', padding: '40px', textAlign: 'center' }}>Connecting to MongoDB telemetry stream...</div>;
  }

  return (
    <div>
      {/* KPI Stats Grid */}
      <div className="stat-grid">
        <StatCard
          title="Total Hardware Items"
          value={data?.totalAssets || 0}
          icon={<Cpu size={20} />}
          color="#38bdf8"
          subtitle={`${data?.totalInventoryUnits || 0} physical units tracked`}
        />
        <StatCard
          title="Available for Checkout"
          value={data?.availableAssets || 0}
          icon={<CheckCircle size={20} />}
          color="#10b981"
          subtitle="Ready in lab racks"
        />
        <StatCard
          title="Currently In Use"
          value={data?.inUseAssets || 0}
          icon={<Zap size={20} />}
          color="#0284c7"
          subtitle={`${data?.utilizationRate || 0}% active utilization`}
        />
        <StatCard
          title="Under Maintenance"
          value={data?.maintenanceAssets || 0}
          icon={<Wrench size={20} />}
          color="#f59e0b"
          subtitle="In diagnostics / repair"
        />
        <StatCard
          title="Reported Damaged"
          value={data?.damagedAssets || 0}
          icon={<AlertTriangle size={20} />}
          color="#ef4444"
          subtitle="Requires attention"
        />
        <StatCard
          title="Overdue Returns"
          value={data?.overdueCheckouts || 0}
          icon={<Clock size={20} />}
          color="#ec4899"
          subtitle="Past scheduled due date"
        />
      </div>

      {/* Analytics Visualizations Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))', gap: '20px', marginBottom: '24px' }}>
        {/* Status Distribution Pie Chart */}
        <div className="card" style={{ padding: '20px' }}>
          <div className="card-title" style={{ marginBottom: '16px' }}>Equipment Status Telemetry</div>
          <div style={{ height: 260 }}>
            {data?.statusDistribution && data.statusDistribution.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data.statusDistribution}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {data.statusDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#273552', color: '#fff', borderRadius: '8px' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div style={{ textAlign: 'center', color: '#64748b', paddingTop: '100px' }}>No status data available</div>
            )}
          </div>
        </div>

        {/* Category Breakdown Bar Chart */}
        <div className="card" style={{ padding: '20px' }}>
          <div className="card-title" style={{ marginBottom: '16px' }}>Catalog Category Distribution</div>
          <div style={{ height: 260 }}>
            {data?.categoryDistribution && data.categoryDistribution.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.categoryDistribution} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                  <XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 11 }} angle={-25} textAnchor="end" />
                  <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#273552', color: '#fff', borderRadius: '8px' }}
                  />
                  <Bar dataKey="value" fill="#0ea5e9" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div style={{ textAlign: 'center', color: '#64748b', paddingTop: '100px' }}>No category data available</div>
            )}
          </div>
        </div>
      </div>

      {/* Activity Timeline and Overdue Table */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '20px' }}>
        {/* Overdue Checkouts Notice */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Attention: Overdue Equipment Loans ({data?.overdueList?.length || 0})</h3>
          </div>
          <table className="data-table">
            <thead>
              <tr>
                <th>Request ID</th>
                <th>Asset</th>
                <th>Borrower</th>
                <th>Due Date</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {data?.overdueList && data.overdueList.length > 0 ? (
                data.overdueList.map((chk) => (
                  <tr key={chk.id}>
                    <td className="mono" style={{ color: '#38bdf8' }}>{chk.requestId}</td>
                    <td>{chk.assetName}</td>
                    <td>{chk.userName}</td>
                    <td className="mono" style={{ color: '#fb7185' }}>{chk.dueDate}</td>
                    <td><StatusBadge status="OVERDUE" /></td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" style={{ textAlign: 'center', color: '#64748b', padding: '24px' }}>
                    ✓ No overdue equipment at this time.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Live Lab Activity Feed */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Activity size={18} color="#38bdf8" />
              Recent Audit Log
            </h3>
          </div>
          <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {data?.recentActivity && data.recentActivity.length > 0 ? (
              data.recentActivity.slice(0, 5).map((act, i) => (
                <div key={act.id || i} style={{ borderBottom: '1px solid #273552', paddingBottom: '10px' }}>
                  <div style={{ fontSize: '0.85rem', color: '#f8fafc' }}>{act.description}</div>
                  <div style={{ fontSize: '0.74rem', color: '#64748b', marginTop: '4px' }}>
                    {act.actor} • {new Date(act.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              ))
            ) : (
              <div style={{ color: '#64748b', textAlign: 'center' }}>No recent activity</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
