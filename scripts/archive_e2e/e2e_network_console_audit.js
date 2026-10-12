const { spawn } = require('child_process');
const fs = require('fs');

const port = 9720;
const chrome = spawn('C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', [
  '--headless=new',
  '--window-size=1440,900',
  '--remote-debugging-port=' + port,
  'http://localhost:5173/?skiploader'
]);

async function runAudit() {
  console.log('[Audit] Starting Headless Chrome on port', port);
  await new Promise(r => setTimeout(r, 2000));
  
  const res = await fetch('http://localhost:' + port + '/json');
  const tabs = await res.json();
  const target = tabs.find(t => t.url.includes('5173'));
  if (!target) throw new Error('Target tab not found');
  
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

  function send(method, params = {}) {
    return new Promise((resolve) => {
      const id = ++msgId;
      pending.set(id, resolve);
      ws.send(JSON.stringify({ id, method, params }));
    });
  }

  const networkRequests = [];
  const networkResponses = [];
  const networkFailures = [];
  const consoleMessages = [];
  const runtimeExceptions = [];

  ws.addEventListener('message', (ev) => {
    const data = JSON.parse(ev.data);
    if (data.method === 'Network.requestWillBeSent') {
      networkRequests.push(data.params);
    } else if (data.method === 'Network.responseReceived') {
      networkResponses.push(data.params);
    } else if (data.method === 'Network.loadingFailed') {
      networkFailures.push(data.params);
    } else if (data.method === 'Console.messageAdded') {
      consoleMessages.push(data.params.message);
    } else if (data.method === 'Runtime.exceptionThrown') {
      runtimeExceptions.push(data.params);
    }
  });

  await send('Network.enable');
  await send('Console.enable');
  await send('Runtime.enable');
  await send('Page.enable');

  console.log('[Audit] Reloading page to capture all initial network traffic...');
  await send('Page.reload');

  // Wait for WebGL & ASS smooth scroll to initialize
  const waitReady = `
    new Promise((resolve) => {
      let tries = 0;
      const check = () => {
        tries++;
        const c = window.u?.WebGL?._cones;
        const w = window.u?.WebGL;
        if (c && c._loaded && w) {
          c.activate({ delay: 0, duration: 0.01 });
          if (w._layer) w._layer.visible = false;
          setTimeout(() => resolve('ready'), 800);
        } else if (tries > 50) {
          resolve('timeout_ready');
        } else {
          setTimeout(check, 100);
        }
      };
      check();
    })
  `;
  await send('Runtime.evaluate', { expression: waitReady, awaitPromise: true });
  await new Promise(r => setTimeout(r, 1500));

  console.log('[Audit] Scrolling through full page to trigger lazy assets...');
  const scrollThrough = `
    (async () => {
      const ass = window.u?.ASS;
      if (!ass) return 'no ASS';
      const max = ass.maxScroll || 7000;
      for (let y = 0; y <= max; y += 1200) {
        ass.scrollTo(y, false);
        await new Promise(r => setTimeout(r, 400));
      }
      ass.scrollTo(0, false);
      return 'done';
    })()
  `;
  await send('Runtime.evaluate', { expression: scrollThrough, awaitPromise: true });
  await new Promise(r => setTimeout(r, 2000));

  // Collect summary of assets
  const assetsReport = {
    totalRequests: networkRequests.length,
    totalResponses: networkResponses.length,
    failures: networkFailures.map(f => ({
      requestId: f.requestId,
      errorText: f.errorText,
      canceled: f.canceled,
      type: f.type
    })),
    statusCodes: networkResponses.map(r => ({
      url: r.response.url,
      status: r.response.status,
      statusText: r.response.statusText,
      mimeType: r.response.mimeType
    })),
    httpErrors: networkResponses.filter(r => r.response.status >= 400).map(r => ({
      url: r.response.url,
      status: r.response.status,
      statusText: r.response.statusText
    })),
    consoleErrors: consoleMessages.filter(m => m.level === 'error'),
    consoleWarnings: consoleMessages.filter(m => m.level === 'warning'),
    runtimeExceptions: runtimeExceptions.map(e => ({
      text: e.exceptionDetails?.text,
      line: e.exceptionDetails?.lineNumber,
      url: e.exceptionDetails?.url,
      exception: e.exceptionDetails?.exception?.description
    }))
  };

  console.log('\n==========================================');
  console.log('       NETWORK & CONSOLE AUDIT RESULTS    ');
  console.log('==========================================');
  console.log(`Total HTTP Requests Tracked: ${assetsReport.totalRequests}`);
  console.log(`Total Responses Received:    ${assetsReport.totalResponses}`);
  console.log(`HTTP 4xx/5xx Errors:         ${assetsReport.httpErrors.length}`);
  if (assetsReport.httpErrors.length > 0) {
    console.log('Detected HTTP Errors:', JSON.stringify(assetsReport.httpErrors, null, 2));
  }
  console.log(`Network Failures:            ${assetsReport.failures.length}`);
  if (assetsReport.failures.length > 0) {
    console.log('Failed Requests:', JSON.stringify(assetsReport.failures, null, 2));
  }
  console.log(`Runtime Exceptions:          ${assetsReport.runtimeExceptions.length}`);
  if (assetsReport.runtimeExceptions.length > 0) {
    console.log('Runtime Exceptions:', JSON.stringify(assetsReport.runtimeExceptions, null, 2));
  }
  console.log(`Console Errors:              ${assetsReport.consoleErrors.length}`);
  if (assetsReport.consoleErrors.length > 0) {
    console.log('Console Errors:', JSON.stringify(assetsReport.consoleErrors, null, 2));
  }
  console.log('==========================================\n');

  fs.writeFileSync('c:\\TTProject\\frontend\\audit_network_console.json', JSON.stringify(assetsReport, null, 2));

  chrome.kill();
  process.exit(assetsReport.httpErrors.length === 0 && assetsReport.runtimeExceptions.length === 0 ? 0 : 1);
}

runAudit().catch(err => {
  console.error('[Audit] Fatal error:', err);
  chrome.kill();
  process.exit(1);
});
