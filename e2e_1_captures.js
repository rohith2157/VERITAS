const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const outDir = 'c:\\TTProject\\frontend\\e2e_artifacts';
if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

const port = 9730;
const chrome = spawn('C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', [
  '--headless=new',
  '--window-size=1440,900',
  '--remote-debugging-port=' + port,
  'http://localhost:5173/?skiploader'
]);

async function runCaptures() {
  console.log('[Captures] Launching Headless Chrome on port', port);
  await new Promise(r => setTimeout(r, 2000));
  
  const res = await fetch('http://localhost:' + port + '/json');
  const tabs = await res.json();
  const target = tabs.find(t => t.url.includes('5173'));
  if (!target) throw new Error('Target tab not found');
  
  const ws = new WebSocket(target.webSocketDebuggerUrl);
  await new Promise(r => ws.addEventListener('open', r));

  let msgId = 1;
  const pending = new Map();
  ws.addEventListener('message', (ev) => {
    const data = JSON.parse(ev.data);
    if (data.id && pending.has(data.id)) {
      const resolve = pending.get(data.id);
      pending.delete(data.id);
      resolve(data.result);
    }
  });

  function send(method, params = {}) {
    return new Promise((resolve) => {
      const id = ++msgId;
      pending.set(id, resolve);
      ws.send(JSON.stringify({ id, method, params }));
    });
  }

  await send('Runtime.enable');
  await send('Page.enable');
  await send('DOM.enable');

  // Wait for WebGL & ASS smooth scroll to initialize
  console.log('[Captures] Waiting for WebGL and 3D particle systems to initialize...');
  const waitReady = `
    new Promise((resolve) => {
      let attempts = 0;
      const check = () => {
        attempts++;
        const c = window.u?.WebGL?._cones;
        const w = window.u?.WebGL;
        if (c && c._loaded && w) {
          c.activate({ delay: 0, duration: 0.01 });
          if (w._layer) w._layer.visible = false;
          setTimeout(() => resolve('ready'), 800);
        } else if (attempts > 60) {
          resolve('ready_fallback');
        } else {
          setTimeout(check, 100);
        }
      };
      check();
    })
  `;
  await send('Runtime.evaluate', { expression: waitReady, awaitPromise: true });
  await new Promise(r => setTimeout(r, 1200));

  async function takeScreenshot(filename) {
    const shot = await send('Page.captureScreenshot', { format: 'png' });
    const fullPath = path.join(outDir, filename);
    fs.writeFileSync(fullPath, Buffer.from(shot.data, 'base64'));
    console.log(`[Captured] ${filename} (${Math.round(shot.data.length * 0.75 / 1024)} KB)`);
    return fullPath;
  }

  async function scrollTo(targetY, waitMs = 1500) {
    await send('Runtime.evaluate', {
      expression: `if (window.u && window.u.ASS) { window.u.ASS.scrollTo(${targetY}, false); }`
    });
    await new Promise(r => setTimeout(r, waitMs));
  }

  async function scrollToSelector(selector, waitMs = 1500) {
    const pos = await send('Runtime.evaluate', {
      expression: `(() => {
        const el = document.querySelector('${selector}');
        const ass = window.u?.ASS;
        if (el && ass) {
          return el.getBoundingClientRect().top + ass.currentPos;
        }
        return null;
      })()`,
      returnByValue: true
    });
    if (pos.result.value !== null) {
      await scrollTo(pos.result.value, waitMs);
    }
  }

  // 1. Capture Hero Section (Desktop)
  console.log('1. Capturing Hero Section (Desktop 1440x900)...');
  await scrollTo(0, 1000);
  await takeScreenshot('capture_01_hero_desktop.png');

  // 2. Capture Introduction Section
  console.log('2. Capturing Introduction Section...');
  await scrollToSelector('.introduction', 1800);
  await takeScreenshot('capture_02_intro.png');

  // 3. Capture Manifesto Chaos Section
  console.log('3. Capturing Manifesto Chaos Section...');
  await scrollToSelector('.manifesto--introduction-container', 1800);
  await takeScreenshot('capture_03_manifesto_chaos.png');

  // 4. Capture Manifesto Lightbulb Morph Section
  console.log('4. Capturing Manifesto Lightbulb Morph Section...');
  await scrollTo(2350, 2200); // Exact tuned position for lightbulb morph
  await takeScreenshot('capture_04_manifesto_bulb.png');

  // 5. Capture Manifesto World of Work Section
  console.log('5. Capturing Manifesto Values Section...');
  await scrollTo(3200, 1800);
  await takeScreenshot('capture_05_manifesto_values.png');

  // 6. Capture Team Section (Initial)
  console.log('6. Capturing Team Section (Initial)...');
  await scrollToSelector('.team', 2000);
  await takeScreenshot('capture_06_team_initial.png');

  // 7. Capture Team Section (After slider click)
  console.log('7. Clicking Next on Team Slider and capturing...');
  await send('Runtime.evaluate', {
    expression: `(() => {
      const btn = document.querySelector('.js-slider-next');
      if (btn) btn.click();
    })()`
  });
  await new Promise(r => setTimeout(r, 1200));
  await takeScreenshot('capture_07_team_next.png');

  // 8. Capture Investors Section
  console.log('8. Capturing Investors Section...');
  await scrollToSelector('.investors', 2200);
  await takeScreenshot('capture_08_investors.png');

  // 9. Capture Footer Section
  console.log('9. Capturing Footer Section...');
  await scrollToSelector('.footer', 1800);
  await takeScreenshot('capture_09_footer.png');

  // 10. Capture Veritas Forensics Studio Modal
  console.log('10. Triggering Request Access modal...');
  await send('Runtime.evaluate', {
    expression: `(() => {
      const btn = document.querySelector('.header__cta .btn') || document.querySelector('a[aria-label="Request Access"]');
      if (btn) btn.click();
    })()`
  });
  await new Promise(r => setTimeout(r, 1200));
  await takeScreenshot('capture_10_veritas_studio_modal.png');

  // Close modal
  await send('Runtime.evaluate', {
    expression: `(() => {
      const modal = document.getElementById('veritas-studio-modal');
      if (modal) modal.classList.remove('active');
    })()`
  });
  await new Promise(r => setTimeout(r, 500));

  // 11. Mobile Viewport Capture (390x844)
  console.log('11. Setting mobile viewport (390x844) and capturing Mobile Hero...');
  await send('Emulation.setDeviceMetricsOverride', {
    width: 390,
    height: 844,
    deviceScaleFactor: 2,
    mobile: true
  });
  await scrollTo(0, 1000);
  await takeScreenshot('capture_11_mobile_hero.png');

  console.log('\n[Captures] Successfully captured all 11 sections in high resolution!');
  chrome.kill();
  process.exit(0);
}

runCaptures().catch(err => {
  console.error('[Captures] Error:', err);
  chrome.kill();
  process.exit(1);
});
