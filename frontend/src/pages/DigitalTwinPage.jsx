import React, { useState, useEffect, useCallback } from 'react';
import { 
  Layers, 
  MapPin, 
  Cpu, 
  Activity, 
  AlertCircle, 
  CheckCircle, 
  Clock, 
  Shield, 
  Wrench,
  Radio,
  X
} from 'lucide-react';
import apiClient from '../api/client';

export const DigitalTwinPage = () => {
  const [layout, setLayout] = useState({
    zones: [
      { id: 'zone-a', name: 'Zone A: Autonomous Ground Robotics Arena', x: 20, y: 20, width: 430, height: 250, color: '#06b6d4' },
      { id: 'zone-b', name: 'Zone B: Drone Aerial Flight Cage', x: 480, y: 20, width: 430, height: 250, color: '#3b82f6' },
      { id: 'zone-c', name: 'Zone C: Embedded AI & Microcontroller Benches', x: 20, y: 300, width: 430, height: 250, color: '#10b981' },
      { id: 'zone-d', name: 'Zone D: Additive Prototyping & Rapid Fabrication', x: 480, y: 300, width: 430, height: 250, color: '#8b5cf6' }
    ],
    workstations: [
      { id: 'ws-1', label: 'Rover Bay 1', x: 40, y: 60, width: 180, height: 85, assetId: 'RB-ROBOT-001', assetName: 'TurtleBot 4 Mobile Base', status: 'IN_USE', operator: 'admin', condition: 'GOOD', operatingHours: 142.5, battery: 78.5, temp: 42.1 },
      { id: 'ws-2', label: 'Rover Bay 2', x: 250, y: 60, width: 180, height: 85, assetId: 'RB-DEV-001', assetName: 'Jetson Orin Nano Dev Kit', status: 'AVAILABLE', operator: 'Unassigned', condition: 'EXCELLENT', operatingHours: 45.0, battery: 100, temp: 35.2 },
      { id: 'ws-3', label: 'Drone Helipad Alpha', x: 500, y: 60, width: 180, height: 85, assetId: 'RB-ROBOT-002', assetName: 'Crazyflie Swarm Drone A1', status: 'AVAILABLE', operator: 'Unassigned', condition: 'GOOD', operatingHours: 68.2, battery: 89.2, temp: 36.8 },
      { id: 'ws-4', label: 'Drone Helipad Beta', x: 710, y: 60, width: 180, height: 85, assetId: 'RB-SENS-002', assetName: 'Optical Flow Camera Node', status: 'AVAILABLE', operator: 'Unassigned', condition: 'GOOD', operatingHours: 112.0, battery: 100, temp: 31.4 },
      { id: 'ws-5', label: 'AI Edge Workbench 1', x: 40, y: 340, width: 180, height: 85, assetId: 'RB-SBC-001', assetName: 'Raspberry Pi 5 8GB Node', status: 'IN_USE', operator: 'assistant', condition: 'GOOD', operatingHours: 230.1, battery: 100, temp: 48.0 },
      { id: 'ws-6', label: 'AI Edge Workbench 2', x: 250, y: 340, width: 180, height: 85, assetId: 'RB-SENS-003', assetName: 'ESP32-S3 AI Cam Array', status: 'AVAILABLE', operator: 'Unassigned', condition: 'EXCELLENT', operatingHours: 19.5, battery: 100, temp: 29.8 },
      { id: 'ws-7', label: 'Rapid Fab Cell 1', x: 500, y: 340, width: 180, height: 85, assetId: 'RB-TOOL-001', assetName: 'Prusa MK4 3D Printer', status: 'MAINTENANCE', operator: 'technician', condition: 'FAIR', operatingHours: 890.4, battery: 100, temp: 68.5 },
      { id: 'ws-8', label: 'Rapid Fab Cell 2', x: 710, y: 340, width: 180, height: 85, assetId: 'RB-ROBOT-003', assetName: 'Bionic Robotic Arm 6-DOF', status: 'AVAILABLE', operator: 'Unassigned', condition: 'GOOD', operatingHours: 310.8, battery: 27.4, temp: 39.4 }
    ]
  });

  const [selectedNode, setSelectedNode] = useState(null);

  const fetchLayout = useCallback(async () => {
    try {
      const res = await apiClient.get('/digital-twin/layout');
      if (res.data?.data?.workstations) {
        setLayout(res.data.data);
      }
    } catch {
      // In local dev, preserve local schematic
    }
  }, []);

  useEffect(() => {
    fetchLayout();
  }, [fetchLayout]);

  return (
    <div className="digital-twin-container" style={{ padding: '1.5rem', maxWidth: '1400px', margin: '0 auto' }}>
      
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
              2D SCHEMATIC VISUALIZER
            </span>
            <span style={{
              background: 'rgba(16, 185, 129, 0.15)',
              color: 'var(--accent-emerald)',
              padding: '3px 8px',
              borderRadius: '4px',
              fontSize: '0.72rem',
              fontWeight: 700
            }}>
              8 Synchronized Workcells
            </span>
          </div>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#fff', letterSpacing: '-0.5px' }}>
            Robotics Digital Twin Studio — 2D Laboratory Map
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
            Interactive coordinate mapping of robotics workcells, docking platforms, and active hardware custody. Click any cell to inspect telemetry.
          </p>
        </div>
      </div>

      {/* 2D Studio Canvas */}
      <div style={{
        position: 'relative',
        width: '940px',
        height: '580px',
        background: '#080d19',
        border: '1px solid #1a2744',
        borderRadius: '12px',
        margin: '0 auto 1.5rem auto',
        overflow: 'hidden',
        boxShadow: 'inset 0 0 50px rgba(0,0,0,0.85)'
      }}>
        
        {/* Laboratory Zones */}
        {layout.zones.map(z => (
          <div
            key={z.id}
            style={{
              position: 'absolute',
              left: `${z.x}px`,
              top: `${z.y}px`,
              width: `${z.width}px`,
              height: `${z.height}px`,
              border: `1px dashed ${z.color}44`,
              borderRadius: '8px',
              padding: '10px',
              fontSize: '0.75rem',
              fontWeight: 700,
              textTransform: 'uppercase',
              color: z.color,
              background: `${z.color}08`,
              pointerEvents: 'none'
            }}
          >
            {z.name}
          </div>
        ))}

        {/* Workstation Cells */}
        {layout.workstations.map(w => {
          const isSelected = selectedNode?.id === w.id;
          const statusBg = w.status === 'IN_USE' ? 'rgba(56, 189, 248, 0.15)' : w.status === 'MAINTENANCE' ? 'rgba(239, 68, 68, 0.15)' : 'rgba(16, 185, 129, 0.15)';
          const statusColor = w.status === 'IN_USE' ? '#38bdf8' : w.status === 'MAINTENANCE' ? '#f87171' : '#34d399';

          return (
            <div
              key={w.id}
              onClick={() => setSelectedNode(w)}
              style={{
                position: 'absolute',
                left: `${w.x}px`,
                top: `${w.y}px`,
                width: `${w.width}px`,
                height: `${w.height}px`,
                background: '#0f172a',
                border: `1px solid ${isSelected ? 'var(--accent-cyan-light)' : '#1e293b'}`,
                borderRadius: '8px',
                padding: '10px',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                transition: 'all 0.2s ease',
                boxShadow: isSelected ? '0 0 16px rgba(56, 189, 248, 0.4)' : '0 2px 8px rgba(0,0,0,0.4)',
                transform: isSelected ? 'translateY(-2px)' : 'none'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <strong style={{ color: '#fff', fontSize: '0.8rem' }}>{w.label}</strong>
                <span style={{
                  padding: '1px 6px',
                  borderRadius: '4px',
                  fontSize: '0.62rem',
                  fontWeight: 700,
                  background: statusBg,
                  color: statusColor
                }}>
                  {w.status}
                </span>
              </div>

              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--accent-cyan-light)', fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {w.assetName}
                </div>
                <div style={{ fontSize: '0.68rem', color: '#64748b', marginTop: '2px' }}>
                  Operator: <span style={{ color: '#94a3b8' }}>{w.operator}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Selected Node Details Drawer / Modal */}
      {selectedNode && (
        <div style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--border-color)',
          borderRadius: '10px',
          padding: '18px',
          maxWidth: '940px',
          margin: '0 auto',
          boxShadow: '0 4px 20px rgba(0,0,0,0.4)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '14px' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#fff', margin: 0 }}>
                  {selectedNode.label} Inspection
                </h3>
                <span style={{
                  padding: '2px 8px',
                  borderRadius: '4px',
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  background: selectedNode.status === 'IN_USE' ? 'rgba(56, 189, 248, 0.2)' : selectedNode.status === 'MAINTENANCE' ? 'rgba(239, 68, 68, 0.2)' : 'rgba(16, 185, 129, 0.2)',
                  color: selectedNode.status === 'IN_USE' ? '#38bdf8' : selectedNode.status === 'MAINTENANCE' ? '#f87171' : '#34d399'
                }}>
                  {selectedNode.status}
                </span>
              </div>
              <div style={{ fontSize: '0.75rem', color: '#64748b', fontFamily: 'JetBrains Mono, monospace', marginTop: '4px' }}>
                Cell ID: {selectedNode.id} | Asset Tag: {selectedNode.assetId}
              </div>
            </div>
            <button onClick={() => setSelectedNode(null)} style={{ background: 'transparent', color: '#94a3b8' }}>
              <X size={18} />
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px', marginBottom: '14px' }}>
            <div style={{ background: '#0a0f1d', padding: '10px', borderRadius: '6px', border: '1px solid #1e293b' }}>
              <div style={{ fontSize: '0.7rem', color: '#64748b' }}>ASSIGNED HARDWARE</div>
              <strong style={{ fontSize: '0.85rem', color: '#fff', display: 'block', marginTop: '2px' }}>{selectedNode.assetName}</strong>
            </div>

            <div style={{ background: '#0a0f1d', padding: '10px', borderRadius: '6px', border: '1px solid #1e293b' }}>
              <div style={{ fontSize: '0.7rem', color: '#64748b' }}>PHYSICAL CONDITION</div>
              <strong style={{ fontSize: '0.85rem', color: '#34d399', display: 'block', marginTop: '2px' }}>{selectedNode.condition}</strong>
            </div>

            <div style={{ background: '#0a0f1d', padding: '10px', borderRadius: '6px', border: '1px solid #1e293b' }}>
              <div style={{ fontSize: '0.7rem', color: '#64748b' }}>OPERATING RUNTIME</div>
              <strong style={{ fontSize: '0.85rem', color: 'var(--accent-cyan-light)', display: 'block', marginTop: '2px' }}>{selectedNode.operatingHours} Hours</strong>
            </div>

            <div style={{ background: '#0a0f1d', padding: '10px', borderRadius: '6px', border: '1px solid #1e293b' }}>
              <div style={{ fontSize: '0.7rem', color: '#64748b' }}>CURRENT OPERATOR</div>
              <strong style={{ fontSize: '0.85rem', color: '#f8fafc', display: 'block', marginTop: '2px' }}>{selectedNode.operator}</strong>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default DigitalTwinPage;

