const { spawn } = require('child_process');
const port = 9696;
const chrome = spawn('C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', [
  '--headless=new',
  '--window-size=1440,900',
  '--remote-debugging-port=' + port,
  'http://localhost:5173/?skiploader'
]);

async function inspect() {
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
  const code = `
    (() => {
      const landing = document.querySelector('.landing');
      const title = document.querySelector('.landing__title');
      const body = document.querySelector('.landing__body');
      const btn = body ? body.querySelector('.btn') : null;
      const getRect = (el) => {
        if (!el) return null;
        const r = el.getBoundingClientRect();
        return { top: r.top, left: r.left, width: r.width, height: r.height, bottom: r.bottom, right: r.right };
      };
      return {
        landing: getRect(landing),
        title: getRect(title),
        body: getRect(body),
        btn: getRect(btn),
        titleFontSize: title ? window.getComputedStyle(title).fontSize : null,
        titleLineHeight: title ? window.getComputedStyle(title).lineHeight : null,
      };
    })()
  `;
  const result = await send('Runtime.evaluate', { expression: code, returnByValue: true });
  console.log('Layout evaluation:', JSON.stringify(result.result.value, null, 2));
  chrome.kill();
  process.exit(0);
}
inspect().catch(e => { console.error(e); chrome.kill(); process.exit(1); });
