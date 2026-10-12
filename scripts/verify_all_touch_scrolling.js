const { spawn } = require('child_process');
const port = 9728;

const chrome = spawn('C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', [
  '--headless=new',
  '--window-size=1440,900',
  '--remote-debugging-port=' + port,
  'http://localhost:5173/?skiploader#studio'
]);

async function runVerification() {
  console.log('[VERIFY] Starting Headless Chrome Touch & Scroll Verification on port ' + port + '...');
  await new Promise(r => setTimeout(r, 2500));

  const res = await fetch('http://localhost:' + port + '/json');
  const tabs = await res.json();
  const target = tabs.find(t => t.url.includes('5173'));
  if (!target) throw new Error('No target tab found matching 5173');

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
  await send('Page.enable');

  const results = {
    studioInspector: {},
    diffPanes: {},
    evaluationQueue: {},
    cryptoLedger: {},
    manifestoLanding: {},
    overallSuccess: true
  };

  // Helper to wait for selector
  async function waitForSelector(selector, maxTries = 40) {
    for (let i = 0; i < maxTries; i++) {
      const res = await send('Runtime.evaluate', {
        expression: `!!document.querySelector('${selector}')`,
        returnByValue: true
      });
      if (res?.result?.value) return true;
      await new Promise(r => setTimeout(r, 200));
    }
    return false;
  }

  // 1. Verify Studio Inspector
  console.log('[VERIFY 1/5] Testing Studio Inspector (#studio) finger touch & wheel scrolling...');
  await waitForSelector('#tab-btn-1to1');
  await new Promise(r => setTimeout(r, 1800));

  // Dispatch wheel event on portal shell
  await send('Input.dispatchMouseEvent', {
    type: 'mouseWheel',
    x: 400,
    y: 300,
    deltaX: 0,
    deltaY: 450
  });
  await new Promise(r => setTimeout(r, 600));

  let evalStudio = await send('Runtime.evaluate', {
    expression: `(() => {
      const shell = document.getElementById('veritas-portal-shell');
      return {
        shellScrollTop: shell ? shell.scrollTop : 0,
        shellScrollHeight: shell ? shell.scrollHeight : 0,
        touchAction: shell ? window.getComputedStyle(shell).touchAction : 'none',
        assDisabled: window.u?.ASS?.enabled === false || window.u?.ASS?.disabled === true
      };
    })()`,
    returnByValue: true
  });
  results.studioInspector = evalStudio.result.value;
  console.log('   Studio Inspector Result:', results.studioInspector);

  // 2. Verify Synchronized Diff Panes touch scrolling
  console.log('[VERIFY 2/5] Testing Synchronized Dual-Pane Diff Inspector (#diff-pane-left & right)...');
  // Reset shell scroll so diff panes are in view
  await send('Runtime.evaluate', {
    expression: `(() => {
      const shell = document.getElementById('veritas-portal-shell');
      if (shell) shell.scrollTop = 0;
    })()`
  });
  await new Promise(r => setTimeout(r, 200));

  // Get exact bounding rect of #diff-pane-left
  const paneBounds = await send('Runtime.evaluate', {
    expression: `(() => {
      const el = document.getElementById('diff-pane-left');
      if (!el) return null;
      const rect = el.getBoundingClientRect();
      return { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
    })()`,
    returnByValue: true
  });

  if (paneBounds.result.value) {
    await send('Input.dispatchMouseEvent', {
      type: 'mouseWheel',
      x: Math.round(paneBounds.result.value.x),
      y: Math.round(paneBounds.result.value.y),
      deltaX: 0,
      deltaY: 200
    });
    await new Promise(r => setTimeout(r, 400));
  }

  let evalPanes = await send('Runtime.evaluate', {
    expression: `(() => {
      const left = document.getElementById('diff-pane-left');
      const right = document.getElementById('diff-pane-right');
      return {
        leftScrollTop: left ? left.scrollTop : 0,
        rightScrollTop: right ? right.scrollTop : 0,
        leftTouchAction: left ? window.getComputedStyle(left).touchAction : 'none',
        rightTouchAction: right ? window.getComputedStyle(right).touchAction : 'none'
      };
    })()`,
    returnByValue: true
  });
  results.diffPanes = evalPanes.result.value;
  console.log('   Diff Panes Result:', results.diffPanes);

  // 3. Switch to Evaluation Queue (#queue)
  console.log('[VERIFY 3/5] Navigating to Evaluation Queue (#queue) and testing touch scrolling...');
  await send('Runtime.evaluate', {
    expression: `document.getElementById('tab-btn-queue')?.click()`
  });
  await waitForSelector('.classroom-table-wrap');
  await new Promise(r => setTimeout(r, 500));

  await send('Input.dispatchMouseEvent', {
    type: 'mouseWheel',
    x: 500,
    y: 350,
    deltaX: 0,
    deltaY: 400
  });
  await new Promise(r => setTimeout(r, 400));

  let evalQueue = await send('Runtime.evaluate', {
    expression: `(() => {
      const shell = document.getElementById('veritas-portal-shell');
      const tableWrap = document.querySelector('.classroom-table-wrap');
      return {
        shellScrollTop: shell ? shell.scrollTop : 0,
        tableWrapTouchAction: tableWrap ? window.getComputedStyle(tableWrap).touchAction : 'none',
        tableWrapOverflowX: tableWrap ? window.getComputedStyle(tableWrap).overflowX : 'none'
      };
    })()`,
    returnByValue: true
  });
  results.evaluationQueue = evalQueue.result.value;
  console.log('   Evaluation Queue Result:', results.evaluationQueue);

  // 4. Switch to Cryptographic Ledger (#ledger)
  console.log('[VERIFY 4/5] Navigating to Cryptographic Ledger (#ledger) and testing touch scrolling...');
  await send('Runtime.evaluate', {
    expression: `document.getElementById('tab-btn-ledger')?.click()`
  });
  await new Promise(r => setTimeout(r, 500));

  await send('Input.dispatchMouseEvent', {
    type: 'mouseWheel',
    x: 500,
    y: 350,
    deltaX: 0,
    deltaY: 400
  });
  await new Promise(r => setTimeout(r, 400));

  let evalLedger = await send('Runtime.evaluate', {
    expression: `(() => {
      const shell = document.getElementById('veritas-portal-shell');
      return {
        shellScrollTop: shell ? shell.scrollTop : 0,
        shellScrollHeight: shell ? shell.scrollHeight : 0
      };
    })()`,
    returnByValue: true
  });
  results.cryptoLedger = evalLedger.result.value;
  console.log('   Cryptographic Ledger Result:', results.cryptoLedger);

  // 5. Switch to Manifesto Landing Page (#manifesto) and check ASScroll re-enabled
  console.log('[VERIFY 5/5] Returning to Manifesto Landing Page (#manifesto) and verifying ASScroll reactivation...');
  await send('Runtime.evaluate', {
    expression: `document.getElementById('veritas-back-to-manifesto')?.click()`
  });
  await new Promise(r => setTimeout(r, 800));

  let evalManifesto = await send('Runtime.evaluate', {
    expression: `(() => {
      const shell = document.getElementById('veritas-portal-shell');
      const ass = window.u?.ASS;
      return {
        portalShellUnmounted: !shell,
        assExists: !!ass,
        assEnabled: !ass?.disabled
      };
    })()`,
    returnByValue: true
  });
  results.manifestoLanding = evalManifesto.result.value;
  console.log('   Manifesto Landing Result:', results.manifestoLanding);

  // Validate all pass criteria
  const studioPassed = results.studioInspector.shellScrollTop > 0;
  const queuePassed = results.evaluationQueue.shellScrollTop > 0;
  const ledgerPassed = results.cryptoLedger.shellScrollTop > 0;
  const manifestoPassed = results.manifestoLanding.portalShellUnmounted && results.manifestoLanding.assEnabled;

  results.overallSuccess = studioPassed && queuePassed && ledgerPassed && manifestoPassed;

  console.log('\n=================== VERIFICATION SUMMARY ===================');
  console.log('Studio Inspector Scrolled:      ', studioPassed ? 'PASS' : 'FAIL');
  console.log('Evaluation Queue Scrolled:     ', queuePassed ? 'PASS' : 'FAIL');
  console.log('Cryptographic Ledger Scrolled: ', ledgerPassed ? 'PASS' : 'FAIL');
  console.log('Manifesto Landing Reactivated: ', manifestoPassed ? 'PASS' : 'FAIL');
  console.log('Overall Verification Status:   ', results.overallSuccess ? 'ALL TESTS PASSED' : 'SOME TESTS FAILED');
  console.log('============================================================\n');

  chrome.kill();
  if (results.overallSuccess) {
    process.exit(0);
  } else {
    process.exit(1);
  }
}

runVerification().catch(err => {
  console.error('Verification failed with error:', err);
  chrome.kill();
  process.exit(1);
});
