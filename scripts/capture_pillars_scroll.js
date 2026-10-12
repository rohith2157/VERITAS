const { spawn } = require('child_process');
const fs = require('fs');
const port = 9742;

const chrome = spawn('C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', [
  '--headless=new',
  '--window-size=1440,900',
  '--remote-debugging-port=' + port,
  'http://localhost:5173/?skiploader'
]);

async function capture() {
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
  await send('Page.enable');
  await new Promise(r => setTimeout(r, 3000));

  // Click the TEAM nav link which triggers ASScroll to scroll down to this section
  await send('Runtime.evaluate', {
    expression: `(() => {
      const btn = Array.from(document.querySelectorAll('button')).find(b => b.getAttribute('anchor-link') === 'team' || b.textContent.trim() === 'TEAM');
      if (btn) btn.click();
      else if (window.u?.ASS) {
        const sec = document.querySelector('.section.team');
        if (sec) window.u.ASS.scrollTo(sec.offsetTop);
      }
    })()`
  });

  // Wait for ASScroll smooth ease to complete
  await new Promise(r => setTimeout(r, 2500));

  const shot = await send('Page.captureScreenshot', {
    format: 'png',
    clip: { x: 0, y: 0, width: 1440, height: 900, scale: 1 }
  });

  const artifactDir = 'C:\\Users\\Rohith\\.gemini\\antigravity\\brain\\684f40a3-33b5-48e7-b4ec-de8d5ded58e7';
  const outPath = artifactDir + '\\forensic_pillars_section.png';
  fs.writeFileSync(outPath, Buffer.from(shot.data, 'base64'));
  console.log('Saved to:', outPath);

  chrome.kill();
  process.exit(0);
}

capture().catch(e => {
  console.error(e);
  chrome.kill();
  process.exit(1);
});

