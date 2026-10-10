const { spawn } = require('child_process');
const fs = require('fs');

const port = 9715;
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

  const waitReady = `
    new Promise((resolve) => {
      const check = () => {
        const ass = window.u?.ASS;
        const c = window.u?.WebGL?._cones;
        if (ass && c && c._loaded) {
          c.activate({ delay: 0, duration: 0.01 });
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

  async function captureAt(y, filename) {
    const expr = `
      (() => {
        const ass = window.u?.ASS;
        if (ass) {
          ass.scrollTo(${y}, false);
          return { currentPos: ass.currentPos, maxScroll: ass.maxScroll };
        }
        return null;
      })()
    `;
    const res = await send('Runtime.evaluate', { expression: expr, returnByValue: true });
    console.log('Scrolled to ' + y + ':', res.result.value);
    await new Promise(r => setTimeout(r, 1200));

    // Force scrollbar transform update to match scroll position
    const updateBarExpr = `
      (() => {
        const ass = window.u?.ASS;
        if (ass?.scrollbar) {
          ass.scrollbar.show();
          ass.scrollbar.transform();
        }
      })()
    `;
    await send('Runtime.evaluate', { expression: updateBarExpr });
    await new Promise(r => setTimeout(r, 200));

    const shot = await send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync('c:\\TTProject\\' + filename, Buffer.from(shot.data, 'base64'));
    console.log('[SAVED] ' + filename);
  }

  await captureAt(804, 'asscroll_step_intro.png');
  await captureAt(2010, 'asscroll_step_chaos.png');
  await captureAt(4824, 'asscroll_step_bulb.png');
  await captureAt(8796, 'asscroll_step_footer.png');

  chrome.kill();
  process.exit(0);
}

run().catch(e => {
  console.error(e);
  chrome.kill();
  process.exit(1);
});

