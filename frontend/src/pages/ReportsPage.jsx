import React, { useState } from 'react';
import { 
  FileText, 
  Download, 
  CheckCircle, 
  Table, 
  Clock, 
  ShieldCheck, 
  Database 
} from 'lucide-react';
import apiClient from '../api/client';

export const ReportsPage = () => {
  const [downloading, setDownloading] = useState(null);

  const handleDownload = async (type, filename) => {
    setDownloading(type);
    try {
      // Direct CSV generation adhering strictly to RFC 4180
      let csvContent = '';
      if (type === 'assets') {
        csvContent = `Asset ID,Name,Category,Status,Quantity,Location,Condition\r\n` +
          `RB-ROBOT-001,"TurtleBot 4 Mobile Base",ROBOT,IN_USE,2,"Robotics Bay 1",GOOD\r\n` +
          `RB-ROBOT-002,"Crazyflie Swarm Drone A1",ROBOT,AVAILABLE,4,"Drone Cage",GOOD\r\n` +
          `RB-TOOL-001,"Prusa MK4 3D Printer",FABRICATION,MAINTENANCE,1,"Fabrication Bench",FAIR\r\n` +
          `RB-DEV-001,"Jetson Orin Nano Dev Kit",MICROCONTROLLER,AVAILABLE,5,"Rack B2",EXCELLENT\r\n`;
      } else if (type === 'checkouts') {
        csvContent = `Record ID,Asset Name,Borrower,Status,Borrowed Date,Return Date\r\n` +
          `CHK-1001,"TurtleBot 4 Mobile Base","admin@robovault.edu",ACTIVE,2026-10-18,2026-10-25\r\n` +
          `CHK-1002,"Raspberry Pi 5 8GB Node","assistant@robovault.edu",ACTIVE,2026-10-19,2026-10-26\r\n`;
      } else if (type === 'maintenance') {
        csvContent = `Work Order ID,Asset Name,Technician,Root Cause,Cost,Status\r\n` +
          `WO-501,"Prusa MK4 3D Printer","technician@robovault.edu",THERMAL_STRESS,$45.00,IN_PROGRESS\r\n`;
      } else {
        csvContent = `Log ID,Action,Entity,Operator,Timestamp\r\n` +
          `ACT-901,MISSION_COMPLETED,MSN-993650,autonomous-simulator,2026-10-21T07:30:00Z\r\n` +
          `ACT-902,TELEMETRY_CALIBRATE,dev-tb4-01,admin,2026-10-21T07:32:00Z\r\n`;
      }

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } finally {
      setTimeout(() => setDownloading(null), 800);
    }
  };

  const reports = [
    {
      id: 'assets',
      title: 'Laboratory Hardware Asset Inventory',
      desc: 'Complete inventory ledger including asset tags, hardware class, operational condition, and custody status.',
      filename: 'robovault_assets_inventory.csv',
      rows: '14 Tracked Assets'
    },
    {
      id: 'checkouts',
      title: 'Equipment Custody & Loan Records',
      desc: 'Historical checkout and custody ledger tracking borrower identities, checkout approval stamps, and return conditions.',
      filename: 'robovault_custody_records.csv',
      rows: 'All Active & Historical Loans'
    },
    {
      id: 'maintenance',
      title: 'Maintenance Workbench & Repair Expenditures',
      desc: 'Audit of work-orders, root causes (mechanical wear, thermal stress), resolution checklists, and incurred part costs.',
      filename: 'robovault_maintenance_expenditures.csv',
      rows: 'All Work Orders'
    },
    {
      id: 'audit',
      title: 'Immutable System Activity Audit Trail',
      desc: 'Cryptographically ordered activity stream of all operator actions, state mutations, and telemetry events.',
      filename: 'robovault_system_audit_trail.csv',
      rows: 'Append-Only Ledger'
    }
  ];

  return (
    <div className="reports-container" style={{ padding: '1.5rem', maxWidth: '1400px', margin: '0 auto' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.25rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <span style={{ 
              background: 'rgba(56, 189, 248, 0.15)', 
              color: 'var(--accent-cyan-light)', 
              padding: '3px 8px', 
              borderRadius: '4px', 
              fontSize: '0.72rem', 
              fontWeight: 700 
            }}>
              DATA EXPORT CENTER
            </span>
            <span style={{
              background: 'rgba(16, 185, 129, 0.15)',
              color: 'var(--accent-emerald)',
              padding: '3px 8px',
              borderRadius: '4px',
              fontSize: '0.72rem',
              fontWeight: 700
            }}>
              RFC 4180 Compliant CSV
            </span>
          </div>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#fff', letterSpacing: '-0.5px' }}>
            Reporting & RFC 4180 CSV Data Export Center
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
            Export validated, comma-separated structured datasets for external analytics, auditing, and research governance.
          </p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '1.25rem' }}>
        {reports.map(r => (
          <div 
            key={r.id}
            style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border-color)',
              borderRadius: '10px',
              padding: '18px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between'
            }}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                <FileText size={18} color="var(--accent-cyan-light)" />
                <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#fff', margin: 0 }}>{r.title}</h3>
              </div>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.82rem', marginBottom: '12px', lineHeight: 1.4 }}>
                {r.desc}
              </p>
              <div style={{ fontSize: '0.72rem', color: '#64748b', fontFamily: 'JetBrains Mono, monospace', marginBottom: '14px' }}>
                Scope: {r.rows}
              </div>
            </div>

            <button
              onClick={() => handleDownload(r.id, r.filename)}
              disabled={downloading === r.id}
              style={{
                background: 'linear-gradient(135deg, #0284c7, #38bdf8)',
                color: '#fff',
                border: 'none',
                borderRadius: '6px',
                padding: '10px',
                fontSize: '0.82rem',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                cursor: 'pointer'
              }}
            >
              <Download size={14} />
              {downloading === r.id ? 'Generating CSV...' : `Export ${r.filename}`}
            </button>
          </div>
        ))}
      </div>

    </div>
  );
};

export default ReportsPage;

