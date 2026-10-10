const { spawn } = require('child_process');
const fs = require('fs');

const PORT = 9743;
const chrome = spawn('C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', [
  '--headless=new',
  '--window-size=1440,900',
  '--remote-debugging-port=' + PORT,
  '--disable-extensions',
  '--no-first-run',
  '--no-default-browser-check',
  'http://localhost:5173/?skiploader'
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

  await new Promise(r => setTimeout(r, 1000));

  // Find and click the "Dashboard" link or "Launch Portal" button in index.html
  console.log('Clicking a[href="#dashboard"]...');
  const clickResult = await send('Runtime.evaluate', {
    expression: `(() => {
      const link = document.querySelector('a[href="#dashboard"]');
      if (link) {
        link.click();
        return { clicked: true, href: link.href };
      }
      return { clicked: false };
    })()`,
    returnByValue: true
  });
  console.log('Click result:', clickResult.result.value);

  // Wait for React to render portal view
  await new Promise(r => setTimeout(r, 1000));

  const portalState = await send('Runtime.evaluate', {
    expression: `(() => {
      const portalHeader = document.querySelector('header span');
      const backBtn = document.getElementById('veritas-back-to-manifesto');
      const h1 = document.querySelector('h1');
      const main = document.querySelector('main');
      return {
        hash: window.location.hash,
        portalTitle: portalHeader ? portalHeader.textContent : null,
        backBtnExists: !!backBtn,
        h1Text: h1 ? h1.textContent : null,
        mainSnippet: main ? main.innerText.substring(0, 200) : null
      };
    })()`,
    returnByValue: true
  });
  console.log('Portal state after clicking Launch Portal:', portalState.result.value);

  const shot = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync('c:\\TTProject\\frontend\\audit_agent3\\portal_dashboard_opened.png', Buffer.from(shot.data, 'base64'));

  chrome.kill();
  process.exit(0);
}

run().catch(e => {
  console.error(e);
  chrome.kill();
  process.exit(1);
});
