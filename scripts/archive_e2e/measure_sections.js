const { spawn } = require('child_process');

const port = 9713;
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
  await new Promise(r => setTimeout(r, 1500));

  const measureExpr = `
    (() => {
      const sections = Array.from(document.querySelectorAll('.section, [section-name]'));
      const details = sections.map(s => ({
        class: s.className,
        sectionName: s.getAttribute('section-name'),
        offsetHeight: s.offsetHeight,
        offsetTop: s.offsetTop
      }));
      return {
        sections: details,
        mainHeight: document.querySelector('main')?.offsetHeight,
        bodyHeight: document.body.style.height,
        maxScroll: window.u?.ASS?.maxScroll
      };
    })()
  `;
  const resMeasure = await send('Runtime.evaluate', { expression: measureExpr, returnByValue: true });
  console.log('SECTION MEASUREMENTS ON LOCALHOST:');
  console.log(JSON.stringify(resMeasure.result.value, null, 2));

  chrome.kill();
  process.exit(0);
}

run().catch(e => {
  console.error(e);
  chrome.kill();
  process.exit(1);
});

