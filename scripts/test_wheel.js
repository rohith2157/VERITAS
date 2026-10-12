const { spawn } = require('child_process');
const port = 9727;
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

  // Check what listeners are on window for scroll or wheel
  const listeners = await send('Runtime.evaluate', {
    expression: `(() => {
      // Try dispatching a real WheelEvent
      const ev = new WheelEvent('wheel', { deltaY: 300, bubbles: true, cancelable: true });
      const cancelled = !window.dispatchEvent(ev);
      
      // Let's check window.scrollY immediately and after 200ms
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve({
            cancelled,
            scrollY: window.scrollY,
            scrollTopDoc: document.documentElement.scrollTop,
            u_ASS_exists: !!(window.u && window.u.ASS),
            asscrollTransform: document.querySelector('[asscroll]') ? document.querySelector('[asscroll]').style.transform : 'none'
          });
        }, 200);
      });
    })()`,
    awaitPromise: true,
    returnByValue: true
  });
  console.log('Wheel test:', listeners.result.value);

  chrome.kill();
}
check();
