const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const frontendDir = 'c:\\TTProject\\frontend';

console.log('\n======================================================');
console.log('       PRODUCTION BUILD PERFORMANCE BENCHMARK         ');
console.log('======================================================');

const runs = 3;
const viteTimings = [];
let lastOutput = '';

for (let i = 1; i <= runs; i++) {
  console.log(`[Build] Running production build trial #${i}...`);
  try {
    const output = execSync('npm run build', {
      cwd: frontendDir,
      encoding: 'utf8',
      stdio: 'pipe'
    });
    lastOutput = output;
    
    // Extract Vite reported build time: "✓ built in XXXms" or "✓ built in X.XXs"
    const matchMs = output.match(/built in (\d+)ms/);
    const matchS = output.match(/built in ([\d\.]+)s/);
    let ms = 0;
    if (matchMs) {
      ms = parseInt(matchMs[1], 10);
    } else if (matchS) {
      ms = Math.round(parseFloat(matchS[1]) * 1000);
    }
    viteTimings.push(ms);
    console.log(`  Trial #${i}: Vite built in ${ms}ms (✓ Zero Bundle Errors)`);
  } catch (err) {
    console.error(`  Trial #${i} FAILED:`, err.message);
    process.exit(1);
  }
}

const avgMs = Math.round(viteTimings.reduce((a, b) => a + b, 0) / viteTimings.length);
const minMs = Math.min(...viteTimings);
const maxMs = Math.max(...viteTimings);

console.log('\n[Build Benchmark Metrics]');
console.log(`- Trial #1 Vite build time: ${viteTimings[0]}ms`);
console.log(`- Trial #2 Vite build time: ${viteTimings[1]}ms`);
console.log(`- Trial #3 Vite build time: ${viteTimings[2]}ms`);
console.log(`- Average Vite build time:  ${avgMs}ms`);
console.log(`- Best Trial:               ${minMs}ms`);
console.log(`- Target SLA Threshold:     2000ms (2.0 seconds)`);
console.log(`- Status:                   ${avgMs < 2000 ? 'PASS (< 2.0s SLA verified)' : 'FAIL'}`);

// Dist folder inspection
const distDir = path.join(frontendDir, 'dist');
const distFiles = [];

function scanDir(dir, prefix = '') {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    const rel = path.join(prefix, entry.name);
    if (entry.isDirectory()) {
      scanDir(full, rel);
    } else {
      const stats = fs.statSync(full);
      distFiles.push({ file: rel, sizeBytes: stats.size, sizeKB: Math.round(stats.size / 1024) });
    }
  }
}

scanDir(distDir);

console.log('\n[Verified Production Assets]');
distFiles.filter(f => !f.file.includes('models') && !f.file.includes('images')).forEach(f => {
  console.log(`- ${f.file.padEnd(35)} ${f.sizeKB} KB`);
});

const report = {
  trialsMs: viteTimings,
  averageMs: avgMs,
  fastestMs: minMs,
  targetSlaMs: 2000,
  compliantUnder2s: avgMs < 2000,
  rawViteOutput: lastOutput.trim(),
  distFileCount: distFiles.length
};

fs.writeFileSync(path.join(frontendDir, 'audit_build_benchmark.json'), JSON.stringify(report, null, 2));

console.log('======================================================\n');
process.exit(avgMs < 2000 ? 0 : 1);
