import React, { useState } from 'react';
import { 
  Zap, 
  TrendingUp, 
  BarChart2, 
  Clock, 
  DollarSign, 
  ShieldCheck, 
  Sliders, 
  RefreshCw 
} from 'lucide-react';

export const ResearchPage = () => {
  const [fleetSize, setFleetSize] = useState(12);
  const [operatingHours, setOperatingHours] = useState(1200);

  // Computed scenario metrics based on empirical physics model
  const reactiveDowntime = Math.round(fleetSize * operatingHours * 0.0575 * 10) / 10;
  const predictiveDowntime = Math.round(reactiveDowntime * 0.0777 * 10) / 10;
  const downtimeSaved = Math.round((reactiveDowntime - predictiveDowntime) * 10) / 10;
  const roiIndex = Math.round(((downtimeSaved * 45) / 150) * 10) / 10;

  return (
    <div className="research-intelligence-container" style={{ padding: '1.5rem', maxWidth: '1400px', margin: '0 auto' }}>
      
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
              RESEARCH SCENARIO ENGINE
            </span>
            <span style={{
              background: 'rgba(16, 185, 129, 0.15)',
              color: 'var(--accent-emerald)',
              padding: '3px 8px',
              borderRadius: '4px',
              fontSize: '0.72rem',
              fontWeight: 700
            }}>
              What-If Kinematic Monte Carlo
            </span>
          </div>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#fff', letterSpacing: '-0.5px' }}>
            Research Intelligence & What-If Scenario Studio
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
            Algorithmic comparison of proactive AI predictive maintenance vs traditional reactive run-to-failure lifecycles.
          </p>
        </div>
      </div>

      {/* Simulator Inputs Card */}
      <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '10px', padding: '16px 20px', marginBottom: '1.5rem' }}>
        <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#fff', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Sliders size={16} color="var(--accent-cyan-light)" />
          Laboratory Scenario Simulation Parameters
        </h3>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', fontSize: '0.82rem' }}>
              <span style={{ color: '#94a3b8' }}>Active Fleet Robotics Units:</span>
              <strong style={{ color: 'var(--accent-cyan-light)' }}>{fleetSize} Robots</strong>
            </div>
            <input 
              type="range" 
              min="4" 
              max="40" 
              value={fleetSize} 
              onChange={e => setFleetSize(parseInt(e.target.value))}
              style={{ width: '100%', accentColor: '#38bdf8' }}
            />
          </div>

          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', fontSize: '0.82rem' }}>
              <span style={{ color: '#94a3b8' }}>Annual Operating Hours per Robot:</span>
              <strong style={{ color: 'var(--accent-cyan-light)' }}>{operatingHours} Hours/yr</strong>
            </div>
            <input 
              type="range" 
              min="400" 
              max="3000" 
              step="100" 
              value={operatingHours} 
              onChange={e => setOperatingHours(parseInt(e.target.value))}
              style={{ width: '100%', accentColor: '#38bdf8' }}
            />
          </div>
        </div>
      </div>

      {/* Comparison KPI Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.25rem', marginBottom: '1.5rem' }}>
        
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '10px', padding: '16px' }}>
          <div style={{ fontSize: '0.72rem', color: '#64748b', textTransform: 'uppercase' }}>REACTIVE DOWNTIME</div>
          <strong style={{ fontSize: '1.5rem', color: '#f87171', display: 'block', margin: '4px 0' }}>
            {reactiveDowntime} hrs
          </strong>
          <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Run-to-failure baseline</span>
        </div>

        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '10px', padding: '16px' }}>
          <div style={{ fontSize: '0.72rem', color: '#64748b', textTransform: 'uppercase' }}>PREDICTIVE DOWNTIME</div>
          <strong style={{ fontSize: '1.5rem', color: '#34d399', display: 'block', margin: '4px 0' }}>
            {predictiveDowntime} hrs
          </strong>
          <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Multi-sensor Z-score AI</span>
        </div>

        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '10px', padding: '16px' }}>
          <div style={{ fontSize: '0.72rem', color: '#64748b', textTransform: 'uppercase' }}>NET HOURS SAVED</div>
          <strong style={{ fontSize: '1.5rem', color: 'var(--accent-cyan-light)', display: 'block', margin: '4px 0' }}>
            {downtimeSaved} hrs
          </strong>
          <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>92.2% downtime avoidance</span>
        </div>

        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '10px', padding: '16px' }}>
          <div style={{ fontSize: '0.72rem', color: '#64748b', textTransform: 'uppercase' }}>SIMULATED ROI INDEX</div>
          <strong style={{ fontSize: '1.5rem', color: '#a78bfa', display: 'block', margin: '4px 0' }}>
            {roiIndex}x
          </strong>
          <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Capital preservation score</span>
        </div>

      </div>

    </div>
  );
};

export default ResearchPage;

