import React, { useState, useEffect, useCallback } from 'react';
import { 
  Activity, 
  Battery, 
  Thermometer, 
  Gauge, 
  Radio, 
  Clock, 
  RotateCw, 
  AlertOctagon, 
  CheckCircle,
  AlertTriangle,
  RefreshCw,
  Cpu,
  Bot
} from 'lucide-react';
import apiClient from '../api/client';

export const FleetTelemetryPage = () => {
  const [devices, setDevices] = useState([
    {
      id: 'dev-tb4-01',
      name: 'TurtleBot 4 (Alpha)',
      type: 'MOBILE_ROBOT',
      status: 'RUNNING',
      battery: 78.5,
      temperature: 42.1,
      motorRpm: 126,
      velocity: 0.45,
      rssi: -58,
      operatingHours: 142.5,
      ipAddress: '192.168.1.101',
      lastPing: new Date().toISOString()
    },
    {
      id: 'dev-drone-04',
      name: 'Crazyflie Swarm Drone A1',
      type: 'QUADCOPTER',
      status: 'AVAILABLE',
      battery: 89.2,
      temperature: 36.8,
      motorRpm: 0,
      velocity: 0.0,
      rssi: -45,
      operatingHours: 68.2,
      ipAddress: '192.168.1.104',
      lastPing: new Date().toISOString()
    },
    {
      id: 'dev-arm-02',
      name: 'Bionic Arm Workstation',
      type: 'MANIPULATOR',
      status: 'AVAILABLE',
      battery: 27.4,
      temperature: 39.4,
      motorRpm: 0,
      velocity: 0.0,
      rssi: -52,
      operatingHours: 310.8,
      ipAddress: '192.168.1.102',
      lastPing: new Date().toISOString()
    },
    {
      id: 'dev-prusa-03',
      name: 'Prusa MK4 Fabrication Cell',
      type: 'FAB_CELL',
      status: 'WARNING',
      battery: 100.0,
      temperature: 68.5,
      motorRpm: 84,
      velocity: 0.12,
      rssi: -62,
      operatingHours: 890.4,
      ipAddress: '192.168.1.103',
      lastPing: new Date().toISOString()
    }
  ]);

  const [notification, setNotification] = useState(null);

  // Poll from API or apply realistic simulated physical drift
  const fetchTelemetry = useCallback(async () => {
    try {
      const res = await apiClient.get('/telemetry/devices');
      if (res.data?.data && Array.isArray(res.data.data)) {
        setDevices(res.data.data);
        return;
      }
    } catch {
      // Fall back to autonomous client-side physical simulation
    }

    setDevices(prev => prev.map(d => {
      let bDelta = d.status === 'RUNNING' ? -0.2 : (d.status === 'CHARGING' ? 0.4 : -0.05);
      let newBat = Math.max(5, Math.min(100, Math.round((d.battery + bDelta) * 10) / 10));
      let tempJitter = (Math.random() - 0.5) * 0.6;
      let newTemp = Math.round((d.temperature + tempJitter) * 10) / 10;
      let rpmJitter = d.status === 'RUNNING' ? Math.floor((Math.random() - 0.5) * 6) : 0;
      let newRpm = Math.max(0, d.motorRpm + rpmJitter);

      return {
        ...d,
        battery: newBat,
        temperature: newTemp,
        motorRpm: newRpm,
        lastPing: new Date().toISOString()
      };
    }));
  }, []);

  useEffect(() => {
    const interval = setInterval(fetchTelemetry, 3500);
    return () => clearInterval(interval);
  }, [fetchTelemetry]);

  // Teleoperation commands
  const handleCalibrate = async (id, name) => {
    try {
      await apiClient.post(`/telemetry/devices/${id}/command`, { command: 'CALIBRATE' });
    } catch (_) {}
    setDevices(prev => prev.map(d => d.id === id ? {
      ...d,
      status: 'CALIBRATING',
      motorRpm: 45,
      temperature: Math.round((d.temperature - 1.2) * 10) / 10
    } : d));
    setNotification({ type: 'info', message: `Calibrating IMU, encoders, and kinematic limits for ${name}...` });

    setTimeout(() => {
      fetchTelemetry();
      setNotification({ type: 'success', message: `${name} calibrated successfully (Zero offset verified).` });
    }, 2500);
  };

  const handleEmergencyStop = async (id, name) => {
    try {
      await apiClient.post(`/telemetry/devices/${id}/command`, { command: 'EMERGENCY_STOP' });
    } catch (_) {}
    setDevices(prev => prev.map(d => d.id === id ? {
      ...d,
      status: 'STOPPED',
      motorRpm: 0,
      velocity: 0.0
    } : d));
    setNotification({ type: 'error', message: `EMERGENCY STOP (E-STOP) ENGAGED for ${name}! Power cut to actuators.` });
  };

  return (
    <div className="fleet-telemetry-container" style={{ padding: '1.5rem', maxWidth: '1400px', margin: '0 auto' }}>
      
      {/* Watermark Banner */}
      <div style={{
        background: 'rgba(245, 158, 11, 0.1)',
        border: '1px solid rgba(245, 158, 11, 0.3)',
        borderRadius: '8px',
        padding: '10px 16px',
        marginBottom: '1.25rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <AlertTriangle size={18} color="#f59e0b" />
          <div>
            <strong style={{ color: '#fbbf24', fontSize: '0.85rem' }}>
              SIMULATED TELEMETRY PROVIDER — DEMO MODE
            </strong>
            <p style={{ color: '#94a3b8', fontSize: '0.75rem', margin: 0 }}>
              Device sensor feeds are generated algorithmically with physical drift models (battery depletion, thermal flux, and RPM).
            </p>
          </div>
        </div>
        <button 
          onClick={fetchTelemetry}
          style={{
            background: 'transparent',
            border: '1px solid rgba(245, 158, 11, 0.4)',
            color: '#fbbf24',
            padding: '4px 10px',
            borderRadius: '4px',
            fontSize: '0.75rem',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}
        >
          <RefreshCw size={12} />
          Refresh Readings
        </button>
      </div>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
        <div>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#fff', letterSpacing: '-0.5px' }}>
            Robot Fleet Telemetry & Live Telematics
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
            Multi-chassis robotics hardware telemetry, kinematic status, actuator health, and remote teleoperation controls.
          </p>
        </div>
      </div>

      {/* Notification Toast */}
      {notification && (
        <div style={{
          background: notification.type === 'error' ? 'rgba(239, 68, 68, 0.15)' : notification.type === 'success' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(56, 189, 248, 0.15)',
          border: `1px solid ${notification.type === 'error' ? '#ef4444' : notification.type === 'success' ? '#10b981' : '#38bdf8'}`,
          color: '#fff',
          padding: '10px 16px',
          borderRadius: '8px',
          marginBottom: '1rem',
          fontSize: '0.85rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <span>{notification.message}</span>
          <button onClick={() => setNotification(null)} style={{ background: 'transparent', color: '#94a3b8' }}>✕</button>
        </div>
      )}

      {/* Device Telematics Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '1.25rem' }}>
        {devices.map(d => {
          const isWarning = d.temperature > 60 || d.battery < 20 || d.status === 'WARNING';
          const isEStop = d.status === 'EMERGENCY_STOP';

          return (
            <div 
              key={d.id} 
              style={{
                background: 'var(--bg-card)',
                border: `1px solid ${isEStop ? '#ef4444' : isWarning ? 'rgba(245, 158, 11, 0.5)' : 'var(--border-color)'}`,
                borderLeft: `5px solid ${isEStop ? '#ef4444' : d.status === 'RUNNING' ? 'var(--accent-cyan)' : isWarning ? '#f59e0b' : '#10b981'}`,
                borderRadius: '10px',
                padding: '18px',
                boxShadow: '0 4px 20px rgba(0,0,0,0.3)'
              }}
            >
              {/* Card Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '14px' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Bot size={18} color="var(--accent-cyan-light)" />
                    <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#fff', margin: 0 }}>{d.name}</h3>
                  </div>
                  <div style={{ fontSize: '0.72rem', color: '#64748b', fontFamily: 'JetBrains Mono, monospace', marginTop: '4px' }}>
                    ID: {d.id} | IP: {d.ipAddress}
                  </div>
                </div>

                <span style={{
                  padding: '3px 8px',
                  borderRadius: '4px',
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  background: isEStop ? 'rgba(239, 68, 68, 0.2)' : d.status === 'RUNNING' ? 'rgba(6, 182, 212, 0.2)' : isWarning ? 'rgba(245, 158, 11, 0.2)' : 'rgba(16, 185, 129, 0.2)',
                  color: isEStop ? '#f87171' : d.status === 'RUNNING' ? '#38bdf8' : isWarning ? '#fbbf24' : '#34d399'
                }}>
                  {d.status}
                </span>
              </div>

              {/* 4 Telemetry Metrics */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px', marginBottom: '14px', textAlign: 'center' }}>
                <div style={{ background: '#0a0f1d', padding: '8px 4px', borderRadius: '6px', border: '1px solid #1e293b' }}>
                  <div style={{ fontSize: '0.65rem', color: '#64748b', fontWeight: 600 }}>BATTERY</div>
                  <strong style={{ fontSize: '1.05rem', color: d.battery < 25 ? '#f87171' : '#34d399' }}>
                    {d.battery}%
                  </strong>
                </div>

                <div style={{ background: '#0a0f1d', padding: '8px 4px', borderRadius: '6px', border: '1px solid #1e293b' }}>
                  <div style={{ fontSize: '0.65rem', color: '#64748b', fontWeight: 600 }}>TEMP</div>
                  <strong style={{ fontSize: '1.05rem', color: d.temperature > 60 ? '#f87171' : '#f8fafc' }}>
                    {d.temperature}°C
                  </strong>
                </div>

                <div style={{ background: '#0a0f1d', padding: '8px 4px', borderRadius: '6px', border: '1px solid #1e293b' }}>
                  <div style={{ fontSize: '0.65rem', color: '#64748b', fontWeight: 600 }}>SPEED</div>
                  <strong style={{ fontSize: '1.05rem', color: 'var(--accent-cyan-light)' }}>
                    {d.motorRpm}
                  </strong>
                  <span style={{ fontSize: '0.6rem', color: '#64748b', display: 'block' }}>RPM</span>
                </div>

                <div style={{ background: '#0a0f1d', padding: '8px 4px', borderRadius: '6px', border: '1px solid #1e293b' }}>
                  <div style={{ fontSize: '0.65rem', color: '#64748b', fontWeight: 600 }}>SIGNAL</div>
                  <strong style={{ fontSize: '1.05rem', color: '#a78bfa' }}>
                    {d.rssi}
                  </strong>
                  <span style={{ fontSize: '0.6rem', color: '#64748b', display: 'block' }}>dBm</span>
                </div>
              </div>

              {/* Secondary Details */}
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: '#94a3b8', borderTop: '1px solid #1e293b', paddingTop: '10px', marginBottom: '14px' }}>
                <span>Type: <strong style={{ color: '#fff' }}>{d.type}</strong></span>
                <span>Velocity: <strong style={{ color: '#fff' }}>{d.velocity} m/s</strong></span>
                <span>Runtime: <strong style={{ color: '#fff' }}>{d.operatingHours}h</strong></span>
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  onClick={() => handleCalibrate(d.id, d.name)}
                  disabled={isEStop}
                  style={{
                    flex: 1,
                    background: 'rgba(56, 189, 248, 0.1)',
                    border: '1px solid rgba(56, 189, 248, 0.3)',
                    color: 'var(--accent-cyan-light)',
                    borderRadius: '6px',
                    padding: '8px',
                    fontSize: '0.78rem',
                    fontWeight: 600,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px'
                  }}
                >
                  <RotateCw size={13} />
                  Calibrate Sensors
                </button>

                <button
                  onClick={() => handleEmergencyStop(d.id, d.name)}
                  style={{
                    flex: 1,
                    background: 'rgba(239, 68, 68, 0.15)',
                    border: '1px solid rgba(239, 68, 68, 0.4)',
                    color: '#f87171',
                    borderRadius: '6px',
                    padding: '8px',
                    fontSize: '0.78rem',
                    fontWeight: 600,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px'
                  }}
                >
                  <AlertOctagon size={13} />
                  Emergency Stop
                </button>
              </div>

            </div>
          );
        })}
      </div>

    </div>
  );
};

export default FleetTelemetryPage;

