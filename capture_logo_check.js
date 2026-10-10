const { spawn } = require('child_process');
const fs = require('fs');

const port = 9706;
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

  await new Promise(r => setTimeout(r, 1200));

  const shotHeader = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync('c:\\TTProject\\veritas_header_logo.png', Buffer.from(shotHeader.data, 'base64'));
  console.log('[SAVED] veritas_header_logo.png');

  // Scroll to footer
  const scrollFooter = `
    (() => {
      const ass = window.u?.ASS;
      if (ass) ass.scrollTo(ass.maxScroll, false);
    })()
  `;
  await send('Runtime.evaluate', { expression: scrollFooter });
  await new Promise(r => setTimeout(r, 1000));

  const shotFooter = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync('c:\\TTProject\\veritas_footer_logo.png', Buffer.from(shotFooter.data, 'base64'));
  console.log('[SAVED] veritas_footer_logo.png');

  chrome.kill();
  process.exit(0);
}

run().catch(e => {
  console.error(e);
  chrome.kill();
  process.exit(1);
});

