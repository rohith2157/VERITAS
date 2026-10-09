const { spawn } = require('child_process');
const port = 9706;
const chrome = spawn('C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', [
  '--headless=new',
  '--remote-debugging-port=' + port,
  'http://localhost:5173/?skiploader'
]);

async function checkFontJs() {
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
  const expr = `
    (() => {
      const fonts = Array.from(document.fonts).map(f => ({
        family: f.family,
        weight: f.weight,
        status: f.status,
        check: document.fonts.check(f.weight + ' 16px "' + f.family + '"')
      }));
      return fonts;
    })()
  `;
  const result = await send('Runtime.evaluate', { expression: expr, returnByValue: true });
  console.log('Loaded fonts:', JSON.stringify(result.result.value, null, 2));
  chrome.kill();
  process.exit(0);
}
checkFontJs().catch(e => { console.error(e); chrome.kill(); process.exit(1); });

