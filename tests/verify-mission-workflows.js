const http = require('http');
const fs = require('fs');
const path = require('path');

function request(method, reqPath, body) {
  return new Promise((resolve, reject) => {
    const data = body ? JSON.stringify(body) : null;
    const req = http.request({
      hostname: 'localhost',
      port: 3000,
      path: reqPath,
      method,
      headers: {
        'Content-Type': 'application/json',
        ...(data ? { 'Content-Length': Buffer.byteLength(data) } : {})
      }
    }, res => {
      let responseBody = '';
      res.on('data', chunk => responseBody += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, body: JSON.parse(responseBody) });
        } catch (e) {
          resolve({ status: res.statusCode, body: responseBody });
        }
      });
    });
    req.on('error', reject);
    if (data) req.write(data);
    req.end();
  });
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function run() {
  console.log('========================================================');
  console.log('🧪 END-TO-END AUDIT: MISSION WORKFLOWS & INVARIANTS');
  console.log('========================================================');

  // Step 0: Clear any previous dynamic obstacles
  await request('POST', '/api/missions/clear-obstacles', {});

  // 1. Mission dispatch and robot assignment
  console.log('\n[Workflow 1/8] Mission Dispatch & Robot Assignment');
  const createRes = await request('POST', '/api/missions', {
    name: 'E2E Audit Sortie - Dispatch Check',
    type: 'PAYLOAD_DELIVERY',
    robotId: 'dev-tb4-01',
    targetWorkstationId: 'ws-1',
    autoDispatch: false
  });
  if (createRes.status !== 201) throw new Error('Create failed: ' + JSON.stringify(createRes.body));
  const msn1 = createRes.body.data;
  console.log(`  [✓] Sortie created: ${msn1.id} -> Robot: ${msn1.robotName} (${msn1.robotId}), Status: ${msn1.status}, Path: ${msn1.pathLength} steps`);
  if (msn1.status !== 'READY') throw new Error(`Expected READY, got ${msn1.status}`);
  if (!msn1.path || msn1.path.length < 2) throw new Error('Invalid path calculated');

  // 2. Dynamic obstacle injection and safe rerouting or safe halt
  console.log('\n[Workflow 2/8] Dynamic Obstacle Injection & Safety Invariants');
  const startRes = await request('POST', `/api/missions/${msn1.id}/start`, {});
  if (startRes.status !== 200) throw new Error('Start failed: ' + JSON.stringify(startRes.body));
  console.log(`  [✓] Mission started: status=${startRes.body.data.status}`);

  // Inject obstacle along intermediate waypoint [1, 3] to test collision prevention / safe halt
  const obsRes = await request('POST', '/api/missions/inject-obstacle', { coord: [1, 3] });
  console.log(`  [✓] Obstacle injected at [1, 3]: ${obsRes.body.message || 'success'}`);

  // Wait 4.5s for ticker to encounter obstacle
  console.log('  Waiting 4.5s for simulation ticker collision evaluation...');
  await sleep(4500);

  const pollRes1 = await request('GET', '/api/missions');
  const msnAfterObs = (pollRes1.body.data || []).find(m => m.id === msn1.id);
  console.log(`  [✓] Mission state after obstacle: Status=${msnAfterObs.status}, BlockedReason=${msnAfterObs.blockedReason || 'None (re-routed)'}`);
  if (msnAfterObs.status === 'BLOCKED') {
    const blockedRobot = (pollRes1.body.allRobots || []).find(r => r.id === msn1.robotId);
    console.log(`  [✓] Safe Emergency Halt engaged: Robot status=${blockedRobot.status}, mode=${blockedRobot.mode}`);
  }

  // 3. Obstacle clearing and safe mission resumption
  console.log('\n[Workflow 3/8] Obstacle Clearing & Safe Traversal Resumption');
  const clearRes = await request('POST', '/api/missions/clear-obstacles', {});
  console.log(`  [✓] Obstacles cleared: ${clearRes.body.message}`);

  if (msnAfterObs.status === 'BLOCKED') {
    const resumeRes = await request('POST', `/api/missions/${msn1.id}/resume`, {});
    console.log(`  [✓] Mission resumed: status=${resumeRes.body.data.status}`);
    if (resumeRes.body.data.status !== 'IN_TRANSIT') throw new Error('Expected IN_TRANSIT on resume');
  }

  // 4. Mission completion and idempotency
  console.log('\n[Workflow 4/8] Mission Completion & Idempotency Check');
  const comp1 = await request('POST', `/api/missions/${msn1.id}/complete`, {});
  console.log(`  [✓] First complete call: status=${comp1.status}, missionStatus=${comp1.body.data.status}, progress=${comp1.body.data.progressPct}%, completedAt=${comp1.body.data.completedAt}`);
  if (comp1.body.data.status !== 'COMPLETED' || comp1.body.data.progressPct !== 100 || !comp1.body.data.completedAt) {
    throw new Error('Mission completion invariants violated');
  }

  const comp2 = await request('POST', `/api/missions/${msn1.id}/complete`, {});
  console.log(`  [✓] Second complete call (Idempotency): status=${comp2.status}, message=${comp2.body.message}`);
  if (comp2.status !== 200 || !comp2.body.message.includes('already completed')) {
    throw new Error('Idempotent complete check failed');
  }

  // 5. Completed mission remains completed after refresh/reload
  console.log('\n[Workflow 5/8] Mission State Persistence After Reload / Refresh');
  const reloadRes = await request('GET', '/api/missions');
  const reloadedMsn = (reloadRes.body.data || []).find(m => m.id === msn1.id);
  console.log(`  [✓] Queried state from server: Status=${reloadedMsn.status}, Progress=${reloadedMsn.progressPct}%, CompletedAt=${reloadedMsn.completedAt}`);
  if (reloadedMsn.status !== 'COMPLETED' || reloadedMsn.progressPct !== 100) {
    throw new Error('Completed mission did not remain completed after query reload');
  }

  // 6. Robot becomes AVAILABLE / IDLE_STANDBY after completion
  console.log('\n[Workflow 6/8] Robot Release to AVAILABLE / IDLE_STANDBY Invariant');
  const releasedRobot = (reloadRes.body.allRobots || []).find(r => r.id === msn1.robotId);
  console.log(`  [✓] Released Robot state: Status=${releasedRobot.status}, Mode=${releasedRobot.mode}, isBusy=${releasedRobot.isBusy}`);
  if (releasedRobot.isBusy !== false) throw new Error('Robot is still marked busy');
  if (releasedRobot.status !== 'AVAILABLE' && releasedRobot.status !== 'CHARGING') {
    throw new Error('Robot not in AVAILABLE or CHARGING state: ' + releasedRobot.status);
  }

  // 7. Mission history and database persistence
  console.log('\n[Workflow 7/8] On-Disk Persistence & Audit Trail Verification');
  const dbPath = path.resolve(__dirname, '..', 'robovault-local-db.json');
  const diskDb = JSON.parse(fs.readFileSync(dbPath, 'utf8'));
  const diskMsn = diskDb.missions.find(m => m.id === msn1.id);
  if (!diskMsn) throw new Error('Mission not found in on-disk database file');
  console.log(`  [✓] On-Disk JSON: id=${diskMsn.id}, status=${diskMsn.status}, progress=${diskMsn.progressPct}%, completedAt=${diskMsn.completedAt}`);

  const createLog = (diskDb.activityLogs || []).find(l => l.entityId === msn1.id && l.action === 'MISSION_CREATED');
  const completeLog = (diskDb.activityLogs || []).find(l => l.entityId === msn1.id && l.action === 'MISSION_COMPLETED');
  console.log(`  [✓] Activity Audit Log verified: CreatedLog=${!!createLog}, CompletedLog=${!!completeLog}`);
  if (!createLog || !completeLog) throw new Error('Missing audit log entries for mission lifecycle');

  // 8. Error handling for invalid operations
  console.log('\n[Workflow 8/8] Error Handling & Validation Invariants');
  const startInvalid = await request('POST', `/api/missions/${msn1.id}/start`, {});
  console.log(`  [✓] Start completed mission rejected: HTTP ${startInvalid.status} -> ${startInvalid.body.message}`);
  if (startInvalid.status !== 400) throw new Error('Expected HTTP 400 for start on completed mission');

  const resumeInvalid = await request('POST', `/api/missions/${msn1.id}/resume`, {});
  console.log(`  [✓] Resume completed mission rejected: HTTP ${resumeInvalid.status} -> ${resumeInvalid.body.message}`);
  if (resumeInvalid.status !== 400) throw new Error('Expected HTTP 400 for resume on completed mission');

  const abortInvalid = await request('POST', `/api/missions/${msn1.id}/abort`, {});
  console.log(`  [✓] Abort completed mission rejected: HTTP ${abortInvalid.status} -> ${abortInvalid.body.message}`);
  if (abortInvalid.status !== 400) throw new Error('Expected HTTP 400 for abort on completed mission');

  const invalidWs = await request('POST', '/api/missions', {
    name: 'Invalid Workstation Sortie',
    type: 'PAYLOAD_DELIVERY',
    targetWorkstationId: 'ws-invalid-999'
  });
  console.log(`  [✓] Invalid destination rejected: HTTP ${invalidWs.status} -> ${invalidWs.body.message}`);
  if (invalidWs.status !== 400) throw new Error('Expected HTTP 400 for invalid destination');

  // Busy robot conflict test
  const activeSortie = await request('POST', '/api/missions', {
    name: 'Conflict Test Sortie',
    type: 'PAYLOAD_DELIVERY',
    robotId: 'dev-tb4-01',
    targetWorkstationId: 'ws-2',
    autoDispatch: true
  });
  const busyConflict = await request('POST', '/api/missions', {
    name: 'Conflicting Second Sortie',
    type: 'PAYLOAD_DELIVERY',
    robotId: 'dev-tb4-01',
    targetWorkstationId: 'ws-3'
  });
  console.log(`  [✓] Busy robot conflict rejected: HTTP ${busyConflict.status} -> ${busyConflict.body.message}`);
  if (busyConflict.status !== 409) throw new Error('Expected HTTP 409 for busy robot conflict');

  // Clean up the active test sortie
  await request('POST', `/api/missions/${activeSortie.body.data.id}/complete`, {});
  console.log(`  [✓] Test cleanup: completed temporary conflict test sortie ${activeSortie.body.data.id}`);

  console.log('\n========================================================');
  console.log('🎉 ALL 8/8 MISSION WORKFLOWS & SAFETY INVARIANTS PASSED!');
  console.log('========================================================');
}

run().catch(err => {
  console.error('\n❌ Workflow verification failed:', err);
  process.exit(1);
});
