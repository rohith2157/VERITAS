const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const PORT = 9742;
const chrome = spawn('C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', [
  '--headless=new',
  '--window-size=1440,900',
  '--remote-debugging-port=' + PORT,
  '--disable-extensions',
  '--no-first-run',
  '--no-default-browser-check',
  'http://localhost:5173/?skiploader#dashboard'
]);

async function run() {
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
  await send('Page.enable');
  await send('DOM.enable');

  // Wait for initial render of portal
  await new Promise(r => setTimeout(r, 1500));

  const checkInitial = await send('Runtime.evaluate', {
    expression: `(() => {
      const portal = document.querySelector('header');
      const main = document.querySelector('main');
      return {
        hash: window.location.hash,
        headerExists: !!portal,
        headerHtml: portal ? portal.outerHTML.substring(0, 150) : null,
        mainExists: !!main,
        mainText: main ? main.innerText.substring(0, 200) : null
      };
    })()`,
    returnByValue: true
  });

  console.log('Initial Portal Status (?skiploader#dashboard):', checkInitial.result.value);

  // Capture screenshot of initial dashboard at 1440px
  const shot = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync('c:\\TTProject\\frontend\\audit_agent3\\initial_dashboard_1440px.png', Buffer.from(shot.data, 'base64'));

  chrome.kill();
  process.exit(0);
}

run().catch(e => {
  console.error(e);
  chrome.kill();
  process.exit(1);
});
