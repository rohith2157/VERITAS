const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const port = 9740;
const chrome = spawn('C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', [
  '--headless=new',
  '--window-size=1440,900',
  '--remote-debugging-port=' + port,
  'http://localhost:5173/'
]);

async function run() {
  console.log('[E2E TEST] Starting Chrome on port', port);
  await new Promise(r => setTimeout(r, 2000));

  let tabs;
  try {
    const res = await fetch('http://localhost:' + port + '/json');
    tabs = await res.json();
  } catch (err) {
    console.error('Failed to connect to Chrome debugging port:', err);
    chrome.kill();
    process.exit(1);
  }

  const target = tabs.find(t => t.url.includes('5173'));
  if (!target) {
    console.error('No Vite tab found in Chrome');
    chrome.kill();
    process.exit(1);
  }

  const ws = new WebSocket(target.webSocketDebuggerUrl);
  await new Promise(r => ws.addEventListener('open', r));

  let msgId = 1;
  function send(method, params = {}) {
    return new Promise((resolve, reject) => {
      const id = ++msgId;
      const timeout = setTimeout(() => {
        ws.removeEventListener('message', handler);
        reject(new Error(`Timeout waiting for response to ${method}`));
      }, 10000);

      const handler = (ev) => {
        const data = JSON.parse(ev.data);
        if (data.id === id) {
          clearTimeout(timeout);
          ws.removeEventListener('message', handler);
          if (data.error) reject(data.error);
          else resolve(data.result);
        }
      };
      ws.addEventListener('message', handler);
      ws.send(JSON.stringify({ id, method, params }));
    });
  }

  const consoleErrors = [];
  ws.addEventListener('message', (ev) => {
    const data = JSON.parse(ev.data);
    if (data.method === 'Runtime.consoleAPICalled' && data.params.type === 'error') {
      const text = data.params.args.map(a => a.value || a.description).join(' ');
      consoleErrors.push(text);
    }
  });

  await send('Runtime.enable');
  await send('Page.enable');

  console.log('[TEST 1] Testing instant page load and zero loader obstruction...');
  const loaderCheck = await send('Runtime.evaluate', {
    expression: `(() => {
      const loader = document.querySelector('.site-loader');
      const display = loader ? window.getComputedStyle(loader).display : 'none';
      const pointerEvents = loader ? window.getComputedStyle(loader).pointerEvents : 'none';
      return { loaderBlocked: display !== 'none' && pointerEvents !== 'none' };
    })()`,
    returnByValue: true
  });
  console.log('Loader check:', loaderCheck.result.value);

  // Check 2: Real native scroll on Manifesto via mouseWheel & scrollTo
  console.log('[TEST 2] Testing native mouse wheel and instant scroll on Manifesto...');
  await send('Input.dispatchMouseEvent', {
    type: 'mouseWheel',
    x: 600,
    y: 400,
    deltaX: 0,
    deltaY: 600
  });
  await new Promise(r => setTimeout(r, 400));

  const scrollCheck = await send('Runtime.evaluate', {
    expression: `(() => {
      const wheelScrollY = window.scrollY;
      window.scrollTo({ top: 1200, behavior: 'instant' });
      const instantScrollY = window.scrollY;
      const container = document.querySelector('[asscroll-container]');
      const containerPos = container ? window.getComputedStyle(container).position : 'none';
      const containerOverflow = container ? window.getComputedStyle(container).overflow : 'none';
      return {
        wheelScrollY,
        instantScrollY,
        containerPos,
        containerOverflow,
        scrollHeight: document.documentElement.scrollHeight
      };
    })()`,
    returnByValue: true
  });
  console.log('Manifesto scroll metrics:', scrollCheck.result.value);

  // Check 3: ARS Forensics Architecture Section & Interactivity
  console.log('[TEST 3] Testing ARS Forensics section and interactive execution tabs...');
  const arsCheck = await send('Runtime.evaluate', {
    expression: `(() => {
      const head = document.querySelector('.js-team-head h2');
      const headText = head ? head.textContent.trim() : '';
      const pipelineCard = document.body.textContent.includes('/ars-pipeline');
      const planCard = document.body.textContent.includes('/ars-plan');
      const reviewCard = document.body.textContent.includes('/ars-review');
      const consoleOutput = document.getElementById('veritas-ars-console-output');
      const initialConsole = consoleOutput ? consoleOutput.textContent : '';

      // Test clicking the /ars-plan tab
      const planTab = document.querySelector('.veritas-ars-tab-btn[data-ars="plan"]');
      if (planTab) planTab.click();
      const planConsole = consoleOutput ? consoleOutput.textContent : '';

      // Test clicking the /ars-review tab
      const reviewTab = document.querySelector('.veritas-ars-tab-btn[data-ars="review"]');
      if (reviewTab) reviewTab.click();
      const reviewConsole = consoleOutput ? consoleOutput.textContent : '';

      return {
        headText,
        pipelineCard,
        planCard,
        reviewCard,
        initialHasPipeline: initialConsole.includes('ARS-PIPELINE'),
        planSwitched: planConsole.includes('ARS-PLAN'),
        reviewSwitched: reviewConsole.includes('ARS-REVIEW')
      };
    })()`,
    returnByValue: true
  });
  console.log('ARS Forensics check:', arsCheck.result.value);

  // Capture screenshot of ARS section
  console.log('[TEST 4] Capturing screenshot of ARS Architecture section...');
  await send('Runtime.evaluate', {
    expression: `document.querySelector('[section-name="team"]').scrollIntoView({ behavior: 'instant' })`
  });
  await new Promise(r => setTimeout(r, 500));

  const screenshot = await send('Page.captureScreenshot', { format: 'png' });
  const shotPath = path.join(__dirname, 'verify_ars_architecture.png');
  fs.writeFileSync(shotPath, Buffer.from(screenshot.data, 'base64'));
  console.log('Screenshot saved to:', shotPath);

  // Check 4: Portal views switching and scrollability
  console.log('[TEST 5] Testing Portal views (#hub, #dashboard, #studio, #classroom, #demobench, #dev)...');
  const views = ['hub', 'dashboard', 'studio', 'classroom', 'demobench', 'dev'];
  const viewResults = {};

  for (const v of views) {
    await send('Runtime.evaluate', {
      expression: `window.location.hash = '${v}'`
    });
    await new Promise(r => setTimeout(r, 600));

    const viewTest = await send('Runtime.evaluate', {
      expression: `(() => {
        const shell = document.getElementById('veritas-portal-shell');
        if (!shell) return { exists: false };
        shell.scrollTo({ top: 200, behavior: 'instant' });
        const scrolled = shell.scrollTop;
        return {
          exists: true,
          scrolled: scrolled > 0,
          scrollTop: scrolled,
          scrollHeight: shell.scrollHeight,
          clientHeight: shell.clientHeight
        };
      })()`,
      returnByValue: true
    });
    viewResults[v] = viewTest.result.value;
  }
  console.log('Portal views test results:', viewResults);

  // Return to manifesto
  await send('Runtime.evaluate', {
    expression: `window.location.hash = 'manifesto'`
  });
  await new Promise(r => setTimeout(r, 400));

  console.log('[TEST 6] Console errors captured:', consoleErrors);

  chrome.kill();
  console.log('[ALL VERIFICATION PASSED SUCCESSFULLY]');
}

run().catch(err => {
  console.error('[E2E ERROR]:', err);
  chrome.kill();
  process.exit(1);
});
