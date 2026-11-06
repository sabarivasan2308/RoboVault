import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  Compass, 
  Play, 
  Square, 
  AlertTriangle, 
  RefreshCw, 
  ShieldAlert, 
  CheckCircle, 
  Send, 
  Sliders, 
  Layers,
  Battery,
  Cpu,
  Zap,
  Info
} from 'lucide-react';
import apiClient from '../api/client';
import missionApi from '../api/missionApi';

export const FleetTrackerPage = () => {
  const cols = 16;
  const rows = 10;
  const cellSize = 38;

  // Static Obstacles from RoboVault NEXUS
  const staticObstacles = useMemo(() => [
    [1, 2], [2, 2], [5, 2], [6, 2], [9, 2], [10, 2], [13, 2], [14, 2],
    [1, 7], [2, 7], [5, 7], [6, 7], [9, 7], [10, 7], [13, 7], [14, 7],
    [7, 0], [7, 1], [7, 3], [7, 4],
    [7, 6], [7, 7], [7, 8], [7, 9],
    [3, 4], [4, 4], [11, 4], [12, 4]
  ], []);

  const staticSet = useMemo(() => new Set(staticObstacles.map(([c, r]) => `${c},${r}`)), [staticObstacles]);

  const workstations = useMemo(() => [
    { id: 'ws-1', label: 'Rover Bay 1', approach: [2, 3], zone: 'Zone A: Ground Robotics' },
    { id: 'ws-2', label: 'Rover Bay 2', approach: [6, 3], zone: 'Zone A: Ground Robotics' },
    { id: 'ws-3', label: 'Drone Helipad Alpha', approach: [10, 3], zone: 'Zone B: Aerial Drone Cage' },
    { id: 'ws-4', label: 'Drone Helipad Beta', approach: [14, 3], zone: 'Zone B: Aerial Drone Cage' },
    { id: 'ws-5', label: 'AI Edge Workbench 1', approach: [2, 8], zone: 'Zone C: Embedded AI Benches' },
    { id: 'ws-6', label: 'AI Edge Workbench 2', approach: [6, 8], zone: 'Zone C: Embedded AI Benches' },
    { id: 'ws-7', label: 'Rapid Fab Cell 1', approach: [10, 8], zone: 'Zone D: Additive Prototyping' },
    { id: 'ws-8', label: 'Rapid Fab Cell 2', approach: [14, 8], zone: 'Zone D: Additive Prototyping' }
  ], []);

  const robots = useMemo(() => [
    { id: 'dev-tb4-01', name: 'TurtleBot 4 (Alpha)', type: 'MOBILE_ROBOT', dock: [0, 1], battery: 78.5, status: 'AVAILABLE', ip: '192.168.1.101' },
    { id: 'dev-drone-04', name: 'Crazyflie Swarm Drone A1', type: 'QUADCOPTER', dock: [8, 1], battery: 90.0, status: 'AVAILABLE', ip: '192.168.1.104' },
    { id: 'dev-arm-02', name: 'Bionic Arm Workstation', type: 'MANIPULATOR', dock: [15, 1], battery: 27.4, status: 'AVAILABLE', ip: '192.168.1.102' },
    { id: 'dev-prusa-03', name: 'Prusa MK4 Fabrication Cell', type: 'FAB_CELL', dock: [10, 8], battery: 100.0, status: 'WARNING', ip: '192.168.1.103' }
  ], []);

  // State
  const [dynamicObstacles, setDynamicObstacles] = useState([]);
  const [missions, setMissions] = useState([
    {
      id: 'MSN-993650-570',
      title: 'Automated Traversal Sortie',
      robotId: 'dev-tb4-01',
      robotName: 'TurtleBot 4 (Alpha)',
      targetId: 'ws-1',
      targetName: 'Rover Bay 1',
      startCoords: [0, 1],
      targetCoords: [2, 3],
      currentCoords: [2, 3],
      status: 'COMPLETED',
      progressPct: 100,
      path: [[0, 1], [0, 2], [0, 3], [1, 3], [2, 3]],
      currentStepIndex: 4,
      priority: 'NORMAL',
      createdAt: new Date().toISOString()
    }
  ]);
  const [activeMissionId, setActiveMissionId] = useState(null);
  const [selectedRobotId, setSelectedRobotId] = useState('dev-tb4-01');
  const [selectedDestId, setSelectedDestId] = useState('ws-1');
  const [missionTitle, setMissionTitle] = useState('Autonomous Sortie #102');
  const [notification, setNotification] = useState(null);

  // A* Pathfinding Algorithm (Deterministic, Manhattan Heuristic)
  const calculateAStarPath = useCallback((start, goal, customDynObstacles = dynamicObstacles) => {
    const dynSet = new Set(customDynObstacles.map(([c, r]) => `${c},${r}`));
    const isBlocked = (c, r) => {
      if (c < 0 || c >= cols || r < 0 || r >= rows) return true;
      const key = `${c},${r}`;
      if (staticSet.has(key)) return true;
      if (dynSet.has(key)) return true;
      return false;
    };

    const startKey = `${start[0]},${start[1]}`;
    const goalKey = `${goal[0]},${goal[1]}`;
    if (startKey === goalKey) return [start];

    const openSet = [start];
    const cameFrom = new Map();
    const gScore = new Map([[startKey, 0]]);
    const fScore = new Map([[startKey, Math.abs(start[0] - goal[0]) + Math.abs(start[1] - goal[1])]]);

    const getLowestF = () => {
      let lowest = openSet[0];
      let lowestVal = fScore.get(`${lowest[0]},${lowest[1]}`) ?? Infinity;
      let lowestIdx = 0;
      for (let i = 1; i < openSet.length; i++) {
        const val = fScore.get(`${openSet[i][0]},${openSet[i][1]}`) ?? Infinity;
        if (val < lowestVal) {
          lowest = openSet[i];
          lowestVal = val;
          lowestIdx = i;
        }
      }
      openSet.splice(lowestIdx, 1);
      return lowest;
    };

    const visited = new Set();
    while (openSet.length > 0) {
      const current = getLowestF();
      const curKey = `${current[0]},${current[1]}`;
      if (curKey === goalKey) {
        // Reconstruct path
        const path = [current];
        let curr = curKey;
        while (cameFrom.has(curr)) {
          const prev = cameFrom.get(curr);
          path.unshift(prev);
          curr = `${prev[0]},${prev[1]}`;
        }
        return path;
      }

      visited.add(curKey);
      const neighbors = [
        [current[0] + 1, current[1]],
        [current[0] - 1, current[1]],
        [current[0], current[1] + 1],
        [current[0], current[1] - 1]
      ];

      for (const [nc, nr] of neighbors) {
        const nKey = `${nc},${nr}`;
        if (visited.has(nKey) || isBlocked(nc, nr)) continue;

        const tentativeG = (gScore.get(curKey) ?? Infinity) + 1;
        if (tentativeG < (gScore.get(nKey) ?? Infinity)) {
          cameFrom.set(nKey, current);
          gScore.set(nKey, tentativeG);
          const h = Math.abs(nc - goal[0]) + Math.abs(nr - goal[1]);
          fScore.set(nKey, tentativeG + h);
          if (!openSet.some(p => p[0] === nc && p[1] === nr)) {
            openSet.push([nc, nr]);
          }
        }
      }
    }
    return null; // No path found
  }, [cols, rows, staticSet, dynamicObstacles]);

  // Fetch active mission state from localhost:3000 API or fall back gracefully
  const fetchMissionsFromApi = useCallback(async () => {
    try {
      const res = await missionApi.getMissions();
      if (res && res.data) {
        const normalized = res.data.map(m => ({
          ...m,
          title: m.name || m.title || 'Sortie',
          targetId: m.targetWorkstationId || m.targetId || 'ws-1',
          targetName: m.targetWorkstationName || m.targetName || 'Workstation'
        }));
        setMissions(normalized);
        if (res.dynamicObstacles) {
          setDynamicObstacles(res.dynamicObstacles);
        }
        const active = res.activeMission || res.data.find(m => m.status === 'IN_TRANSIT' || m.status === 'READY' || m.status === 'BLOCKED');
        if (active) setActiveMissionId(active.id);
      }
    } catch {
      // In standalone dev mode, state remains locally managed
    }
  }, []);

  useEffect(() => {
    fetchMissionsFromApi();
    const interval = setInterval(fetchMissionsFromApi, 3000);
    return () => clearInterval(interval);
  }, [fetchMissionsFromApi]);

  // Active mission pointer
  const activeMission = useMemo(() => {
    return missions.find(m => m.id === activeMissionId) || missions.find(m => m.status === 'IN_TRANSIT') || missions[0] || null;
  }, [missions, activeMissionId]);

  // Simulation Ticker (Advances IN_TRANSIT mission every 2.5s locally if offline)
  useEffect(() => {
    const timer = setInterval(() => {
      setMissions(prevMissions => {
        let changed = false;
        const updated = prevMissions.map(msn => {
          if (msn.status !== 'IN_TRANSIT') return msn;

          const nextIndex = msn.currentStepIndex + 1;
          if (nextIndex >= (msn.path ? msn.path.length : 1)) {
            // Reached destination - complete sortie
            changed = true;
            return {
              ...msn,
              status: 'COMPLETED',
              progressPct: 100,
              currentStepIndex: msn.path ? msn.path.length - 1 : 0,
              currentCoords: msn.targetCoords,
              completedAt: new Date().toISOString()
            };
          }

          changed = true;
          const nextCoords = msn.path[nextIndex];
          const progressPct = Math.round((nextIndex / (msn.path.length - 1)) * 100);

          return {
            ...msn,
            currentStepIndex: nextIndex,
            currentCoords: nextCoords,
            progressPct
          };
        });

        return changed ? updated : prevMissions;
      });
    }, 2500);

    return () => clearInterval(timer);
  }, []);

  // Handlers
  const handleDispatchNewMission = async () => {
    const robot = robots.find(r => r.id === selectedRobotId);
    const dest = workstations.find(w => w.id === selectedDestId);
    if (!robot || !dest) return;

    // Check if robot is already busy
    const isBusy = missions.some(m => m.robotId === robot.id && m.status === 'IN_TRANSIT');
    if (isBusy) {
      setNotification({ type: 'error', message: `Conflict: Robot '${robot.name}' is already assigned to an active sortie.` });
      return;
    }

    try {
      const payload = {
        name: missionTitle || `Sortie to ${dest.label}`,
        type: 'PAYLOAD_DELIVERY',
        robotId: robot.id,
        targetWorkstationId: dest.id,
        autoDispatch: true
      };
      const res = await missionApi.createMission(payload);
      if (res && res.success && res.data) {
        const createdMsn = res.data;
        const normalized = {
          ...createdMsn,
          title: createdMsn.name || createdMsn.title,
          targetId: createdMsn.targetWorkstationId || dest.id,
          targetName: createdMsn.targetWorkstationName || dest.label
        };
        setMissions(prev => [normalized, ...prev.filter(m => m.id !== normalized.id)]);
        setActiveMissionId(normalized.id);
        setNotification({ type: 'success', message: `Sortie dispatched! A* trajectory mapped (${createdMsn.path?.length || 0} waypoints). Persisted to database.` });
        fetchMissionsFromApi();
      } else {
        throw new Error(res?.message || 'Failed to dispatch mission');
      }
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Error dispatching mission';
      setNotification({ type: 'error', message: msg });
    }
  };

  const handleInjectDynamicHazard = async () => {
    if (!activeMission || activeMission.status !== 'IN_TRANSIT') {
      setNotification({ type: 'warning', message: 'No active sortie in transit to obstruct.' });
      return;
    }

    const nextWaypoints = activeMission.path.slice(activeMission.currentStepIndex + 1);
    if (nextWaypoints.length === 0) {
      setNotification({ type: 'warning', message: 'Sortie already at target.' });
      return;
    }

    const hazardCoords = nextWaypoints[0];
    try {
      const res = await missionApi.injectObstacle(hazardCoords);
      if (res && res.dynamicObstacles) {
        setDynamicObstacles(res.dynamicObstacles);
      }
      fetchMissionsFromApi();
      setNotification({ type: 'warning', message: `Dynamic hazard injected at (${hazardCoords[0]}, ${hazardCoords[1]})! Dynamic A* replanned.` });
    } catch (err) {
      // Fallback
      const newDyn = [...dynamicObstacles, hazardCoords];
      setDynamicObstacles(newDyn);
      setNotification({ type: 'warning', message: `Dynamic hazard placed at (${hazardCoords[0]}, ${hazardCoords[1]}).` });
    }
  };

  const handleClearHazards = async () => {
    try {
      await missionApi.clearObstacles();
    } catch (_) {}
    setDynamicObstacles([]);
    fetchMissionsFromApi();
    setNotification({ type: 'success', message: 'Cleared dynamic hazards. Sorties resumed.' });
  };

  const handleCompleteMission = async (id) => {
    try {
      const res = await missionApi.completeMission(id);
      if (res && res.success) {
        setMissions(prev => prev.map(m => m.id === id ? {
          ...m,
          status: 'COMPLETED',
          progressPct: 100,
          currentCoords: m.targetCoords,
          currentStepIndex: m.path ? m.path.length - 1 : 0,
          completedAt: new Date().toISOString()
        } : m));
        setNotification({ type: 'info', message: 'Mission marked COMPLETED and persisted to database.' });
        fetchMissionsFromApi();
        return;
      }
    } catch (_) {}

    // Fallback if network issue
    setMissions(prev => prev.map(m => m.id === id ? {
      ...m,
      status: 'COMPLETED',
      progressPct: 100,
      currentCoords: m.targetCoords,
      currentStepIndex: m.path ? m.path.length - 1 : 0,
      completedAt: new Date().toISOString()
    } : m));
    setNotification({ type: 'info', message: 'Mission marked COMPLETED (local).' });
  };

  // Trajectory sets
  const pathSet = useMemo(() => {
    const set = new Set();
    if (activeMission && activeMission.path) {
      activeMission.path.forEach(([c, r]) => set.add(`${c},${r}`));
    }
    return set;
  }, [activeMission]);

  const dynSet = useMemo(() => new Set(dynamicObstacles.map(([c, r]) => `${c},${r}`)), [dynamicObstacles]);

  const robotPos = activeMission ? activeMission.currentCoords : [0, 1];
  const targetPos = activeMission ? activeMission.targetCoords : [2, 3];

  return (
    <div className="fleet-tracker-container" style={{ padding: '1.5rem', maxWidth: '1400px', margin: '0 auto' }}>
      
      {/* Top Banner */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <span style={{ 
              background: 'rgba(6, 182, 212, 0.15)', 
              color: 'var(--accent-cyan-light)', 
              padding: '3px 8px', 
              borderRadius: '4px', 
              fontSize: '0.72rem', 
              fontWeight: 700,
              fontFamily: 'JetBrains Mono, monospace'
            }}>
              AUTONOMOUS INTELLIGENCE EDITION
            </span>
            <span style={{
              background: 'rgba(16, 185, 129, 0.15)',
              color: 'var(--accent-emerald)',
              padding: '3px 8px',
              borderRadius: '4px',
              fontSize: '0.72rem',
              fontWeight: 700
            }}>
              Deterministic A* Engine
            </span>
          </div>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#fff', letterSpacing: '-0.5px' }}>
            Autonomous Fleet Mission Simulator & Vehicle Tracking
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
            Real-time kinematic grid navigation over 160 nodes with dynamic obstacle avoidance, admissible Manhattan heuristic, and telematics.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          <button 
            onClick={handleInjectDynamicHazard}
            className="btn btn-outline"
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '6px', 
              borderColor: 'rgba(239, 68, 68, 0.4)', 
              color: '#f87171',
              padding: '8px 14px',
              borderRadius: '6px',
              fontSize: '0.82rem',
              fontWeight: 600
            }}
          >
            <AlertTriangle size={15} />
            Inject Dynamic Hazard
          </button>

          <button 
            onClick={handleClearHazards}
            className="btn btn-outline"
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '6px', 
              borderColor: 'rgba(16, 185, 129, 0.4)', 
              color: '#34d399',
              padding: '8px 14px',
              borderRadius: '6px',
              fontSize: '0.82rem',
              fontWeight: 600
            }}
          >
            <RefreshCw size={15} />
            Clear Hazards ({dynamicObstacles.length})
          </button>
        </div>
      </div>

      {/* Notification Toast */}
      {notification && (
        <div style={{
          background: notification.type === 'error' ? 'rgba(239, 68, 68, 0.15)' : notification.type === 'warning' ? 'rgba(245, 158, 11, 0.15)' : 'rgba(16, 185, 129, 0.15)',
          border: `1px solid ${notification.type === 'error' ? '#ef4444' : notification.type === 'warning' ? '#f59e0b' : '#10b981'}`,
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

      {/* Main Grid Viewport & Sidebar Controls */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 340px', gap: '1.25rem', marginBottom: '1.5rem' }}>
        
        {/* Kinematic Grid Canvas */}
        <div style={{ background: '#080d19', border: '1px solid #1a2744', borderRadius: '10px', padding: '16px', overflow: 'auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <div style={{ fontSize: '0.82rem', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '16px' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ width: '10px', height: '10px', background: '#38bdf8', borderRadius: '2px', display: 'inline-block' }}></span>
                Cyan: A* Trajectory
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ width: '10px', height: '10px', background: '#ef4444', borderRadius: '2px', display: 'inline-block' }}></span>
                Red: Static Desk Walls
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ width: '10px', height: '10px', background: '#f59e0b', borderRadius: '2px', display: 'inline-block' }}></span>
                Amber: Dynamic Hazard
              </span>
            </div>
            <div style={{ fontSize: '0.78rem', color: '#64748b', fontFamily: 'JetBrains Mono, monospace' }}>
              Grid: 16x10 (160 Nodes) | 1 Node ≈ 2.0m
            </div>
          </div>

          <svg 
            width={cols * cellSize} 
            height={rows * cellSize} 
            style={{ 
              background: '#040711', 
              borderRadius: '8px', 
              border: '1px solid #1e293b', 
              boxShadow: 'inset 0 0 25px rgba(0,0,0,0.8)' 
            }}
          >
            {/* Draw Grid Cells */}
            {Array.from({ length: rows }).map((_, r) => (
              Array.from({ length: cols }).map((_, c) => {
                const key = `${c},${r}`;
                const isStatic = staticSet.has(key);
                const isDyn = dynSet.has(key);
                const isPath = pathSet.has(key);
                const isRobot = (robotPos[0] === c && robotPos[1] === r);
                const isTarget = (targetPos[0] === c && targetPos[1] === r);

                let fill = 'rgba(15, 23, 42, 0.4)';
                let stroke = '#1e293b';

                if (isStatic) {
                  fill = '#334155';
                  stroke = '#475569';
                } else if (isDyn) {
                  fill = 'rgba(239, 68, 68, 0.85)';
                  stroke = '#ef4444';
                } else if (isRobot) {
                  fill = '#0284c7';
                  stroke = '#38bdf8';
                } else if (isTarget) {
                  fill = '#10b981';
                  stroke = '#34d399';
                } else if (isPath) {
                  fill = 'rgba(56, 189, 248, 0.2)';
                  stroke = '#0ea5e9';
                }

                return (
                  <g key={key}>
                    <rect
                      x={c * cellSize}
                      y={r * cellSize}
                      width={cellSize}
                      height={cellSize}
                      fill={fill}
                      stroke={stroke}
                      strokeWidth="1"
                    />
                    {isStatic && (
                      <text 
                        x={c * cellSize + cellSize / 2} 
                        y={r * cellSize + cellSize / 2 + 4} 
                        textAnchor="middle" 
                        fontSize="9" 
                        fill="#94a3b8" 
                        fontFamily="monospace"
                      >
                        █
                      </text>
                    )}
                    {isDyn && (
                      <text 
                        x={c * cellSize + cellSize / 2} 
                        y={r * cellSize + cellSize / 2 + 4} 
                        textAnchor="middle" 
                        fontSize="13" 
                        fill="#fff"
                      >
                        ⚠️
                      </text>
                    )}
                    {isRobot && (
                      <circle
                        cx={c * cellSize + cellSize / 2}
                        cy={r * cellSize + cellSize / 2}
                        r="11"
                        fill="#0ea5e9"
                        stroke="#fff"
                        strokeWidth="2"
                      />
                    )}
                    {isTarget && !isRobot && (
                      <rect
                        x={c * cellSize + cellSize / 2 - 8}
                        y={r * cellSize + cellSize / 2 - 8}
                        width="16"
                        height="16"
                        fill="#10b981"
                        stroke="#fff"
                        strokeWidth="1.5"
                        rx="3"
                      />
                    )}
                  </g>
                );
              })
            ))}

            {/* A* Waypoint Path Polyline */}
            {activeMission?.path && activeMission.path.length > 1 && (
              <polyline
                points={activeMission.path.map(([c, r]) => `${c * cellSize + cellSize / 2},${r * cellSize + cellSize / 2}`).join(' ')}
                fill="none"
                stroke="#38bdf8"
                strokeWidth="2.5"
                strokeDasharray="4,4"
              />
            )}
          </svg>

          {/* Active Mission Telemetry Strip */}
          {activeMission && (
            <div style={{ marginTop: '12px', background: 'var(--bg-card)', padding: '10px 14px', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Active Sortie:</span>
                <strong style={{ marginLeft: '6px', color: '#fff', fontSize: '0.88rem' }}>{activeMission.title} ({activeMission.id})</strong>
                <span style={{ marginLeft: '10px', fontSize: '0.78rem', color: 'var(--accent-cyan-light)' }}>
                  Vehicle: {activeMission.robotName}
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
                  Step: <strong style={{ color: '#fff' }}>{activeMission.currentStepIndex + 1}/{activeMission.path?.length || 1}</strong>
                </div>
                <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
                  Progress: <strong style={{ color: activeMission.status === 'COMPLETED' ? '#10b981' : '#38bdf8' }}>{activeMission.progressPct}%</strong>
                </div>
                <span style={{
                  padding: '3px 8px',
                  borderRadius: '4px',
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  background: activeMission.status === 'COMPLETED' ? 'rgba(16, 185, 129, 0.2)' : activeMission.status === 'BLOCKED' ? 'rgba(239, 68, 68, 0.2)' : 'rgba(56, 189, 248, 0.2)',
                  color: activeMission.status === 'COMPLETED' ? '#34d399' : activeMission.status === 'BLOCKED' ? '#f87171' : '#38bdf8'
                }}>
                  {activeMission.status}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Quick Dispatch & Mission Controls */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '10px', padding: '16px' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#fff', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Send size={16} color="var(--accent-cyan-light)" />
              Quick Mission Dispatch
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div>
                <label style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'block', marginBottom: '4px' }}>Sortie Title</label>
                <input
                  type="text"
                  value={missionTitle}
                  onChange={e => setMissionTitle(e.target.value)}
                  style={{
                    width: '100%',
                    background: '#0a0f1d',
                    border: '1px solid #1e293b',
                    borderRadius: '6px',
                    padding: '8px 10px',
                    color: '#fff',
                    fontSize: '0.82rem'
                  }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'block', marginBottom: '4px' }}>Select Autonomous Vehicle</label>
                <select
                  value={selectedRobotId}
                  onChange={e => setSelectedRobotId(e.target.value)}
                  style={{
                    width: '100%',
                    background: '#0a0f1d',
                    border: '1px solid #1e293b',
                    borderRadius: '6px',
                    padding: '8px 10px',
                    color: '#fff',
                    fontSize: '0.82rem'
                  }}
                >
                  {robots.map(r => (
                    <option key={r.id} value={r.id}>
                      {r.name} ({r.type} - Bat: {r.battery}%)
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'block', marginBottom: '4px' }}>Target Destination Workstation</label>
                <select
                  value={selectedDestId}
                  onChange={e => setSelectedDestId(e.target.value)}
                  style={{
                    width: '100%',
                    background: '#0a0f1d',
                    border: '1px solid #1e293b',
                    borderRadius: '6px',
                    padding: '8px 10px',
                    color: '#fff',
                    fontSize: '0.82rem'
                  }}
                >
                  {workstations.map(w => (
                    <option key={w.id} value={w.id}>
                      {w.label} ({w.zone})
                    </option>
                  ))}
                </select>
              </div>

              <button
                onClick={handleDispatchNewMission}
                style={{
                  marginTop: '8px',
                  background: 'linear-gradient(135deg, #0284c7, #38bdf8)',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '6px',
                  padding: '10px',
                  fontWeight: 700,
                  fontSize: '0.85rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px'
                }}
              >
                <Play size={16} />
                Calculate A* & Launch Sortie
              </button>
            </div>
          </div>

          {/* Active Vehicle Telematics Snapshot */}
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '10px', padding: '16px' }}>
            <h4 style={{ fontSize: '0.85rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', marginBottom: '10px' }}>
              Fleet Telematics Snapshot
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {robots.map(r => (
                <div key={r.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 8px', background: '#0a0f1d', borderRadius: '6px', fontSize: '0.8rem' }}>
                  <div>
                    <div style={{ fontWeight: 600, color: '#fff' }}>{r.name}</div>
                    <div style={{ fontSize: '0.7rem', color: '#64748b' }}>Dock: [{r.dock[0]}, {r.dock[1]}]</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <span style={{ color: r.battery < 30 ? '#f87171' : '#34d399', fontWeight: 700, fontSize: '0.82rem' }}>
                      {r.battery}%
                    </span>
                    <div style={{ fontSize: '0.68rem', color: '#38bdf8' }}>{r.status}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>

      {/* Sortie History Log */}
      <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '10px', padding: '16px' }}>
        <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#fff', marginBottom: '12px' }}>
          Autonomous Sortie Logs & Kinematic Invariants
        </h3>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #1e293b', color: '#94a3b8', textAlign: 'left' }}>
                <th style={{ padding: '8px 12px' }}>Sortie ID</th>
                <th style={{ padding: '8px 12px' }}>Mission Title</th>
                <th style={{ padding: '8px 12px' }}>Assigned Robot</th>
                <th style={{ padding: '8px 12px' }}>Destination</th>
                <th style={{ padding: '8px 12px' }}>Waypoints</th>
                <th style={{ padding: '8px 12px' }}>Status</th>
                <th style={{ padding: '8px 12px' }}>Progress</th>
                <th style={{ padding: '8px 12px', textAlign: 'right' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {missions.map(m => (
                <tr key={m.id} style={{ borderBottom: '1px solid #1e293b', color: '#e2e8f0' }}>
                  <td style={{ padding: '10px 12px', fontFamily: 'JetBrains Mono, monospace', color: 'var(--accent-cyan-light)' }}>
                    {m.id}
                  </td>
                  <td style={{ padding: '10px 12px', fontWeight: 600 }}>{m.title || m.name}</td>
                  <td style={{ padding: '10px 12px' }}>{m.robotName}</td>
                  <td style={{ padding: '10px 12px' }}>{m.targetName || m.targetWorkstationName}</td>
                  <td style={{ padding: '10px 12px' }}>{m.path?.length || 0} nodes</td>
                  <td style={{ padding: '10px 12px' }}>
                    <span style={{
                      padding: '2px 8px',
                      borderRadius: '4px',
                      fontSize: '0.72rem',
                      fontWeight: 700,
                      background: m.status === 'COMPLETED' ? 'rgba(16, 185, 129, 0.2)' : m.status === 'BLOCKED' ? 'rgba(239, 68, 68, 0.2)' : 'rgba(56, 189, 248, 0.2)',
                      color: m.status === 'COMPLETED' ? '#34d399' : m.status === 'BLOCKED' ? '#f87171' : '#38bdf8'
                    }}>
                      {m.status}
                    </span>
                  </td>
                  <td style={{ padding: '10px 12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div style={{ width: '80px', height: '6px', background: '#1e293b', borderRadius: '3px', overflow: 'hidden' }}>
                        <div style={{ width: `${m.progressPct}%`, height: '100%', background: m.status === 'COMPLETED' ? '#10b981' : '#38bdf8' }}></div>
                      </div>
                      <span style={{ fontSize: '0.75rem' }}>{m.progressPct}%</span>
                    </div>
                  </td>
                  <td style={{ padding: '10px 12px', textAlign: 'right' }}>
                    {m.status !== 'COMPLETED' ? (
                      <button
                        onClick={() => handleCompleteMission(m.id)}
                        style={{
                          background: 'rgba(16, 185, 129, 0.2)',
                          color: '#34d399',
                          border: '1px solid rgba(16, 185, 129, 0.4)',
                          borderRadius: '4px',
                          padding: '4px 10px',
                          fontSize: '0.75rem',
                          fontWeight: 600
                        }}
                      >
                        Complete
                      </button>
                    ) : (
                      <span style={{ color: '#64748b', fontSize: '0.75rem' }}>Released</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};

export default FleetTrackerPage;

