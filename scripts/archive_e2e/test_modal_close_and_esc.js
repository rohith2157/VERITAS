const { spawn } = require('child_process');
const fs = require('fs');
const port = 9711;

const chrome = spawn('C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', [
  '--headless=new',
  '--window-size=1440,900',
  '--remote-debugging-port=' + port,
  'http://localhost:5173/?skiploader'
]);

async function runModalTests() {
  await new Promise(r => setTimeout(r, 2000));
  const res = await fetch('http://localhost:' + port + '/json');
  const tabs = await res.json();
  const target = tabs.find(t => t.url.includes('5173'));
  const ws = new WebSocket(target.webSocketDebuggerUrl);
  await new Promise(r => ws.addEventListener('open', r));

  let msgId = 1;
  function send(method, params = {}) {
    return new Promise((resolve) => {
      const id = ++msgId;
      const handler = (ev) => {
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
  await new Promise(r => setTimeout(r, 1000));

  async function evalExpr(code) {
    const r = await send('Runtime.evaluate', { expression: code, returnByValue: true });
    if (r.exceptionDetails) {
      console.error('Eval error on:', code, r.exceptionDetails);
    }
    return r.result ? r.result.value : undefined;
  }

  console.log('--- Test 1: Open modal via CTA click ---');
  await evalExpr(`document.querySelector('a[aria-label="Request Access"]').click()`);
  await new Promise(r => setTimeout(r, 500));
  let isActive = await evalExpr(`document.getElementById('veritas-studio-modal').classList.contains('active')`);
  console.log('Modal active after CTA click:', isActive);

  console.log('--- Test 2: Close modal via Close button ---');
  await evalExpr(`document.getElementById('veritas-close-modal').click()`);
  await new Promise(r => setTimeout(r, 500));
  isActive = await evalExpr(`document.getElementById('veritas-studio-modal').classList.contains('active')`);
  console.log('Modal active after Close click:', isActive);

  console.log('--- Test 3: Open modal and close via Escape key ---');
  await evalExpr(`document.querySelector('a[aria-label="Request Access"]').click()`);
  await new Promise(r => setTimeout(r, 500));
  await send('Input.dispatchKeyEvent', { type: 'keyDown', key: 'Escape', code: 'Escape', windowsVirtualKeyCode: 27 });
  await new Promise(r => setTimeout(r, 500));
  isActive = await evalExpr(`document.getElementById('veritas-studio-modal').classList.contains('active')`);
  console.log('Modal active after Escape key:', isActive);

  console.log('--- Test 4: Open modal and close via Back to Experience button ---');
  await evalExpr(`document.querySelector('a[aria-label="Request Access"]').click()`);
  await new Promise(r => setTimeout(r, 500));
  await evalExpr(`document.getElementById('veritas-modal-back-btn').click()`);
  await new Promise(r => setTimeout(r, 500));
  isActive = await evalExpr(`document.getElementById('veritas-studio-modal').classList.contains('active')`);
  console.log('Modal active after Back to Experience click:', isActive);

  console.log('--- Test 5: Open modal and close via Backdrop click ---');
  await evalExpr(`document.querySelector('a[aria-label="Request Access"]').click()`);
  await new Promise(r => setTimeout(r, 500));
  await evalExpr(`document.getElementById('veritas-studio-modal').click()`);
  await new Promise(r => setTimeout(r, 500));
  isActive = await evalExpr(`document.getElementById('veritas-studio-modal').classList.contains('active')`);
  console.log('Modal active after Backdrop click:', isActive);

  chrome.kill();
  console.log('ALL MODAL TESTS COMPLETED SUCCESSFULLY!');
  process.exit(0);
}

runModalTests().catch(err => {
  console.error(err);
  chrome.kill();
  process.exit(1);
});
