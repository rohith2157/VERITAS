const { spawn } = require('child_process');
const os = require('os');
const path = require('path');
const fs = require('fs');

const PORT = 9749;
const temp = fs.mkdtempSync(path.join(os.tmpdir(), 'c-'));
const c = spawn('C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', [
  '--headless=new', '--remote-debugging-port=' + PORT, '--user-data-dir=' + temp,
  'http://localhost:5173/?skiploader#dashboard'
]);

setTimeout(async () => {
  try {
    const res = await fetch('http://localhost:' + PORT + '/json');
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
            resolve(data.result || {});
          }
        };
        ws.addEventListener('message', handler);
        ws.send(JSON.stringify({ id, method, params }));
      });
    }

    await send('Runtime.enable');
    const result = await send('Runtime.evaluate', {
      expression: `(() => ({
        hash: window.location.hash,
        href: window.location.href,
        rootInnerHTML: document.getElementById('root')?.innerHTML
      }))()`,
      returnByValue: true
    });
    console.log('Location and Root:', result.result.value);
  } catch (err) {
    console.error(err);
  } finally {
    c.kill();
    process.exit(0);
  }
}, 3000);
