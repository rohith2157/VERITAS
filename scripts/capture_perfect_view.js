const fs = require('fs');
const { spawn } = require('child_process');

const port = 9748;
const chrome = spawn('C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', [
  '--headless=new',
  '--window-size=1440,900',
  '--remote-debugging-port=' + port,
  'http://localhost:5173/?skiploader'
]);

async function run() {
  await new Promise(r => setTimeout(r, 2500));
  const tabs = await (await fetch('http://localhost:' + port + '/json')).json();
  const target = tabs.find(t => t.url.includes('5173'));
  const ws = new WebSocket(target.webSocketDebuggerUrl);
  await new Promise(r => ws.addEventListener('open', r));

  let id = 1;
  function send(m, p = {}) {
    return new Promise(res => {
      const i = ++id;
      const h = ev => {
        const d = JSON.parse(ev.data);
        if (d.id === i) {
          ws.removeEventListener('message', h);
          res(d.result);
        }
      };
      ws.addEventListener('message', h);
      ws.send(JSON.stringify({ id: i, method: m, params: p }));
    });
  }

  await send('Runtime.enable');
  await send('Page.enable');
  await new Promise(r => setTimeout(r, 3000));

  const pos = await send('Runtime.evaluate', {
    expression: `(() => {
      const el = document.querySelector('.js-team-section') || document.querySelector('.team');
      if (!el) return null;
      const rect = el.getBoundingClientRect();
      const current = window.u?.ASS?.currentPos || 0;
      return rect.top + current;
    })()`,
    returnByValue: true
  });

  console.log('Target section absolute top:', pos.result.value);

  if (pos.result.value) {
    await send('Runtime.evaluate', {
      expression: `window.u?.ASS?.scrollTo(${pos.result.value})`
    });
    // Wait for ASScroll lerp to complete smoothly
    await new Promise(r => setTimeout(r, 3500));
  }

  const shot = await send('Page.captureScreenshot', { format: 'png' });
  const outPath = 'C:\\Users\\Rohith\\.gemini\\antigravity\\brain\\684f40a3-33b5-48e7-b4ec-de8d5ded58e7\\forensic_pillars_perfect.png';
  fs.writeFileSync(outPath, Buffer.from(shot.data, 'base64'));
  console.log('Captured perfect screenshot at:', outPath);

  chrome.kill();
  process.exit(0);
}

run().catch(e => {
  console.error(e);
  chrome.kill();
  process.exit(1);
});
