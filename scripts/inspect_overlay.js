const { spawn } = require('child_process');
const port = 9729;
const chrome = spawn('C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', [
  '--headless=new',
  '--remote-debugging-port=' + port,
  'http://localhost:5173/?skiploader'
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
      const id = 100 + Math.floor(Math.random() * 10000);
      ws.addEventListener('message', function h(e) {
        const d = JSON.parse(e.data);
        if (d.id === id) { ws.removeEventListener('message', h); resolve(d.result); }
      });
      ws.send(JSON.stringify({ id, method, params }));
    });
  }

  const inspected = await send('Runtime.evaluate', {
    expression: `(() => {
      const el = document.elementFromPoint(500, 400);
      const siteLoader = document.querySelector('.site-loader');
      const siteLoaderStyle = siteLoader ? {
        display: window.getComputedStyle(siteLoader).display,
        visibility: window.getComputedStyle(siteLoader).visibility,
        opacity: window.getComputedStyle(siteLoader).opacity,
        pointerEvents: window.getComputedStyle(siteLoader).pointerEvents,
        zIndex: window.getComputedStyle(siteLoader).zIndex
      } : null;

      const mask = document.querySelector('.nav-transition-mask');
      const maskStyle = mask ? {
        display: window.getComputedStyle(mask).display,
        visibility: window.getComputedStyle(mask).visibility,
        opacity: window.getComputedStyle(mask).opacity,
        pointerEvents: window.getComputedStyle(mask).pointerEvents
      } : null;

      return {
        elementPointTag: el ? el.tagName + '.' + el.className : 'null',
        siteLoaderStyle,
        maskStyle,
        bodyHeight: document.body.offsetHeight,
        windowHeight: window.innerHeight,
        htmlHeight: document.documentElement.offsetHeight
      };
    })()`,
    returnByValue: true
  });

  console.log('Inspected point:', inspected.result.value);
  chrome.kill();
}
check();
