const { spawn } = require('child_process');
const fs = require('fs');
const port = 9740;

const chrome = spawn('C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', [
  '--headless=new',
  '--window-size=1440,900',
  '--remote-debugging-port=' + port,
  'http://localhost:5173/?skiploader'
]);

async function verifyAndCapture() {
  console.log('[HEADLESS_CDP] Launching Chrome on port ' + port + ' to inspect Forensic Pillars section...');
  await new Promise(r => setTimeout(r, 2500));

  const res = await fetch('http://localhost:' + port + '/json');
  const tabs = await res.json();
  const target = tabs.find(t => t.url.includes('5173'));
  if (!target) throw new Error('Target tab not found');

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

  // Wait for ASScroll and DOM to initialize
  await new Promise(r => setTimeout(r, 3000));

  // Check section heading and slides
  const check = await send('Runtime.evaluate', {
    expression: `(() => {
      const heading = document.querySelector('.js-team-head h2')?.textContent;
      const slides = Array.from(document.querySelectorAll('.team-card')).map(s => s.getAttribute('slide-id'));
      const activeRole = document.querySelector('.js-role')?.textContent;
      const activeName = document.querySelector('.js-name')?.textContent;
      const sliderExists = !!document.querySelector('.team-slider');
      return {
        heading,
        totalSlides: slides.length,
        sampleSlideIds: slides.slice(0, 3),
        activeRole,
        activeName,
        sliderExists
      };
    })()`,
    returnByValue: true
  });
  console.log('[HEADLESS_CDP] Verification Data:', JSON.stringify(check.result.value, null, 2));

  // Scroll into the Forensic Pillars section
  await send('Runtime.evaluate', {
    expression: `(() => {
      const el = document.querySelector('.section.team');
      if (el) el.scrollIntoView({ behavior: 'instant' });
    })()`
  });
  await new Promise(r => setTimeout(r, 1200));

  // Capture screenshot
  const shot = await send('Page.captureScreenshot', {
    format: 'png',
    clip: {
      x: 0,
      y: 0,
      width: 1440,
      height: 900,
      scale: 1
    }
  });

  const artifactDir = 'C:\\Users\\Rohith\\.gemini\\antigravity\\brain\\684f40a3-33b5-48e7-b4ec-de8d5ded58e7';
  const outPath = artifactDir + '\\forensic_pillars_view.png';
  fs.writeFileSync(outPath, Buffer.from(shot.data, 'base64'));
  console.log('[HEADLESS_CDP] Screenshot saved to:', outPath);

  chrome.kill();
  const passed = check.result.value.heading === 'Forensic Pillars' && check.result.value.totalSlides === 18;
  process.exit(passed ? 0 : 1);
}

verifyAndCapture().catch(err => {
  console.error('[HEADLESS_CDP] Error:', err);
  chrome.kill();
  process.exit(1);
});

