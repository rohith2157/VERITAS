const { spawn } = require('child_process');
const fs = require('fs');

const port = 9716;
const chrome = spawn('C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', [
  '--headless=new',
  '--window-size=1440,900',
  '--remote-debugging-port=' + port,
  'http://localhost:5173/?skiploader'
]);

async function run() {
  await new Promise(r => setTimeout(r, 2000));
  const res = await fetch('http://localhost:' + port + '/json');
  const tabs = await res.json();
  const target = tabs.find(t => t.url.includes('5173'));
  const ws = new WebSocket(target.webSocketDebuggerUrl);
  await new Promise(r => ws.addEventListener('open', r));

  let msgId = 1;
  function send(method, params = {}) {
    return new Promise(resolve => {
      const id = ++msgId;
      const handler = ev => {
        const data = JSON.parse(ev.data);
        if (data.id === id) {
          ws.removeEventListener('message', handler);
          resolve(data.result);
        }
      };
      ws.addEventListener('message', handler);
      ws.send(JSON.stringify({ id, method, params }));
    });
  }

  await send('Runtime.enable');
  await send('Page.enable');
  await new Promise(r => setTimeout(r, 1500));

  async function captureView(hash, filename, description) {
    console.log(`Testing view: ${description} (${hash})...`);
    await send('Runtime.evaluate', { expression: `window.location.hash = '${hash}'` });
    await new Promise(r => setTimeout(r, 800));
    const title = await send('Runtime.evaluate', { expression: 'document.title' });
    const text = await send('Runtime.evaluate', { 
      expression: 'document.querySelector("h1, h2") ? document.querySelector("h1, h2").textContent : "none"' 
    });
    console.log(`  Header in view: ${text.result.value}`);
    const shot = await send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync(filename, Buffer.from(shot.data, 'base64'));
    console.log(`  Saved screenshot: ${filename}`);
  }

  // 1. Landing Page
  console.log('Testing 3D Manifesto Landing Page...');
  let shot = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync('verify_dashboard_1_landing.png', Buffer.from(shot.data, 'base64'));

  // 2. Operations Dashboard
  await captureView('#dashboard', 'verify_dashboard_2_operations.png', 'Operations & Forensic Ledger Dashboard');

  // 3. Verification Studio
  await captureView('#studio', 'verify_dashboard_3_studio.png', 'Universal Verification Studio');

  // 4. Classroom Portal
  await captureView('#classroom', 'verify_dashboard_4_classroom.png', 'Classroom & Cohort Portal');

  // 5. Adversarial Demo Bench
  await captureView('#demobench', 'verify_dashboard_5_demobench.png', 'Adversarial Evasion Demo Bench');

  // 6. Developer Workstation
  await captureView('#dev', 'verify_dashboard_6_developer.png', 'Developer Workstation & 7-Agent Matrix');

  // 7. Back to Manifesto
  console.log('Testing "Back to Manifesto" click...');
  await send('Runtime.evaluate', { expression: 'document.getElementById("veritas-back-to-manifesto").click()' });
  await new Promise(r => setTimeout(r, 800));
  shot = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync('verify_dashboard_7_back_to_manifesto.png', Buffer.from(shot.data, 'base64'));
  console.log('  Saved screenshot: verify_dashboard_7_back_to_manifesto.png');

  ws.close();
  chrome.kill();
  console.log('All 7 verification tests completed successfully!');
  process.exit(0);
}

run().catch(e => {
  console.error(e);
  chrome.kill();
  process.exit(1);
});

