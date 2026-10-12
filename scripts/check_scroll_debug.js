const { spawn } = require('child_process');
const port = 9720;
const chrome = spawn('C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', [
  '--headless=new',
  '--window-size=1440,900',
  '--remote-debugging-port=' + port,
  'http://localhost:5173/?skiploader#studio'
]);

async function test() {
  await new Promise(r => setTimeout(r, 2500));
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

  // Wait for shell to be mounted and lazy component to resolve
  for (let i = 0; i < 40; i++) {
    const res = await send('Runtime.evaluate', {
      expression: `!!document.getElementById('tab-btn-1to1')`,
      returnByValue: true
    });
    if (res?.result?.value) break;
    await new Promise(r => setTimeout(r, 250));
  }

  const check = await send('Runtime.evaluate', {
    expression: `(() => {
      const shell = document.getElementById('veritas-portal-shell');
      const ass = window.u?.ASS;
      return {
        shellExists: !!shell,
        shellScrollHeight: shell?.scrollHeight,
        shellClientHeight: shell?.clientHeight,
        shellScrollTop: shell?.scrollTop,
        assExists: !!ass,
        assMethods: ass ? Object.getOwnPropertyNames(Object.getPrototypeOf(ass)) : []
      };
    })()`,
    returnByValue: true
  });
  console.log('PORTAL SHELL & ASSCROLL STATUS:');
  console.log(JSON.stringify(check.result.value, null, 2));

  // Now test disabling ASScroll
  await send('Runtime.evaluate', {
    expression: `(() => {
      const ass = window.u?.ASS;
      if (ass && typeof ass.disable === 'function') {
        ass.disable();
        return 'ASScroll disabled successfully';
      }
      return 'No ass or disable method';
    })()`,
    returnByValue: true
  });

  // Reset shell scroll
  await send('Runtime.evaluate', {
    expression: `(() => {
      const shell = document.getElementById('veritas-portal-shell');
      if (shell) shell.scrollTop = 0;
    })()`,
    returnByValue: true
  });

  // Now dispatch mouse wheel event over the shell
  await send('Input.dispatchMouseEvent', {
    type: 'mouseWheel',
    x: 500,
    y: 500,
    deltaX: 0,
    deltaY: 500
  });
  await new Promise(r => setTimeout(r, 600));

  const afterDisableWheel = await send('Runtime.evaluate', {
    expression: `(() => {
      const shell = document.getElementById('veritas-portal-shell');
      const ass = window.u?.ASS;
      return {
        shellScrollTop: shell?.scrollTop,
        assCurrentPos: ass?.currentPos
      };
    })()`,
    returnByValue: true
  });
  console.log('SCROLL RESULTS WITH ASSCROLL DISABLED:');
  console.log(JSON.stringify(afterDisableWheel.result.value, null, 2));

  chrome.kill();
  process.exit(0);
}

test().catch(e => {
  console.error(e);
  chrome.kill();
  process.exit(1);
});
