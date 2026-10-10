const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const PORT = 9741;
const chrome = spawn('C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', [
  '--headless=new',
  '--window-size=1440,900',
  '--remote-debugging-port=' + PORT,
  '--disable-extensions',
  '--no-first-run',
  '--no-default-browser-check',
  'http://localhost:5173/#dashboard'
]);

async function run() {
  await new Promise(r => setTimeout(r, 2000));
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
  await send('DOM.enable');
  await send('CSS.enable');

  // Audit function for a given viewport width and view
  async function auditViewport(width, height, viewName) {
    console.log(`\n=== Testing Viewport ${width}x${height} in View: ${viewName} ===`);
    await send('Emulation.setDeviceMetricsOverride', {
      width,
      height,
      deviceScaleFactor: 1,
      mobile: width < 768
    });

    await new Promise(r => setTimeout(r, 600));

    // Evaluate layout metrics, font computed styles, colors, badges, overlaps
    const expr = `
      (() => {
        const portal = document.querySelector('div[style*="z-index: 99999"], div[style*="zIndex: 99999"]') || document.body;
        const header = document.querySelector('header');
        const backBtn = document.getElementById('veritas-back-to-manifesto');
        const title = header ? header.querySelector('span') : null;
        const tabButtons = header ? Array.from(header.querySelectorAll('button:not(#veritas-back-to-manifesto)')) : [];
        const themeToggle = header ? header.querySelector('button[aria-label="Toggle Theme"]') : null;
        const main = document.querySelector('main');

        // Check computed colors & typography
        const getStyle = (el) => {
          if (!el) return null;
          const cs = window.getComputedStyle(el);
          return {
            fontFamily: cs.fontFamily,
            fontSize: cs.fontSize,
            fontWeight: cs.fontWeight,
            color: cs.color,
            backgroundColor: cs.backgroundColor,
            letterSpacing: cs.letterSpacing,
            lineHeight: cs.lineHeight,
            padding: cs.padding,
            borderBottom: cs.borderBottom
          };
        };

        // Check all badges
        const badges = Array.from(document.querySelectorAll('.veritas-badge, span[style*="borderRadius"], span[style*="border-radius"], div[style*="borderRadius"], div[style*="border-radius"]')).map(b => {
          const cs = window.getComputedStyle(b);
          const r = b.getBoundingClientRect();
          return {
            text: b.textContent.trim().substring(0, 30),
            padding: cs.padding,
            borderRadius: cs.borderRadius,
            color: cs.color,
            bg: cs.backgroundColor,
            width: Math.round(r.width),
            height: Math.round(r.height)
          };
        });

        // Detect element overlaps in main and header
        const allInteractive = Array.from(document.querySelectorAll('button, input, a, .veritas-surface, h1, h2, h3'));
        const overlaps = [];
        for (let i = 0; i < allInteractive.length; i++) {
          const r1 = allInteractive[i].getBoundingClientRect();
          if (r1.width === 0 || r1.height === 0) continue;
          for (let j = i + 1; j < allInteractive.length; j++) {
            if (allInteractive[i].contains(allInteractive[j]) || allInteractive[j].contains(allInteractive[i])) continue;
            const r2 = allInteractive[j].getBoundingClientRect();
            if (r2.width === 0 || r2.height === 0) continue;
            // Check bounding box intersection
            const xOverlap = Math.max(0, Math.min(r1.right, r2.right) - Math.max(r1.left, r2.left));
            const yOverlap = Math.max(0, Math.min(r1.bottom, r2.bottom) - Math.max(r1.top, r2.top));
            if (xOverlap > 4 && yOverlap > 4) {
              overlaps.push({
                el1: allInteractive[i].tagName + '.' + (allInteractive[i].className || '') + ' (' + allInteractive[i].textContent.trim().substring(0, 20) + ')',
                el2: allInteractive[j].tagName + '.' + (allInteractive[j].className || '') + ' (' + allInteractive[j].textContent.trim().substring(0, 20) + ')',
                xOverlap,
                yOverlap
              });
            }
          }
        }

        // Horizontal overflow check
        const docWidth = document.documentElement.clientWidth;
        const scrollWidth = document.documentElement.scrollWidth;
        const mainRect = main ? main.getBoundingClientRect() : null;
        const hasHorizontalOverflow = scrollWidth > docWidth;

        return {
          viewport: { width: window.innerWidth, height: window.innerHeight },
          hasHorizontalOverflow,
          scrollWidth,
          docWidth,
          header: {
            rect: header ? header.getBoundingClientRect() : null,
            style: getStyle(header)
          },
          backBtn: {
            exists: !!backBtn,
            text: backBtn ? backBtn.textContent.trim() : null,
            style: getStyle(backBtn)
          },
          tabs: tabButtons.map(b => ({
            text: b.textContent.trim(),
            style: getStyle(b)
          })),
          themeToggle: {
            exists: !!themeToggle,
            title: themeToggle ? themeToggle.title : null
          },
          overlapsCount: overlaps.length,
          overlaps: overlaps.slice(0, 5),
          badgeSample: badges.slice(0, 6)
        };
      })()
    `;

    const evalResult = await send('Runtime.evaluate', { expression: expr, returnByValue: true });
    const auditData = evalResult.result.value;
    console.log('Audit Summary:', JSON.stringify({
      viewport: auditData.viewport,
      hasHorizontalOverflow: auditData.hasHorizontalOverflow,
      scrollWidth: auditData.scrollWidth,
      docWidth: auditData.docWidth,
      overlapsCount: auditData.overlapsCount,
      overlaps: auditData.overlaps,
      tabs: auditData.tabs.map(t => t.text)
    }, null, 2));

    // Capture screenshot
    const shot = await send('Page.captureScreenshot', { format: 'png' });
    const outDir = path.join('c:\\TTProject\\frontend\\audit_agent3');
    if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
    const shotPath = path.join(outDir, `dashboard_${width}px.png`);
    fs.writeFileSync(shotPath, Buffer.from(shot.data, 'base64'));
    console.log(`Saved screenshot -> ${shotPath}`);

    return auditData;
  }

  const viewports = [1440, 1024, 768, 375];
  const results = {};
  for (const w of viewports) {
    results[w] = await auditViewport(w, w === 375 ? 812 : 900, 'dashboard');
  }

  // Also test tab switching between views
  console.log('\n=== Testing Tab Switching Across Views ===');
  const tabViews = ['manifesto', 'dashboard', 'studio', 'classroom', 'demobench', 'dev'];
  for (const tab of tabViews) {
    console.log(`Switching to hash: #${tab}`);
    await send('Runtime.evaluate', { expression: `window.location.hash = '${tab}';` });
    await new Promise(r => setTimeout(r, 600));

    const checkTab = await send('Runtime.evaluate', {
      expression: `(() => {
        return {
          hash: window.location.hash,
          hasPortalHeader: !!document.querySelector('header'),
          activeTabButtonText: Array.from(document.querySelectorAll('header button')).filter(b => b.style.borderBottom && b.style.borderBottom.includes('solid')).map(b => b.textContent.trim()),
          mainContentSnippet: document.querySelector('main') ? document.querySelector('main').textContent.trim().substring(0, 60) : 'Manifesto Mode (react null)'
        };
      })()`,
      returnByValue: true
    });
    console.log(`Tab State #${tab}:`, checkTab.result.value);

    // Capture screenshot of tab at 1440px
    const shot = await send('Page.captureScreenshot', { format: 'png' });
    const shotPath = path.join('c:\\TTProject\\frontend\\audit_agent3', `tab_${tab}_1440px.png`);
    fs.writeFileSync(shotPath, Buffer.from(shot.data, 'base64'));
  }

  // Also test Theme Toggle
  console.log('\n=== Testing Theme Toggle ===');
  await send('Runtime.evaluate', { expression: `window.location.hash = 'dashboard';` });
  await new Promise(r => setTimeout(r, 400));
  const toggleExpr = `
    (() => {
      const toggle = document.querySelector('button[aria-label="Toggle Theme"]');
      if (toggle) toggle.click();
      return {
        themeAttr: document.documentElement.getAttribute('data-theme'),
        bodyBg: window.getComputedStyle(document.body).backgroundColor,
        portalBg: window.getComputedStyle(document.querySelector('header')?.parentElement || document.body).backgroundColor
      };
    })()
  `;
  const themeResult = await send('Runtime.evaluate', { expression: toggleExpr, returnByValue: true });
  console.log('After theme toggle to light mode:', themeResult.result.value);

  const shotLight = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync('c:\\TTProject\\frontend\\audit_agent3\\dashboard_theme_light.png', Buffer.from(shotLight.data, 'base64'));

  // Toggle back to dark
  await send('Runtime.evaluate', { expression: toggleExpr });
  await new Promise(r => setTimeout(r, 400));

  fs.writeFileSync('c:\\TTProject\\frontend\\audit_agent3\\audit_results.json', JSON.stringify(results, null, 2));

  chrome.kill();
  process.exit(0);
}

run().catch(e => {
  console.error('Audit run error:', e);
  chrome.kill();
  process.exit(1);
});
