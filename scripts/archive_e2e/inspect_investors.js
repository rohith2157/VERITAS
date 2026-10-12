const { spawn } = require('child_process');
const port = 9698;
const chrome = spawn('C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', [
  '--headless=new',
  '--window-size=1440,900',
  '--remote-debugging-port=' + port,
  'http://localhost:5173/?skiploader'
]);

async function inspectInvestors() {
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
      const ass = window.u?.ASS;
      const inv = document.querySelector('.investors');
      if (ass && inv) {
        ass.scrollTo(inv.offsetTop, false);
      }
      const items = Array.from(document.querySelectorAll('.investors__item')).map(item => {
        const r = item.getBoundingClientRect();
        const text = item.innerText;
        const icon = item.querySelector('.investor__icon');
        const img = item.querySelector('img');
        const style = window.getComputedStyle(item);
        return {
          text,
          rect: { top: r.top, left: r.left, width: r.width, height: r.height },
          display: style.display,
          visibility: style.visibility,
          opacity: style.opacity,
          hasImg: !!img,
          imgSrc: img ? img.src : null,
          imgDisplay: img ? window.getComputedStyle(img).display : null,
          iconDisplay: icon ? window.getComputedStyle(icon).display : null,
        };
      });
      return items;
    })()
  `;
  await new Promise(r => setTimeout(r, 1500));
  const result = await send('Runtime.evaluate', { expression: code, returnByValue: true });
  console.log('Investors inspection:', JSON.stringify(result.result.value, null, 2));
  chrome.kill();
  process.exit(0);
}
inspectInvestors().catch(e => { console.error(e); chrome.kill(); process.exit(1); });

