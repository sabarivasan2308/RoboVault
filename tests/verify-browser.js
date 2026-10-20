const { execSync } = require('child_process');

console.log('========================================================');
console.log('🌐 BROWSER WORKFLOW & LIVE DOM HEADLESS VERIFICATION');
console.log('========================================================');

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

try {
  console.log('[1/4] Running headless Chrome to dump live DOM from http://localhost:3000...');
  const cmd = `"${chromePath}" --headless=new --disable-gpu --dump-dom "http://localhost:3000"`;
  const dom = execSync(cmd, { encoding: 'utf8', maxBuffer: 10 * 1024 * 1024 });

  console.log(`[✓] Headless Chrome connected and dumped ${dom.length} characters of live DOM.`);

  // Assertions
  const checks = [
    { name: 'Application Title', pattern: 'ROBO VAULT NEXUS' },
    { name: 'Simulated Provider Watermark', pattern: 'SIMULATED TELEMETRY PROVIDER' },
    { name: 'Dashboard Tab Button', pattern: 'data-tab="dashboard"' },
    { name: 'Missions Tab Button', pattern: 'data-tab="missions"' },
    { name: 'Digital Twin Tab Button', pattern: 'data-tab="digitalTwin"' },
    { name: 'Predictive Health Tab Button', pattern: 'data-tab="predictive"' },
    { name: 'Research Intelligence Tab Button', pattern: 'data-tab="research"' },
    { name: 'Assets Tab Button', pattern: 'data-tab="assets"' },
    { name: 'Tracked Hardware Metric Card', pattern: 'Tracked Hardware Units' },
    { name: 'Fleet Utilization Metric Card', pattern: 'Fleet Utilization' },
    { name: 'Laboratory Digital Twin Schema', pattern: 'ZONE A: GROUND ROBOTICS' }
  ];

  let passedChecks = 0;
  for (const chk of checks) {
    if (dom.includes(chk.pattern)) {
      console.log(`  [✓] Verified DOM component: ${chk.name}`);
      passedChecks++;
    } else {
      console.error(`  [✗] Missing DOM component: ${chk.name}`);
    }
  }

  if (passedChecks !== checks.length) {
    throw new Error(`DOM checks failed: ${passedChecks}/${checks.length} passed.`);
  }

  console.log('\n[2/4] Verifying live API telemetry state from port 3000...');
  const healthRaw = execSync('curl.exe -s http://localhost:3000/api/health/system', { encoding: 'utf8' });
  const health = JSON.parse(healthRaw);
  if (health.status !== 'UP') throw new Error('Health check status is not UP');
  const memStr = health.memory ? `${health.memory.heapUsedMb} MB (Heap) / ${health.memory.rssMb} MB (RSS)` : 'N/A';
  console.log(`[✓] Engine Status: ${health.status}, Uptime: ${health.uptimeSeconds}s, Memory: ${memStr}`);

  console.log('\n[3/4] Verifying mission dispatch & obstacle clearance API...');
  const clearRes = JSON.parse(execSync('curl.exe -s -X POST http://localhost:3000/api/missions/clear-obstacles', { encoding: 'utf8' }));
  if (!clearRes.success) throw new Error('Clear obstacles failed');
  console.log('[✓] Dynamic obstacles cleared.');

  console.log('\n[4/4] Verifying mission records in database persistence...');
  const msnRaw = execSync('curl.exe -s http://localhost:3000/api/missions', { encoding: 'utf8' });
  const msnData = JSON.parse(msnRaw);
  console.log(`[✓] Live Sorties Count: ${msnData.data.length}`);
  console.log(`[✓] Available Robots for Immediate Dispatch: ${msnData.availableRobots.length}`);
  for (const r of msnData.allRobots) {
    console.log(`    - Robot: ${r.name} (${r.id}) -> Status: ${r.status}, Mode: ${r.mode}, Battery: ${r.battery}%`);
  }

  console.log('\n🎉 ALL HEADLESS BROWSER & LIVE SYSTEM CHECKS PASSED (100%)!');
} catch (err) {
  console.error('\n❌ Browser verification failed:', err);
  process.exit(1);
}
