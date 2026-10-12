const { spawn } = require('child_process');
const port = 9733;
const chrome = spawn('C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', [
  '--headless=new',
  '--remote-debugging-port=' + port,
  'http://localhost:5173/#hub'
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
      const id = 200;
      ws.addEventListener('message', function h(e) {
        const d = JSON.parse(e.data);
        if (d.id === id) { ws.removeEventListener('message', h); resolve(d.result); }
      });
      ws.send(JSON.stringify({ id, method, params }));
    });
  }

  const resVal = await send('Runtime.evaluate', {
    expression: `(() => {
      const shell = document.getElementById('veritas-portal-shell');
      if (!shell) return { shell: false };
      shell.scrollTo({ top: 150, behavior: 'instant' });
      return {
        shell: true,
        scrollTop: shell.scrollTop,
        scrollHeight: shell.scrollHeight,
        clientHeight: shell.clientHeight
      };
    })()`,
    returnByValue: true
  });
  console.log('Instant scroll on #hub:', resVal.result.value);
  chrome.kill();
}
check();
