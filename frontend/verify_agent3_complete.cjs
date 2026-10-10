const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');

const PORT = 9745;
const tempUserDataDir = fs.mkdtempSync(path.join(os.tmpdir(), 'chrome-audit3-'));

const chrome = spawn('C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', [
  '--headless=new',
  '--window-size=1440,900',
  '--remote-debugging-port=' + PORT,
  '--disable-extensions',
  '--no-first-run',
  '--no-default-browser-check',
  '--user-data-dir=' + tempUserDataDir,
  'http://localhost:5173/?skiploader#dashboard'
]);

async function runAudit() {
  console.log('Starting Agent 3 Complete Audit & Verification Suite...');
  await new Promise(r => setTimeout(r, 2500));

  const res = await fetch(`http://localhost:${PORT}/json`);
  const tabs = await res.json();
  const target = tabs.find(t => t.type === 'page' && t.url.includes('5173'));
  if (!target) throw new Error('Could not find Chrome target page');
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

  const outDir = 'c:\\TTProject\\frontend\\audit_agent3';
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

  const auditReport = {
    timestamp: new Date().toISOString(),
    viewports: {},
    tabSwitching: {},
    themeToggle: {},
    typographyMetrics: {},
    tokenDiscipline: {}
  };

  // Wait for initial render of dashboard
  await new Promise(r => setTimeout(r, 1200));

  // --- 1. AUDIT VIEWPORTS (1440px, 1024px, 768px, 375px) ---
  const viewports = [
    { width: 1440, height: 900, name: '1440px_desktop' },
    { width: 1024, height: 800, name: '1024px_laptop' },
    { width: 768, height: 1024, name: '768px_tablet' },
    { width: 375, height: 812, name: '375px_mobile' }
  ];

  for (const vp of viewports) {
    console.log(`\nAuditing Viewport: ${vp.width}x${vp.height} (${vp.name})...`);
    await send('Emulation.setDeviceMetricsOverride', {
      width: vp.width,
      height: vp.height,
      deviceScaleFactor: 1,
      mobile: vp.width < 768
    });
    await new Promise(r => setTimeout(r, 600));

    const metricsCode = `
      (() => {
        const header = document.querySelector('.portal-header') || document.querySelector('header');
        const main = document.querySelector('main');
        const backBtn = document.getElementById('veritas-back-to-manifesto');
        const h1 = document.querySelector('h1');
        const tabBtns = Array.from(document.querySelectorAll('.portal-tab-btn, header button'));
        const kpiCards = Array.from(document.querySelectorAll('.veritas-surface'));
        const subCards = Array.from(document.querySelectorAll('.ops-sub-card'));
        const badges = Array.from(document.querySelectorAll('.veritas-badge, span[style*="borderRadius"], span[style*="border-radius"], div[style*="borderRadius"]'));

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

        // Check horizontal overflow
        const docWidth = document.documentElement.clientWidth;
        const scrollWidth = document.documentElement.scrollWidth;
        const bodyScrollWidth = document.body.scrollWidth;
        const hasHorizontalOverflow = scrollWidth > docWidth || bodyScrollWidth > docWidth;

        // Check interactive overlaps in portal
        const interactiveElements = Array.from(document.querySelectorAll('button, input, a, h1, h2, h3, .veritas-surface, .ops-sub-card'));
        const overlaps = [];
        for (let i = 0; i < interactiveElements.length; i++) {
          const r1 = interactiveElements[i].getBoundingClientRect();
          if (r1.width === 0 || r1.height === 0) continue;
          for (let j = i + 1; j < interactiveElements.length; j++) {
            if (interactiveElements[i].contains(interactiveElements[j]) || interactiveElements[j].contains(interactiveElements[i])) continue;
            const r2 = interactiveElements[j].getBoundingClientRect();
            if (r2.width === 0 || r2.height === 0) continue;
            const xOverlap = Math.max(0, Math.min(r1.right, r2.right) - Math.max(r1.left, r2.left));
            const yOverlap = Math.max(0, Math.min(r1.bottom, r2.bottom) - Math.max(r1.top, r2.top));
            if (xOverlap > 4 && yOverlap > 4) {
              overlaps.push({
                el1: interactiveElements[i].tagName + ' (' + interactiveElements[i].textContent.trim().substring(0, 20) + ')',
                el2: interactiveElements[j].tagName + ' (' + interactiveElements[j].textContent.trim().substring(0, 20) + ')',
                xOverlap: Math.round(xOverlap),
                yOverlap: Math.round(yOverlap)
              });
            }
          }
        }

        return {
          viewport: { width: window.innerWidth, height: window.innerHeight },
          hasHorizontalOverflow,
          scrollWidth,
          docWidth,
          overlapsCount: overlaps.length,
          overlaps: overlaps.slice(0, 6),
          header: {
            rect: header ? header.getBoundingClientRect() : null,
            style: getStyle(header)
          },
          backBtn: {
            exists: !!backBtn,
            text: backBtn ? backBtn.textContent.trim() : null,
            style: getStyle(backBtn)
          },
          titleStyle: getStyle(h1),
          tabs: tabBtns.map(b => ({
            text: b.textContent.trim(),
            active: b.style.borderBottom && b.style.borderBottom.includes('solid'),
            style: getStyle(b)
          })),
          kpiCardCount: kpiCards.length,
          subCardCount: subCards.length,
          badgePaddings: badges.slice(0, 5).map(b => ({
            text: b.textContent.trim().substring(0, 25),
            padding: window.getComputedStyle(b).padding,
            borderRadius: window.getComputedStyle(b).borderRadius,
            color: window.getComputedStyle(b).color
          }))
        };
      })()
    `;

    const metricsResult = await send('Runtime.evaluate', { expression: metricsCode, returnByValue: true });
    const vpData = metricsResult.result.value;
    auditReport.viewports[vp.width] = vpData;

    console.log(`  Horizontal Overflow: ${vpData.hasHorizontalOverflow}`);
    console.log(`  Overlaps Count: ${vpData.overlapsCount}`);
    console.log(`  Back Button: ${vpData.backBtn.exists} (${vpData.backBtn.text})`);
    console.log(`  Tab count: ${vpData.tabs.length}`);

    // Capture high-res screenshot
    const shot = await send('Page.captureScreenshot', { format: 'png' });
    const shotFilename = `dashboard_${vp.width}px.png`;
    fs.writeFileSync(path.join(outDir, shotFilename), Buffer.from(shot.data, 'base64'));
    console.log(`  Screenshot saved: ${shotFilename}`);
  }

  // Restore 1440px for tab switching tests
  await send('Emulation.setDeviceMetricsOverride', {
    width: 1440,
    height: 900,
    deviceScaleFactor: 1,
    mobile: false
  });
  await new Promise(r => setTimeout(r, 400));

  // --- 2. AUDIT TAB SWITCHING ---
  console.log('\n=== Testing Tab Switching Across All 6 Views ===');
  const tabsToTest = ['dashboard', 'studio', 'classroom', 'demobench', 'dev', 'manifesto'];

  for (const tab of tabsToTest) {
    console.log(`Switching to view: #${tab}...`);
    await send('Runtime.evaluate', { expression: `window.location.hash = '${tab}';` });
    await new Promise(r => setTimeout(r, 800));

    const tabStateCode = `
      (() => {
        const header = document.querySelector('.portal-header') || document.querySelector('header');
        const activeTabBtn = Array.from(document.querySelectorAll('.portal-tab-btn, header button')).find(b => b.style.borderBottom && b.style.borderBottom.includes('solid'));
        const main = document.querySelector('main');
        const isManifesto = window.location.hash === '#manifesto' || !document.querySelector('.portal-header');

        return {
          currentHash: window.location.hash,
          isManifestoMode: isManifesto,
          activeTabLabel: activeTabBtn ? activeTabBtn.textContent.trim() : (isManifesto ? 'Manifesto (Native WebGL)' : 'None'),
          hasPortalHeader: !!document.querySelector('.portal-header'),
          contentPreview: isManifesto ? 'Native Veritas 3D Landing & Manifesto View' : (main ? main.innerText.substring(0, 100).replace(/\\n/g, ' ') : 'Empty')
        };
      })()
    `;

    const tabStateRes = await send('Runtime.evaluate', { expression: tabStateCode, returnByValue: true });
    auditReport.tabSwitching[tab] = tabStateRes.result.value;
    console.log(`  Result for #${tab}:`, tabStateRes.result.value);

    // Screenshot
    const shot = await send('Page.captureScreenshot', { format: 'png' });
    const tabShotName = `tab_${tab}_1440px.png`;
    fs.writeFileSync(path.join(outDir, tabShotName), Buffer.from(shot.data, 'base64'));
    console.log(`  Screenshot saved: ${tabShotName}`);
  }

  // --- 3. AUDIT "BACK TO MANIFESTO" BUTTON ---
  console.log('\n=== Testing "Back to Manifesto" Button Interaction ===');
  // First switch back to dashboard
  await send('Runtime.evaluate', { expression: `window.location.hash = 'dashboard';` });
  await new Promise(r => setTimeout(r, 800));

  const backClickCode = `
    (() => {
      const backBtn = document.getElementById('veritas-back-to-manifesto');
      if (backBtn) {
        backBtn.click();
        return { clicked: true };
      }
      return { clicked: false, error: 'Button not found' };
    })()
  `;
  const backClickRes = await send('Runtime.evaluate', { expression: backClickCode, returnByValue: true });
  console.log('  Back button clicked:', backClickRes.result.value);

  await new Promise(r => setTimeout(r, 800));
  const postBackState = await send('Runtime.evaluate', {
    expression: `(() => {
      return {
        hash: window.location.hash,
        portalHeaderExists: !!document.querySelector('.portal-header'),
        manifestoHeaderExists: !!document.querySelector('.header.js-header'),
        landingTitleExists: !!document.querySelector('.landing__title')
      };
    })()`,
    returnByValue: true
  });
  console.log('  State after Back to Manifesto:', postBackState.result.value);
  auditReport.backToManifestoTest = { clickResult: backClickRes.result.value, postState: postBackState.result.value };

  const backShot = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync(path.join(outDir, 'after_back_to_manifesto.png'), Buffer.from(backShot.data, 'base64'));

  // --- 4. AUDIT THEME TOGGLE (DARK / LIGHT) ---
  console.log('\n=== Testing Theme Toggle ===');
  // Switch back to dashboard
  await send('Runtime.evaluate', { expression: `window.location.hash = 'dashboard';` });
  await new Promise(r => setTimeout(r, 800));

  const toggleCode = `
    (() => {
      const toggle = document.querySelector('button[aria-label="Toggle Theme"]');
      if (!toggle) return { error: 'Toggle button not found' };
      const beforeTheme = document.documentElement.getAttribute('data-theme');
      toggle.click();
      const afterTheme = document.documentElement.getAttribute('data-theme');
      const rootStyle = window.getComputedStyle(document.documentElement);
      return {
        clicked: true,
        beforeTheme,
        afterTheme,
        boneWhiteValue: rootStyle.getPropertyValue('--color-bone-white').trim(),
        voidValue: rootStyle.getPropertyValue('--color-void').trim(),
        electricIrisValue: rootStyle.getPropertyValue('--color-electric-iris').trim(),
        deepVerdantValue: rootStyle.getPropertyValue('--color-deep-verdant').trim(),
        saffronSparkValue: rootStyle.getPropertyValue('--color-saffron-spark').trim()
      };
    })()
  `;
  const toggleRes = await send('Runtime.evaluate', { expression: toggleCode, returnByValue: true });
  console.log('  Theme toggle result:', toggleRes.result.value);
  auditReport.themeToggle = toggleRes.result.value;

  const lightShot = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync(path.join(outDir, 'dashboard_theme_light.png'), Buffer.from(lightShot.data, 'base64'));
  console.log('  Screenshot saved: dashboard_theme_light.png');

  // Toggle back to dark
  await send('Runtime.evaluate', { expression: `document.querySelector('button[aria-label="Toggle Theme"]')?.click();` });
  await new Promise(r => setTimeout(r, 400));

  // --- 5. AUDIT VISUAL TOKEN DISCIPLINE & TYPOGRAPHY ---
  console.log('\n=== Auditing Visual Token Discipline & Typography ===');
  const tokenAuditCode = `
    (() => {
      const root = window.getComputedStyle(document.documentElement);
      const portal = document.querySelector('div[style*="zIndex: 99999"], div[style*="z-index: 99999"]');
      const h1 = document.querySelector('h1');
      const tab = document.querySelector('.portal-tab-btn');
      const subCard = document.querySelector('.ops-sub-card');

      return {
        tokens: {
          void: root.getPropertyValue('--color-void').trim(),
          boneWhite: root.getPropertyValue('--color-bone-white').trim(),
          electricIris: root.getPropertyValue('--color-electric-iris').trim(),
          saffronSpark: root.getPropertyValue('--color-saffron-spark').trim(),
          deepVerdant: root.getPropertyValue('--color-deep-verdant').trim(),
          fontPPNeueMontreal: root.getPropertyValue('--font-ppneuemontreal').trim()
        },
        typographyMetrics: {
          portalFontFamily: portal ? window.getComputedStyle(portal).fontFamily : null,
          h1FontFamily: h1 ? window.getComputedStyle(h1).fontFamily : null,
          h1FontSize: h1 ? window.getComputedStyle(h1).fontSize : null,
          h1FontWeight: h1 ? window.getComputedStyle(h1).fontWeight : null,
          h1LetterSpacing: h1 ? window.getComputedStyle(h1).letterSpacing : null,
          tabFontFamily: tab ? window.getComputedStyle(tab).fontFamily : null,
          tabFontSize: tab ? window.getComputedStyle(tab).fontSize : null,
          tabFontWeight: tab ? window.getComputedStyle(tab).fontWeight : null,
          tabLetterSpacing: tab ? window.getComputedStyle(tab).letterSpacing : null
        }
      };
    })()
  `;
  const tokenRes = await send('Runtime.evaluate', { expression: tokenAuditCode, returnByValue: true });
  auditReport.tokenDiscipline = tokenRes.result.value;
  console.log('  Token Discipline:', JSON.stringify(tokenRes.result.value, null, 2));

  // Save report to disk
  fs.writeFileSync(path.join(outDir, 'complete_audit_report.json'), JSON.stringify(auditReport, null, 2));
  console.log('\n=== Full Audit Successfully Completed! Report saved to audit_agent3/complete_audit_report.json ===');

  chrome.kill();
  process.exit(0);
}

runAudit().catch(e => {
  console.error('Audit suite error:', e);
  chrome.kill();
  process.exit(1);
});
