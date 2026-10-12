const { spawn } = require('child_process');
const port = 9741;
const chrome = spawn('C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', [
  '--headless=new',
  '--window-size=1440,900',
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

  const resVal = await send('Runtime.evaluate', {
    expression: `(() => {
      const landingTitle = document.querySelector('.landing__title');
      const teamHead = document.querySelector('.js-team-head h2');
      const teamCard = document.querySelector('.veritas-ars-card');
      return {
        landingTitle: landingTitle ? {
          opacity: window.getComputedStyle(landingTitle).opacity,
          visibility: window.getComputedStyle(landingTitle).visibility,
          transform: window.getComputedStyle(landingTitle).transform,
          rect: landingTitle.getBoundingClientRect()
        } : null,
        teamHead: teamHead ? {
          opacity: window.getComputedStyle(teamHead).opacity,
          visibility: window.getComputedStyle(teamHead).visibility,
          rect: teamHead.getBoundingClientRect()
        } : null,
        teamCard: teamCard ? {
          rect: teamCard.getBoundingClientRect(),
          display: window.getComputedStyle(teamCard).display
        } : null
      };
    })()`,
    returnByValue: true
  });

  console.log('Visibility check:', resVal.result.value);
  chrome.kill();
}
check();
