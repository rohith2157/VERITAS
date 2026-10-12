const { spawn } = require('child_process');
const port = 9744;
const chrome = spawn('C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', [
  '--headless=new',
  '--remote-debugging-port=' + port,
  'http://localhost:5173/'
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
      const id = 10;
      ws.addEventListener('message', function h(e) {
        const d = JSON.parse(e.data);
        if (d.id === id) { ws.removeEventListener('message', h); resolve(d.result); }
      });
      ws.send(JSON.stringify({ id, method, params }));
    });
  }

  const sections = await send('Runtime.evaluate', {
    expression: `(() => {
      return Array.from(document.querySelectorAll('.section, .js-section')).map(s => ({
        sectionName: s.getAttribute('section-name'),
        className: s.className,
        rect: s.getBoundingClientRect(),
        display: window.getComputedStyle(s).display,
        position: window.getComputedStyle(s).position
      }));
    })()`,
    returnByValue: true
  });
  console.log(sections.result.value);
  chrome.kill();
}
check();
