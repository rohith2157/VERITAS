const { spawn } = require('child_process');
const fs = require('fs');

const port = 9710;
const chrome = spawn('C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', [
  '--headless=new',
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

  const inspectExpr = `
    (() => {
      const bar = document.querySelector('.asscrollbar');
      const handle = document.querySelector('.asscrollbar__handle');
      const ass = window.u?.ASS;
      return {
        barExists: !!bar,
        barClass: bar?.className,
        barComputed: bar ? {
          display: window.getComputedStyle(bar).display,
          position: window.getComputedStyle(bar).position,
          right: window.getComputedStyle(bar).right,
          zIndex: window.getComputedStyle(bar).zIndex,
          width: window.getComputedStyle(bar).width,
          height: window.getComputedStyle(bar).height
        } : null,
        handleExists: !!handle,
        handleComputed: handle ? {
          visibility: window.getComputedStyle(handle).visibility,
          height: window.getComputedStyle(handle).height,
          inlineHeight: handle.style.height,
          inlineTransform: handle.style.transform
        } : null,
        assExists: !!ass,
        assProps: ass ? {
          currentPos: ass.currentPos,
          targetPos: ass.targetPos,
          maxScroll: ass.maxScroll,
          customScrollbar: ass.customScrollbar,
          options: ass.options
        } : null,
        bodyHeight: document.body.style.height
      };
    })()
  `;

  const info = await send('Runtime.evaluate', { expression: inspectExpr, returnByValue: true });
  console.log('LIVE SCROLLBAR STATE ON LOCALHOST:');
  console.log(JSON.stringify(info.result.value, null, 2));

  // Now simulate scroll down 500px
  const scrollExpr = `
    (() => {
      const ass = window.u?.ASS;
      if (ass) {
        ass.scrollTo(509.6, false);
      }
    })()
  `;
  await send('Runtime.evaluate', { expression: scrollExpr });
  await new Promise(r => setTimeout(r, 1000));

  const infoAfterScroll = await send('Runtime.evaluate', { expression: inspectExpr, returnByValue: true });
  console.log('\nAFTER SCROLLING TO 509.6px:');
  console.log(JSON.stringify(infoAfterScroll.result.value, null, 2));

  chrome.kill();
  process.exit(0);
}

run().catch(e => {
  console.error(e);
  chrome.kill();
  process.exit(1);
});

