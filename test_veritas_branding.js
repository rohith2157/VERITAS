const { spawn } = require('child_process');
const fs = require('fs');

const port = 9714;
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
    return new Promise(resolve => {
      const id = ++msgId;
      const handler = ev => {
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

  const titleRes = await send('Runtime.evaluate', { expression: 'document.title' });
  const logoRes = await send('Runtime.evaluate', { expression: 'document.querySelector(".js-header-logo-text").textContent' });
  const cookieRes = await send('Runtime.evaluate', { expression: 'document.querySelector(".cookie-notice__body").textContent' });

  console.log('Title:', titleRes.result.value);
  console.log('Logo:', logoRes.result.value);
  console.log('Cookie Text:', cookieRes.result.value);

  const shot = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync('veritas_branded_landing.png', Buffer.from(shot.data, 'base64'));
  console.log('Screenshot saved to veritas_branded_landing.png');

  ws.close();
  chrome.kill();
  process.exit(0);
}

run().catch(e => {
  console.error(e);
  chrome.kill();
  process.exit(1);
});

