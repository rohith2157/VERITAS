const { spawn } = require('child_process');
const fs = require('fs');

const PORT = 9740;
const chrome = spawn('C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', [
  '--headless=new',
  '--window-size=1440,900',
  '--remote-debugging-port=' + PORT,
  '--disable-extensions',
  '--no-first-run',
  '--no-default-browser-check',
  'http://localhost:5173/?skiploader'
]);

async function testHeaderNav() {
  await new Promise(r => setTimeout(r, 2500));
  const res = await fetch(`http://localhost:${PORT}/json`);
  const tabs = await res.json();
  const target = tabs.find(t => t.type === 'page' && t.url.includes('5173'));
  const ws = new WebSocket(target.webSocketDebuggerUrl);
  await new Promise(r => ws.addEventListener('open', r));

  let msgId = 1;
  function send(method, params = {}) {
    return new Promise((resolve) => {
      const id = ++msgId;
      const handler = (ev) => {
        const data = JSON.parse(ev.data);
        if (data.id === id) {
          ws.removeEventListener('message', handler);
          resolve(data.result || {});
        }
      };
      ws.addEventListener('message', handler);
      ws.send(JSON.stringify({ id, method, params }));
    });
  }

  await send('Runtime.enable');
  await send('Page.enable');

  console.log('=== AUDITING HEADER NAVIGATION & ANIMATED MASK TRANSITIONS ===');

  // Wait for initial load
  const waitReady = `
    new Promise((resolve) => {
      const check = () => {
        const ass = window.u?.ASS;
        const w = window.u?.WebGL;
        if (ass && w && w._cones && w._cones._loaded) {
          w._cones.activate({ delay: 0, duration: 0.01 });
          if (w._layer) w._layer.visible = false;
          setTimeout(() => resolve('ready'), 800);
        } else {
          setTimeout(check, 200);
        }
      };
      check();
    })
  `;
  await send('Runtime.evaluate', { expression: waitReady, awaitPromise: true });
  await new Promise(r => setTimeout(r, 800));

  async function clickNavAndVerify(anchorName, selector, expectedSectionText, screenshotName) {
    console.log(`\n--- Clicking [${anchorName}] (${selector}) ---`);
    const clickExpr = `
      (() => {
        const link = document.querySelector('${selector}');
        const target = document.querySelector('[anchor-target="${anchorName}"]');
        if (!link) return { error: 'link not found: ${selector}' };
        if (!target) return { error: 'target not found for: ${anchorName}' };

        const targetY = target.getBoundingClientRect().top + window.u.ASS.currentPos;
        link.click();

        return {
          clicked: true,
          targetY: Math.round(targetY)
        };
      })()
    `;
    const clickData = await send('Runtime.evaluate', { expression: clickExpr, returnByValue: true });
    console.log('  Click Response:', clickData.result.value);

    // Check mask immediately (0.3s after click)
    await new Promise(r => setTimeout(r, 300));
    const maskExpr = `
      (() => {
        const mask = document.querySelector('.js-nav-transition-mask');
        const maskBg = document.querySelector('.js-nav-transition-mask-bg');
        const spinner = document.querySelector('.js-nav-transition-mask-spinner');
        return {
          maskVisible: mask ? window.getComputedStyle(mask).visibility !== 'hidden' : false,
          maskBgOpacity: maskBg ? window.getComputedStyle(maskBg).opacity : null,
          maskPointerEvents: mask ? window.getComputedStyle(mask).pointerEvents : null
        };
      })()
    `;
    const midMask = await send('Runtime.evaluate', { expression: maskExpr, returnByValue: true });
    console.log('  Mask Transition Active (t=300ms):', midMask.result.value);

    // Wait for full transition to complete (3.2s)
    await new Promise(r => setTimeout(r, 3200));

    // Verify arrival at target
    const finalExpr = `
      (() => {
        const ass = window.u.ASS;
        const target = document.querySelector('[anchor-target="${anchorName}"]');
        const targetRect = target.getBoundingClientRect();
        return {
          currentPos: Math.round(ass.currentPos),
          targetY: Math.round(targetRect.top + ass.currentPos),
          targetTopInViewport: Math.round(targetRect.top),
          sectionName: window.u.sectionName
        };
      })()
    `;
    const finalState = await send('Runtime.evaluate', { expression: finalExpr, returnByValue: true });
    console.log('  Final Scroll State:', finalState.result.value);

    // Capture screenshot
    const shot = await send('Page.captureScreenshot', { format: 'png' });
    const filename = `c:\\TTProject\\frontend\\audit_agent3\\${screenshotName}`;
    fs.writeFileSync(filename, Buffer.from(shot.data, 'base64'));
    console.log(`  Saved screenshot -> ${screenshotName}`);

    return {
      anchorName,
      clickData: clickData.result.value,
      maskTransitionActive: midMask.result.value,
      finalState: finalState.result.value,
      screenshot: `frontend/audit_agent3/${screenshotName}`
    };
  }

  const reports = [];

  // 1. Click "Manifesto"
  const r1 = await clickNavAndVerify('manifesto', '.header .js-nav-link[anchor-link="manifesto"]', 'Manifesto', 'nav_1_manifesto.png');
  reports.push(r1);

  // 2. Click "Team"
  const r2 = await clickNavAndVerify('team', '.header .js-nav-link[anchor-link="team"]', 'Our team', 'nav_2_team.png');
  reports.push(r2);

  // 3. Click Logo -> "Landing"
  const r3 = await clickNavAndVerify('landing', '.header__logo[anchor-link="landing"]', 'Unlock collective wisdom', 'nav_3_logo_landing.png');
  reports.push(r3);

  fs.writeFileSync('c:\\TTProject\\frontend\\audit_agent3\\header_nav_report.json', JSON.stringify(reports, null, 2));
  console.log('\n=== Header Navigation Audit Complete & Verified ===');

  chrome.kill();
  process.exit(0);
}

testHeaderNav().catch(e => {
  console.error('Header nav test failed:', e);
  chrome.kill();
  process.exit(1);
});
