const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const port = 9747;
const chrome = spawn('C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', [
  '--headless=new',
  '--window-size=1440,900',
  '--remote-debugging-port=' + port,
  'http://localhost:5173/'
]);

async function check() {
  await new Promise(r => setTimeout(r, 2000));
  const res = await fetch('http://localhost:' + port + '/json');
  const tabs = await res.json();
  const target = tabs.find(t => t.url.includes('5173'));
  const ws = new WebSocket(target.webSocketDebuggerUrl);
  await new Promise(r => ws.addEventListener('open', r));

  function send(method, params = {}) {
    return new Promise((resolve) => {
      const id = 10;
      ws.addEventListener('message', function h(e) {
        const d = JSON.parse(e.data);
        if (d.id === id) { ws.removeEventListener('message', h); resolve(d.result); }
      });
      ws.send(JSON.stringify({ id, method, params }));
    });
  }

  // Scroll directly to .js-team-section
  const scrollInfo = await send('Runtime.evaluate', {
    expression: `(() => {
      const el = document.querySelector('.js-team-section');
      el.scrollIntoView({ behavior: 'instant', block: 'start' });
      const r = el.getBoundingClientRect();
      return {
        top: r.top,
        scrollY: window.scrollY,
        height: r.height,
        width: r.width,
        tag: el.tagName
      };
    })()`,
    returnByValue: true
  });
  console.log('Scroll info for real js-team-section:', scrollInfo.result.value);

  await new Promise(r => setTimeout(r, 800));

  const screenshot = await send('Page.captureScreenshot', { format: 'png' });
  const shotPath = path.join(__dirname, 'ars_section_view.png');
  fs.writeFileSync(shotPath, Buffer.from(screenshot.data, 'base64'));
  console.log('Saved screenshot to:', shotPath);

  chrome.kill();
}
check();
