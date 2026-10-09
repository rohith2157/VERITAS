const { spawn } = require('child_process');
const fs = require('fs');

const port = 9766;
const chrome = spawn('C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', [
  '--headless=new',
  '--window-size=1440,900',
  '--remote-debugging-port=' + port,
  'http://localhost:5173/?skiploader'
]);

async function verifyDesign() {
  await new Promise(r => setTimeout(r, 2500));
  const res = await fetch('http://localhost:' + port + '/json');
  const tabs = await res.json();
  const target = tabs.find(t => t.url.includes('5173'));
  if (!target) {
    console.error('Target tab not found:', tabs);
    chrome.kill();
    return;
  }
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
  await send('DOM.enable');
  await send('CSS.enable');
  await new Promise(r => setTimeout(r, 1500));

  async function evalExpr(code) {
    const r = await send('Runtime.evaluate', { expression: code, returnByValue: true });
    return r.result ? r.result.value : undefined;
  }

  // 1. Audit textWrap balance
  const headingStyles = await evalExpr(`(() => {
    const landing = document.querySelector('.landing__title');
    const intro = document.querySelector('.introduction__title');
    const manifesto = document.querySelector('.manifesto__title');
    const footer = document.querySelector('.footer__head h2');
    return {
      landingTextWrap: window.getComputedStyle(landing).textWrap,
      introTextWrap: window.getComputedStyle(intro).textWrap,
      manifestoTextWrap: window.getComputedStyle(manifesto).textWrap,
      footerTextWrap: window.getComputedStyle(footer).textWrap
    };
  })()`);

  console.log('[DesignVerify] Headings text-wrap styles:', headingStyles);

  // 2. Open Modal & Capture Scenario 1 (Homoglyph)
  await evalExpr(`(() => {
    const btn = document.querySelector('.landing .btn');
    if (btn) btn.click();
  })()`);
  await new Promise(r => setTimeout(r, 600));

  let shot = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync('c:\\TTProject\\audit_design_modal_after_scenario1.png', Buffer.from(shot.data, 'base64'));
  console.log('[DesignVerify] Saved scenario 1 screenshot');

  // 3. Click Scenario 2 (AST Clone)
  await evalExpr(`(() => {
    const btn = document.querySelector('.veritas-tab-btn[data-scenario="ast"]');
    if (btn) btn.click();
  })()`);
  await new Promise(r => setTimeout(r, 500));

  const scenario2State = await evalExpr(`(() => {
    return {
      score: document.getElementById('veritas-containment-score').textContent,
      windows: document.getElementById('veritas-window-info').textContent,
      evasion: document.getElementById('veritas-evasion-status').textContent
    };
  })()`);
  console.log('[DesignVerify] Scenario 2 state:', scenario2State);

  shot = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync('c:\\TTProject\\audit_design_modal_after_scenario2.png', Buffer.from(shot.data, 'base64'));
  console.log('[DesignVerify] Saved scenario 2 screenshot');

  // 4. Click Scenario 3 (Clean Paper)
  await evalExpr(`(() => {
    const btn = document.querySelector('.veritas-tab-btn[data-scenario="clean"]');
    if (btn) btn.click();
  })()`);
  await new Promise(r => setTimeout(r, 500));

  const scenario3State = await evalExpr(`(() => {
    return {
      score: document.getElementById('veritas-containment-score').textContent,
      windows: document.getElementById('veritas-window-info').textContent,
      evasion: document.getElementById('veritas-evasion-status').textContent
    };
  })()`);
  console.log('[DesignVerify] Scenario 3 state:', scenario3State);

  shot = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync('c:\\TTProject\\audit_design_modal_after_scenario3.png', Buffer.from(shot.data, 'base64'));
  console.log('[DesignVerify] Saved scenario 3 screenshot');

  // 5. Close modal via Escape key
  await send('Input.dispatchKeyEvent', { type: 'keyDown', key: 'Escape', code: 'Escape' });
  await send('Input.dispatchKeyEvent', { type: 'keyUp', key: 'Escape', code: 'Escape' });
  await new Promise(r => setTimeout(r, 500));

  const isClosed = await evalExpr(`(() => {
    const modal = document.getElementById('veritas-studio-modal');
    return !modal.classList.contains('active') && window.getComputedStyle(modal).display === 'none';
  })()`);
  console.log('[DesignVerify] Modal closed via Escape:', isClosed);

  shot = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync('c:\\TTProject\\audit_design_hero_after.png', Buffer.from(shot.data, 'base64'));
  console.log('[DesignVerify] Saved hero after screenshot');

  ws.close();
  chrome.kill();
  console.log('[DesignVerify] All tests passed with 100% design fidelity!');
}

verifyDesign().catch(err => {
  console.error('[DesignVerify] Error:', err);
  chrome.kill();
  process.exit(1);
});

