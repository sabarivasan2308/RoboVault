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
  console.log('🧪 DETERMINISTIC MISSION COMPLETION & LIFECYCLE TESTS');
  console.log('========================================================');

  // 1. Reset obstacles first
  await request('POST', '/api/missions/clear-obstacles', {});

  // 2. Create mission with short path
  const createRes = await request('POST', '/api/missions', {
    name: 'Lifecycle Completion Test Sortie',
    type: 'PAYLOAD_DELIVERY',
    robotId: 'dev-tb4-01',
    targetWorkstationId: 'ws-1',
    autoDispatch: true
  });

  if (createRes.status !== 201) {
    throw new Error('Failed to create mission: ' + JSON.stringify(createRes.body));
  }
  const msnId = createRes.body.data.id;
  console.log('[✓] Mission created and auto-dispatched:', msnId);
  console.log('    Path waypoints count:', createRes.body.data.path.length, 'Path:', JSON.stringify(createRes.body.data.path));

  // Test manual completion fallback and idempotency
  console.log('\n--- SUBTEST A: Manual Completion Fallback & Idempotency ---');
  const comp1 = await request('POST', `/api/missions/${msnId}/complete`, {});
  console.log('First complete call status:', comp1.status, 'Message:', comp1.body.message);
  if (comp1.status !== 200 || comp1.body.data.status !== 'COMPLETED') {
    throw new Error('Manual completion failed');
  }
  if (comp1.body.data.progressPct !== 100) {
    throw new Error('Expected progressPct to be 100, got ' + comp1.body.data.progressPct);
  }
  if (!comp1.body.data.completedAt) {
    throw new Error('Expected completedAt timestamp');
  }

  // Idempotency: Second complete call on already completed mission
  const comp2 = await request('POST', `/api/missions/${msnId}/complete`, {});
  console.log('Second complete call status:', comp2.status, 'Message:', comp2.body.message);
  if (comp2.status !== 200 || !comp2.body.message.includes('already completed')) {
    throw new Error('Idempotent complete call failed: ' + comp2.body.message);
  }

  // 3. Verify start and resume are rejected on completed mission
  console.log('\n--- SUBTEST B: Reject Start & Resume on Completed Mission ---');
  const startCompleted = await request('POST', `/api/missions/${msnId}/start`, {});
  console.log('Start completed mission status:', startCompleted.status, 'Message:', startCompleted.body.message);
  if (startCompleted.status !== 400) {
    throw new Error('Expected HTTP 400 when starting completed mission, got ' + startCompleted.status);
  }

  const resumeCompleted = await request('POST', `/api/missions/${msnId}/resume`, {});
  console.log('Resume completed mission status:', resumeCompleted.status, 'Message:', resumeCompleted.body.message);
  if (resumeCompleted.status !== 400) {
    throw new Error('Expected HTTP 400 when resuming completed mission, got ' + resumeCompleted.status);
  }

  // 4. Test Automated Completion at Final Waypoint
  console.log('\n--- SUBTEST C: Automated Completion When Robot Arrives at Final Waypoint ---');
  const droneMsn = await request('POST', '/api/missions', {
    name: 'Automated Traversal Completion Sortie',
    type: 'CALIBRATION_PATROL',
    robotId: 'dev-drone-04',
    targetWorkstationId: 'ws-3',
    autoDispatch: true
  });
  if (droneMsn.status !== 201) {
    throw new Error('Failed to create drone mission: ' + JSON.stringify(droneMsn.body));
  }
  const autoMsnId = droneMsn.body.data.id;
  const pathLen = droneMsn.body.data.path.length;
  console.log('Drone mission created:', autoMsnId, 'Path length:', pathLen);

  const dbPath = path.resolve(__dirname, '..', 'robovault-local-db.json');
  let dbData = JSON.parse(fs.readFileSync(dbPath, 'utf8'));
  let targetMsn = dbData.missions.find(m => m.id === autoMsnId);

  // Set the mission to 1 step before destination
  targetMsn.currentStepIndex = targetMsn.path.length - 2;
  targetMsn.currentCoords = targetMsn.path[targetMsn.currentStepIndex];
  targetMsn.status = 'IN_TRANSIT';
  fs.writeFileSync(dbPath, JSON.stringify(dbData, null, 2));

  console.log('Fast-forwarded mission to penultimate node (Step ' + targetMsn.currentStepIndex + '/' + (targetMsn.path.length - 1) + ')');

  // Wait for ticker (runs every 4 seconds) to advance the final step
  console.log('Waiting 5.5s for ticker to execute and advance into final node...');
  await sleep(5500);

  // Fetch mission status via API
  const getRes = await request('GET', '/api/missions');
  const finishedMsn = (getRes.body.data || []).find(m => m.id === autoMsnId);

  console.log('Mission state after ticker arrival:');
  console.log('  Status:', finishedMsn.status);
  console.log('  Progress:', finishedMsn.progressPct + '%');
  console.log('  Current step:', finishedMsn.currentStepIndex + '/' + finishedMsn.pathLength);
  console.log('  Current coords:', JSON.stringify(finishedMsn.currentCoords), 'Target coords:', JSON.stringify(finishedMsn.targetCoords));
  console.log('  CompletedAt:', finishedMsn.completedAt);

  if (finishedMsn.status !== 'COMPLETED') {
    throw new Error(`Expected mission status COMPLETED, got ${finishedMsn.status}! Robot was at final waypoint!`);
  }
  if (finishedMsn.progressPct !== 100) {
    throw new Error(`Expected progressPct 100, got ${finishedMsn.progressPct}`);
  }
  if (!finishedMsn.completedAt) {
    throw new Error('completedAt is missing');
  }

  // 5. Verify Robot Release and Idle Mode
  console.log('\n--- SUBTEST D: Verify Robot Released to Available / Idle Standby ---');
  const robotDev = (getRes.body.allRobots || []).find(r => r.id === 'dev-drone-04');
  console.log('Robot status:', robotDev.status, 'Mode:', robotDev.mode, 'isBusy:', robotDev.isBusy);
  if (robotDev.isBusy !== false) {
    throw new Error('Expected robot isBusy to be false');
  }
  if (robotDev.status !== 'AVAILABLE' && robotDev.status !== 'CHARGING') {
    throw new Error('Expected robot to be AVAILABLE or CHARGING, got ' + robotDev.status);
  }

  // 6. Verify Ticker Inactivity for Completed Mission
  console.log('\n--- SUBTEST E: Repeated Ticker Runs Do Not Modify Completed Mission ---');
  const elapsedBefore = finishedMsn.elapsedSeconds;
  const batteryBefore = finishedMsn.batteryConsumed;
  console.log('Waiting another 5.0s to confirm ticker skips completed mission...');
  await sleep(5000);

  const getResAfter = await request('GET', '/api/missions');
  const finishedMsnAfter = (getResAfter.body.data || []).find(m => m.id === autoMsnId);

  console.log('  Elapsed seconds before:', elapsedBefore, 'after:', finishedMsnAfter.elapsedSeconds);
  console.log('  Battery consumed before:', batteryBefore, 'after:', finishedMsnAfter.batteryConsumed);

  if (finishedMsnAfter.elapsedSeconds !== elapsedBefore) {
    throw new Error('Ticker erroneously updated elapsedSeconds on completed mission');
  }
  if (finishedMsnAfter.batteryConsumed !== batteryBefore) {
    throw new Error('Ticker erroneously updated batteryConsumed on completed mission');
  }

  // 7. Verify Persistence on Disk
  console.log('\n--- SUBTEST F: Verify Persistence in robovault-local-db.json ---');
  const diskDb = JSON.parse(fs.readFileSync(dbPath, 'utf8'));
  const diskMsn = diskDb.missions.find(m => m.id === autoMsnId);
  console.log('Disk persisted status:', diskMsn.status, 'completedAt:', diskMsn.completedAt);
  if (diskMsn.status !== 'COMPLETED') {
    throw new Error('Disk file does not reflect COMPLETED status');
  }

  console.log('\n🎉 ALL DETERMINISTIC MISSION COMPLETION & LIFECYCLE TESTS PASSED (6/6)!');
}

run().catch(err => {
  console.error('\n❌ TEST FAILED:', err);
  process.exit(1);
});
