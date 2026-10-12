const { spawn } = require('child_process');
const fs = require('fs');
const port = 9710;
const chrome = spawn('C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', [
  '--headless=new',
  '--window-size=1440,900',
  '--remote-debugging-port=' + port,
  'http://localhost:5173/?skiploader'
]);

async function testBackToExperience() {
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

  await new Promise(r => setTimeout(r, 1000));

  // Open Studio
  await send('Runtime.evaluate', { expression: `document.querySelector('#veritas-request-access').click()` });
  await new Promise(r => setTimeout(r, 1000));

  // Wait for back button and click
  const backRes = await send('Runtime.evaluate', {
    expression: `
      new Promise((resolve) => {
        const interval = setInterval(() => {
          const btn = document.querySelector('#veritas-back-to-manifesto');
          if (btn) {
            clearInterval(interval);
            btn.click();
            resolve('clicked back');
          }
        }, 100);
        setTimeout(() => { clearInterval(interval); resolve('timeout'); }, 3000);
      })
    `,
    awaitPromise: true,
    returnByValue: true
  });
  console.log('Back button:', backRes.result.value);

  await new Promise(r => setTimeout(r, 1500));

  const shot = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync('c:\\TTProject\\frontend\\test_back_to_dala.png', Buffer.from(shot.data, 'base64'));
  console.log('Saved test_back_to_dala.png');

  chrome.kill();
  process.exit(0);
}
testBackToExperience().catch(e => { console.error(e); chrome.kill(); process.exit(1); });
