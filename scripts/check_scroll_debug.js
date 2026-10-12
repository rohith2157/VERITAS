const { spawn } = require('child_process');
const port = 9726;
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
      const id = 100;
      ws.addEventListener('message', function h(e) {
        const d = JSON.parse(e.data);
        if (d.id === id) { ws.removeEventListener('message', h); resolve(d.result); }
      });
      ws.send(JSON.stringify({ id, method, params }));
    });
  }

  const evalRes = await send('Runtime.evaluate', {
    expression: `(() => {
      window.scrollTo(0, 500);
      return {
        windowScrollY: window.scrollY,
        docScrollTop: document.documentElement.scrollTop,
        bodyScrollTop: document.body.scrollTop,
        docHeight: document.documentElement.scrollHeight,
        docClientHeight: document.documentElement.clientHeight,
        bodyHeight: document.body.scrollHeight,
        bodyStyleHeight: document.body.style.height,
        docStyleOverflow: window.getComputedStyle(document.documentElement).overflow,
        bodyStyleOverflow: window.getComputedStyle(document.body).overflow,
        asscrollContainer: document.querySelector('[asscroll-container]') ? {
          scrollTop: document.querySelector('[asscroll-container]').scrollTop,
          scrollHeight: document.querySelector('[asscroll-container]').scrollHeight,
          overflow: window.getComputedStyle(document.querySelector('[asscroll-container]')).overflow
        } : null
      };
    })()`,
    returnByValue: true
  });
  console.log(evalRes.result.value);
  chrome.kill();
}
check();
