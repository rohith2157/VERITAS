const { spawn } = require('child_process');

const port = 9711;
const chrome = spawn('C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', [
  '--headless=new',
  '--remote-debugging-port=' + port,
  'http://localhost:5173/'
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

  const logs = [];
  ws.addEventListener('message', ev => {
    const data = JSON.parse(ev.data);
    if (data.method === 'Console.messageAdded' || data.method === 'Runtime.consoleAPICalled') {
      logs.push(data.params);
    }
    if (data.method === 'Runtime.exceptionThrown') {
      console.error('EXCEPTION THROWN:', data.params.exceptionDetails);
    }
  });

  await send('Runtime.enable');
  await send('Console.enable');

  await new Promise(r => setTimeout(r, 3000));

  const checkState = `
    (() => {
      return {
        uExists: !!window.u,
        assExists: !!window.u?.ASS,
        assScrollPos: window.u?.ASS?.currentPos,
        webglLoaded: window.u?.WebGL?._cones?._loaded,
        cookieNotice: document.querySelector('.js-cookie-notice')?.className,
        scrollbar: document.querySelector('.asscrollbar')?.outerHTML
      };
    })()
  `;
  const state = await send('Runtime.evaluate', { expression: checkState, returnByValue: true });
  console.log('PAGE STATE AT http://localhost:5173/ :');
  console.log(JSON.stringify(state.result.value, null, 2));

  console.log('\nTOTAL CONSOLE LOGS CAPTURED:', logs.length);
  logs.forEach(l => console.log(l));

  chrome.kill();
  process.exit(0);
}

run().catch(e => {
  console.error(e);
  chrome.kill();
  process.exit(1);
});

