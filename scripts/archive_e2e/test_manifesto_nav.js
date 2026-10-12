const { spawn } = require('child_process');
const fs = require('fs');
const port = 9708;
const chrome = spawn('C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', [
  '--headless=new',
  '--window-size=1440,900',
  '--remote-debugging-port=' + port,
  'http://localhost:5173/?skiploader'
]);

async function testManifestoNav() {
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

  // Wait ready
  const waitReady = `
    new Promise((resolve) => {
      const check = () => {
        const c = window.u?.WebGL?._cones;
        const w = window.u?.WebGL;
        if (c && c._loaded && w) {
          c.activate({ delay: 0, duration: 0.01 });
          if (w._layer) w._layer.visible = false;
          setTimeout(() => resolve('ready'), 800);
        } else {
          setTimeout(check, 200);
        }
      };
      check();
    })
  `;
  await send('Runtime.evaluate', { expression: waitReady, awaitPromise: true });
  await new Promise(r => setTimeout(r, 1000));

  // Click Manifesto nav link
  const clickManifesto = `
    (() => {
      const link = document.querySelector('.header .js-nav-link[anchor-link="manifesto"]');
      if (link) {
        link.click();
        return 'clicked manifesto link';
      }
      return 'link not found';
    })()
  `;
  const clickRes = await send('Runtime.evaluate', { expression: clickManifesto, returnByValue: true });
  console.log('Manifesto link:', clickRes.result.value);

  // Wait 3.5s for nav mask transition to finish
  await new Promise(r => setTimeout(r, 3500));

  const shot = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync('c:\\TTProject\\frontend\\test_manifesto_nav.png', Buffer.from(shot.data, 'base64'));
  console.log('Saved test_manifesto_nav.png');

  chrome.kill();
  process.exit(0);
}
testManifestoNav().catch(e => { console.error(e); chrome.kill(); process.exit(1); });

