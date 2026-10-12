const { spawn } = require('child_process');
const fs = require('fs');

const port = 9708;
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

  await new Promise(r => setTimeout(r, 1500));

  // Inspect header before scroll
  const beforeExpr = `
    (() => {
      const h = document.querySelector('.header');
      const inner = document.querySelector('.header__inner');
      const nav = document.querySelector('.nav');
      const logo = document.querySelector('.header__logo');
      const cta = document.querySelector('.header__cta');
      const hStyles = h ? window.getComputedStyle(h) : {};
      const innerStyles = inner ? window.getComputedStyle(inner) : {};
      return {
        rect: h?.getBoundingClientRect(),
        display: hStyles.display,
        visibility: hStyles.visibility,
        opacity: hStyles.opacity,
        zIndex: hStyles.zIndex,
        position: hStyles.position,
        innerTransform: innerStyles.transform,
        innerOpacity: innerStyles.opacity,
        navDisplay: nav ? window.getComputedStyle(nav).display : null,
        ctaDisplay: cta ? window.getComputedStyle(cta).display : null
      };
    })()
  `;
  const before = await send('Runtime.evaluate', { expression: beforeExpr, returnByValue: true });
  console.log('BEFORE SCROLL:', before.result.value);

  // Now scroll to 800px (Introduction)
  const scrollExpr = `
    (() => {
      const ass = window.u?.ASS;
      if (ass) ass.scrollTo(800, false);
      return { scrolled: true, currentPos: ass?.currentPos };
    })()
  `;
  await send('Runtime.evaluate', { expression: scrollExpr });
  await new Promise(r => setTimeout(r, 1000));

  const after = await send('Runtime.evaluate', { expression: beforeExpr, returnByValue: true });
  console.log('AFTER SCROLL:', after.result.value);

  const shot = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync('c:\\TTProject\\test_header_at_800.png', Buffer.from(shot.data, 'base64'));
  console.log('Saved test_header_at_800.png');

  chrome.kill();
  process.exit(0);
}

run().catch(e => {
  console.error(e);
  chrome.kill();
  process.exit(1);
});

