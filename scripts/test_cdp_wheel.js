const { spawn } = require('child_process');
const port = 9728;
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

  // Dispatch real CDP mouse wheel event
  console.log('Sending mouseWheel event via CDP...');
  await send('Input.dispatchMouseEvent', {
    type: 'mouseWheel',
    x: 500,
    y: 400,
    deltaX: 0,
    deltaY: 500
  });

  await new Promise(r => setTimeout(r, 600));

  const scrollResult = await send('Runtime.evaluate', {
    expression: `({
      windowScrollY: window.scrollY,
      scrollTopDoc: document.documentElement.scrollTop,
      bodyScrollTop: document.body.scrollTop
    })`,
    returnByValue: true
  });

  console.log('Real hardware/CDP wheel scroll result:', scrollResult.result.value);
  chrome.kill();
}
check();
