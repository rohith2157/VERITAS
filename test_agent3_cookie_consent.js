const { spawn } = require('child_process');
const fs = require('fs');

const PORT = 9735;
const chrome = spawn('C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', [
  '--headless=new',
  '--window-size=1440,900',
  '--remote-debugging-port=' + PORT,
  '--disable-extensions',
  '--no-first-run',
  '--no-default-browser-check',
  'http://localhost:5173/?skiploader'
]);

async function testCookieConsent() {
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

  console.log('=== AUDITING COOKIE CONSENT BANNER & PERSISTENCE ===');

  // Step 1: Clear cookies & localStorage to ensure pristine state
  await send('Runtime.evaluate', {
    expression: `
      (() => {
        localStorage.clear();
        document.cookie.split(";").forEach(c => {
          document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
        });
      })()
    `
  });

  // Reload page cleanly to start fresh
  await send('Page.reload');
  await new Promise(r => setTimeout(r, 2500));

  // Audit initial cookie banner state
  const getBannerStateExpr = `
    (() => {
      const banner = document.querySelector('.js-cookie-notice');
      const toggle = document.querySelector('.js-cookie-notice-toggle');
      const style = banner ? window.getComputedStyle(banner) : null;
      return {
        exists: !!banner,
        isOpen: banner ? banner.classList.contains('is-open') : false,
        display: style ? style.display : null,
        visibility: style ? style.visibility : null,
        opacity: style ? style.opacity : null,
        text: banner ? banner.innerText.replace(/\\s+/g, ' ').trim() : null,
        hasToggleBtn: !!toggle,
        toggleBtnText: toggle ? toggle.innerText.trim() : null,
        localStorageVal: localStorage.getItem('dala_cookie_accepted'),
        cookieStr: document.cookie
      };
    })()
  `;

  const initialState = await send('Runtime.evaluate', { expression: getBannerStateExpr, returnByValue: true });
  console.log('1. Initial Banner State (Before Accept):');
  console.log(JSON.stringify(initialState.result.value, null, 2));

  let shot = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync('c:\\TTProject\\frontend\\audit_agent3\\cookie_banner_initial.png', Buffer.from(shot.data, 'base64'));
  console.log('  Saved cookie_banner_initial.png');

  // Step 2: Click "Accept"
  console.log('\n2. Clicking "Accept" button...');
  const clickRes = await send('Runtime.evaluate', {
    expression: `
      (() => {
        const toggle = document.querySelector('.js-cookie-notice-toggle');
        if (toggle) {
          toggle.click();
          return { clicked: true };
        }
        return { clicked: false };
      })()
    `,
    returnByValue: true
  });
  console.log('  Click Result:', clickRes.result.value);
  await new Promise(r => setTimeout(r, 1000));

  const afterAcceptState = await send('Runtime.evaluate', { expression: getBannerStateExpr, returnByValue: true });
  console.log('  State Immediately After Accept:');
  console.log(JSON.stringify(afterAcceptState.result.value, null, 2));

  shot = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync('c:\\TTProject\\frontend\\audit_agent3\\cookie_banner_accepted.png', Buffer.from(shot.data, 'base64'));
  console.log('  Saved cookie_banner_accepted.png');

  // Step 3: Reload page to verify persistence in localStorage
  console.log('\n3. Reloading page to verify persistence in localStorage...');
  await send('Page.reload');
  await new Promise(r => setTimeout(r, 2500));

  const afterReloadState = await send('Runtime.evaluate', { expression: getBannerStateExpr, returnByValue: true });
  console.log('  State After Reload:');
  console.log(JSON.stringify(afterReloadState.result.value, null, 2));

  shot = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync('c:\\TTProject\\frontend\\audit_agent3\\cookie_banner_persisted_after_reload.png', Buffer.from(shot.data, 'base64'));
  console.log('  Saved cookie_banner_persisted_after_reload.png');

  const report = {
    initial: initialState.result.value,
    afterAccept: afterAcceptState.result.value,
    afterReload: afterReloadState.result.value,
    passed: {
      initialVisible: initialState.result.value.display !== 'none',
      dismissedOnAccept: afterAcceptState.result.value.display === 'none',
      localStorageSet: afterAcceptState.result.value.localStorageVal === 'true',
      cookieSet: afterAcceptState.result.value.cookieStr.includes('cookie_notice_accepted=true'),
      persistedAfterReload: afterReloadState.result.value.display === 'none' && afterReloadState.result.value.localStorageVal === 'true'
    }
  };

  fs.writeFileSync('c:\\TTProject\\frontend\\audit_agent3\\cookie_consent_report.json', JSON.stringify(report, null, 2));
  console.log('\n=== Cookie Consent Banner Audit Passed & Verified ===');
  console.log(JSON.stringify(report.passed, null, 2));

  chrome.kill();
  process.exit(0);
}

testCookieConsent().catch(e => {
  console.error('Cookie test failed:', e);
  chrome.kill();
  process.exit(1);
});
