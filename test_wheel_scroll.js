const { spawn } = require('child_process');
const fs = require('fs');

const port = 9714;
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
  await send('Input.enable');
  await send('Page.enable');

  await new Promise(r => setTimeout(r, 1500));

  // Dispatch mouse wheel event
  console.log('Dispatching wheel event...');
  await send('Input.dispatchMouseEvent', {
    type: 'mouseWheel',
    x: 500,
    y: 500,
    deltaX: 0,
    deltaY: 500
  });

  await new Promise(r => setTimeout(r, 500));

  const checkScrollbar = `
    (() => {
      const bar = document.querySelector('.asscrollbar');
      const handle = document.querySelector('.asscrollbar__handle');
      const ass = window.u?.ASS;
      return {
        currentPos: ass?.currentPos,
        targetPos: ass?.targetPos,
        barClasses: bar?.className,
        handleStyle: handle?.getAttribute('style'),
        handleHeight: handle?.style?.height,
        handleTransform: handle?.style?.transform
      };
    })()
  `;
  const info = await send('Runtime.evaluate', { expression: checkScrollbar, returnByValue: true });
  console.log('SCROLLBAR STATE AFTER WHEEL EVENT:');
  console.log(JSON.stringify(info.result.value, null, 2));

  // Capture screenshot during scroll
  const shot = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync('c:\\TTProject\\verify_scrollbar_wheel.png', Buffer.from(shot.data, 'base64'));
  console.log('[SAVED] verify_scrollbar_wheel.png');

  chrome.kill();
  process.exit(0);
}

run().catch(e => {
  console.error(e);
  chrome.kill();
  process.exit(1);
});

