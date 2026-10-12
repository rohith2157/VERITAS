const { spawn } = require('child_process');
const fs = require('fs');
const os = require('os');
const path = require('path');

const PORT = 9746;
const tempUserDataDir = fs.mkdtempSync(path.join(os.tmpdir(), 'chrome-diag-'));

const chrome = spawn('C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', [
  '--headless=new',
  '--window-size=1440,900',
  '--remote-debugging-port=' + PORT,
  '--disable-extensions',
  '--no-first-run',
  '--no-default-browser-check',
  '--user-data-dir=' + tempUserDataDir,
  'http://localhost:5173/?skiploader#dashboard'
]);

async function check() {
  await new Promise(r => setTimeout(r, 2000));
  const res = await fetch(`http://localhost:${PORT}/json`);
  const tabs = await res.json();
  const target = tabs.find(t => t.type === 'page' && t.url.includes('5173'));
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
          resolve(data.result || {});
        }
      };
      ws.addEventListener('message', handler);
      ws.send(JSON.stringify({ id, method, params }));
    });
  }

  await send('Runtime.enable');

  for (let i = 0; i < 5; i++) {
    const state = await send('Runtime.evaluate', {
      expression: `(() => ({
        time: ${i * 500},
        url: window.location.href,
        hash: window.location.hash,
        portalHeader: !!document.querySelector('.portal-header'),
        activeTabBtn: document.querySelector('.portal-tab-btn')?.textContent,
        mainText: document.querySelector('main')?.innerText?.substring(0, 50)
      }))()`,
      returnByValue: true
    });
    console.log(`t=${i * 500}ms:`, state.result.value);
    await new Promise(r => setTimeout(r, 500));
  }

  chrome.kill();
  process.exit(0);
}

check().catch(e => {
  console.error(e);
  chrome.kill();
  process.exit(1);
});
