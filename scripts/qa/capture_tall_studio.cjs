const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

async function shot() {
  const cdpPort = 9856;
  const chrome = spawn('C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', [
    '--headless=new',
    '--window-size=1440,1400',
    '--remote-debugging-port=' + cdpPort,
    'http://localhost:5173/#studio'
  ]);

  await new Promise(r => setTimeout(r, 2000));
  const res = await fetch('http://localhost:' + cdpPort + '/json');
  const tabs = await res.json();
  const target = tabs.find(t => t.url.includes('5173') || t.url.includes('studio'));
  const ws = new WebSocket(target.webSocketDebuggerUrl);
  await new Promise(r => ws.addEventListener('open', r));

  let msgId = 1;
  const pending = new Map();
  ws.addEventListener('message', (ev) => {
    const data = JSON.parse(ev.data);
    if (data.id && pending.has(data.id)) {
      const resolve = pending.get(data.id);
      pending.delete(data.id);
      resolve(data.result);
    }
  });

  const send = (method, params = {}) => new Promise((resolve) => {
    const id = ++msgId;
    pending.set(id, resolve);
    ws.send(JSON.stringify({ id, method, params }));
  });

  const evalJs = (expr) => send('Runtime.evaluate', { expression: expr, returnByValue: true, awaitPromise: true });
  await new Promise(r => setTimeout(r, 1200));

  // 1. Tab 1 Dual Panes & Token Diff
  console.log('[Tall Shot] Capturing Tab 1 Split Diff Dual Panes...');
  await evalJs("document.getElementById('tab-btn-1to1')?.click()");
  await new Promise(r => setTimeout(r, 500));
  await evalJs("document.getElementById('btn-execute-1to1')?.click()");
  await new Promise(r => setTimeout(r, 1200));
  const s1 = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync('C:\\TTProject\\audit_screenshots\\studio_tab1_dual_panes.png', Buffer.from(s1.data, 'base64'));

  // 2. Tab 4 Variable Mappings & AST Equivalence
  console.log('[Tall Shot] Capturing Tab 4 Variable Mappings & AST Equivalence...');
  await evalJs("document.getElementById('tab-btn-code')?.click()");
  await new Promise(r => setTimeout(r, 500));
  await evalJs("document.getElementById('btn-run-code-ast')?.click()");
  await new Promise(r => setTimeout(r, 1200));
  const s4 = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync('C:\\TTProject\\audit_screenshots\\studio_tab4_variable_mappings.png', Buffer.from(s4.data, 'base64'));

  console.log('[Tall Shot] Done!');
  chrome.kill();
  ws.close();
}

shot().catch(err => {
  console.error(err);
  process.exit(1);
});
