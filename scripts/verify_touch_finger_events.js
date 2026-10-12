const { spawn } = require('child_process');
const port = 9733;

const chrome = spawn('C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', [
  '--headless=new',
  '--window-size=1440,900',
  '--remote-debugging-port=' + port,
  'http://localhost:5173/?skiploader#studio'
]);

async function verifyFingerTouch() {
  console.log('[TOUCH_TEST] Launching Chrome on port ' + port + ' for native finger swipe test...');
  await new Promise(r => setTimeout(r, 2500));

  const res = await fetch('http://localhost:' + port + '/json');
  const tabs = await res.json();
  const target = tabs.find(t => t.url.includes('5173'));
  if (!target) throw new Error('Target tab not found');

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
  await send('Input.enable');
  await send('Emulation.setTouchEmulationEnabled', { enabled: true, maxTouchPoints: 5 });

  // Wait for shell to mount and settle
  for (let i = 0; i < 40; i++) {
    const check = await send('Runtime.evaluate', {
      expression: `!!document.getElementById('veritas-portal-shell')`,
      returnByValue: true
    });
    if (check?.result?.value) break;
    await new Promise(r => setTimeout(r, 200));
  }
  await new Promise(r => setTimeout(r, 1800));

  // Measure initial scrollTop
  const before = await send('Runtime.evaluate', {
    expression: `document.getElementById('veritas-portal-shell')?.scrollTop`,
    returnByValue: true
  });
  console.log('[TOUCH_TEST] Initial shell scrollTop:', before.result.value);

  // Synthesize authentic finger touch scroll gesture
  await send('Input.synthesizeScrollGesture', {
    x: 500,
    y: 600,
    xDistance: 0,
    yDistance: -350,
    gestureSourceType: 'touch'
  });
  await new Promise(r => setTimeout(r, 700));

  const after = await send('Runtime.evaluate', {
    expression: `document.getElementById('veritas-portal-shell')?.scrollTop`,
    returnByValue: true
  });
  console.log('[TOUCH_TEST] Shell scrollTop after finger swipe:', after.result.value);

  const passed = after.result.value > 0;
  console.log('[TOUCH_TEST] Native finger touch scroll result:', passed ? 'PASS (Scroll distance: ' + after.result.value + 'px)' : 'FAIL');

  chrome.kill();
  process.exit(passed ? 0 : 1);
}

verifyFingerTouch().catch(err => {
  console.error('[TOUCH_TEST] Error:', err);
  chrome.kill();
  process.exit(1);
});
