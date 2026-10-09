const { spawn } = require('child_process');
const fs = require('fs');

const port = 9755;
const chrome = spawn('C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', [
  '--headless=new',
  '--window-size=1440,900',
  '--remote-debugging-port=' + port,
  'http://localhost:5173/?skiploader'
]);

async function runAudit() {
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

  // 1. Audit Typography & Computed Styles
  const typoAudit = await evalExpr(`(() => {
    function getProps(selector) {
      const el = document.querySelector(selector);
      if (!el) return null;
      const s = window.getComputedStyle(el);
      return {
        selector,
        tag: el.tagName,
        fontFamily: s.fontFamily,
        fontSize: s.fontSize,
        fontWeight: s.fontWeight,
        lineHeight: s.lineHeight,
        letterSpacing: s.letterSpacing,
        color: s.color,
        textWrap: s.textWrap || s.webkitTextWrap || 'auto',
        fontFeatureSettings: s.fontFeatureSettings,
        box: { width: el.clientWidth, height: el.clientHeight }
      };
    }

    return {
      body: getProps('body'),
      landingTitle: getProps('.landing__title'),
      introTitle: getProps('.introduction__title'),
      manifestoTitle: getProps('.manifesto__title'),
      teamTitle: getProps('.team h2'),
      investorsTitle: getProps('.investors__text h2'),
      footerTitle: getProps('.footer__head h2')
    };
  })()`);

  console.log('[DesignAudit] Typography Audit Result:', JSON.stringify(typoAudit, null, 2));

  // 2. Open Modal and capture state
  await evalExpr(`(() => {
    const btn = document.querySelector('.landing .btn');
    if (btn) btn.click();
  })()`);
  await new Promise(r => setTimeout(r, 800));

  const modalScreenshot = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync('c:\\TTProject\\audit_design_modal_before.png', Buffer.from(modalScreenshot.data, 'base64'));
  console.log('[DesignAudit] Saved audit_design_modal_before.png');

  // Close modal
  await evalExpr(`(() => {
    const close = document.querySelector('#veritas-close-modal');
    if (close) close.click();
  })()`);
  await new Promise(r => setTimeout(r, 500));

  const heroScreenshot = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync('c:\\TTProject\\audit_design_hero_before.png', Buffer.from(heroScreenshot.data, 'base64'));
  console.log('[DesignAudit] Saved audit_design_hero_before.png');

  ws.close();
  chrome.kill();
  console.log('[DesignAudit] Complete!');
}

runAudit().catch(err => {
  console.error('[DesignAudit] Error:', err);
  chrome.kill();
  process.exit(1);
});

