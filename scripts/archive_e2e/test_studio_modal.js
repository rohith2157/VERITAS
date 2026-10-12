const { spawn } = require('child_process');
const fs = require('fs');
const port = 9709;
const chrome = spawn('C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', [
  '--headless=new',
  '--window-size=1440,900',
  '--remote-debugging-port=' + port,
  'http://localhost:5173/?skiploader'
]);

async function testRequestAccess() {
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

  // Click Request Access button in header
  const clickCTA = `
    (() => {
      const btn = document.querySelector('#veritas-request-access') || document.querySelector('.landing .btn');
      if (btn) {
        btn.click();
        return 'clicked CTA';
      }
      return 'btn not found';
    })()
  `;
  const clickRes = await send('Runtime.evaluate', { expression: clickCTA, returnByValue: true });
  console.log('CTA click:', clickRes.result.value);

  await new Promise(r => setTimeout(r, 1200));

  const shot = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync('c:\\TTProject\\frontend\\test_studio_modal.png', Buffer.from(shot.data, 'base64'));
  console.log('Saved test_studio_modal.png');

  chrome.kill();
  process.exit(0);
}
testRequestAccess().catch(e => { console.error(e); chrome.kill(); process.exit(1); });

