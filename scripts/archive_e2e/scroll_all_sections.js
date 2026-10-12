const { spawn } = require('child_process');
const fs = require('fs');
const port = 9702;
const chrome = spawn('C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', [
  '--headless=new',
  '--window-size=1440,900',
  '--remote-debugging-port=' + port,
  'http://localhost:5173/?skiploader'
]);

async function scrollTestAll() {
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

  const waitReady = `
    new Promise((resolve) => {
      const check = () => {
        const c = window.u?.WebGL?._cones;
        const w = window.u?.WebGL;
        if (c && c._loaded && w) {
          c.activate({ delay: 0, duration: 0.01 });
          if (w._layer) w._layer.visible = false;
          setTimeout(() => resolve('ready'), 800);
        } else {
          setTimeout(check, 200);
        }
      };
      check();
    })
  `;
  await send('Runtime.evaluate', { expression: waitReady, awaitPromise: true });
  await new Promise(r => setTimeout(r, 1000));

  async function scrollToSelector(selector, filename) {
    const expr = `
      (() => {
        const ass = window.u?.ASS;
        const el = document.querySelector('${selector}');
        if (el && ass) {
          const rect = el.getBoundingClientRect();
          const targetY = rect.top + ass.currentPos;
          ass.scrollTo(targetY, false);
          return { selector: '${selector}', targetY, maxScroll: ass.maxScroll };
        }
        return { notFound: '${selector}' };
      })()
    `;
    const res = await send('Runtime.evaluate', { expression: expr, returnByValue: true });
    console.log('Scroll result:', res.result.value);
    await new Promise(r => setTimeout(r, 1500));
    const shot = await send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync('c:\\TTProject\\frontend\\' + filename, Buffer.from(shot.data, 'base64'));
    console.log('Saved', filename);
  }

  await scrollToSelector('.introduction', 'verified_intro.png');
  await scrollToSelector('.manifesto--introduction-container', 'verified_manifesto_chaos.png');
  await scrollToSelector('.team', 'verified_team.png');
  await scrollToSelector('.investors', 'verified_investors.png');

  chrome.kill();
  process.exit(0);
}

scrollTestAll().catch(e => { console.error(e); chrome.kill(); process.exit(1); });

