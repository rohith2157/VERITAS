const { spawn } = require('child_process');
const fs = require('fs');

const PORT_DESKTOP = 9730;
const PORT_MOBILE = 9731;

async function testDesktopInvestors() {
  console.log('=== 1. TESTING DESKTOP INVESTORS (3D ROTATING PRISMS & PARALLAX) ===');
  const chrome = spawn('C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', [
    '--headless=new',
    '--window-size=1440,900',
    '--remote-debugging-port=' + PORT_DESKTOP,
    '--disable-extensions',
    '--no-first-run',
    '--no-default-browser-check',
    'http://localhost:5173/?skiploader'
  ]);

  await new Promise(r => setTimeout(r, 2500));
  const res = await fetch(`http://localhost:${PORT_DESKTOP}/json`);
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

  // Wait ready and scroll to investors
  const waitAndScroll = `
    new Promise((resolve) => {
      const check = () => {
        const ass = window.u?.ASS;
        const w = window.u?.WebGL;
        const inv = document.querySelector('.investors');
        if (ass && w && w._cones && w._cones._loaded && inv) {
          w._cones.activate({ delay: 0, duration: 0.01 });
          if (w._layer) w._layer.visible = false;
          const y = inv.getBoundingClientRect().top + ass.currentPos;
          ass.scrollTo(y, false);
          setTimeout(() => resolve({ y }), 1500);
        } else {
          setTimeout(check, 200);
        }
      };
      check();
    })
  `;
  await send('Runtime.evaluate', { expression: waitAndScroll, awaitPromise: true });
  await new Promise(r => setTimeout(r, 1200));

  // Audit 3D Prisms
  const auditPrismsExpr = `
    (() => {
      const u = window.u;
      const d2w = u.Dom2Webgl;
      const items = Array.from(document.querySelectorAll('.investors__item')).map((item, idx) => {
        const webglPlaceholder = item.querySelector('[dom2webgl]');
        const mobileFallback = item.querySelector('.investor__icon:not([dom2webgl])');
        const fallbackImg = mobileFallback ? mobileFallback.querySelector('img') : null;
        const bodyText = item.querySelector('.investor__body')?.innerText?.replace(/\\n/g, ' - ');

        const webglKey = 'c:Pyramid' + idx;
        const prism = d2w?.webGLItems?.[webglKey];

        return {
          idx,
          partner: bodyText,
          dom: {
            dom2webgl: webglPlaceholder?.getAttribute('dom2webgl'),
            materialColor: webglPlaceholder?.getAttribute('material-color'),
            startX: webglPlaceholder?.getAttribute('start-x'),
            parallaxSpeed: webglPlaceholder?.getAttribute('parallax-speed'),
            placeholderDisplay: webglPlaceholder ? window.getComputedStyle(webglPlaceholder).display : null,
            mobileDisplay: mobileFallback ? window.getComputedStyle(mobileFallback).display : null,
            imgSrc: fallbackImg?.src
          },
          webgl: prism ? {
            hasMesh: !!prism.item,
            colorHex: '#' + prism.material?.color?.getHexString()?.toUpperCase(),
            speed: prism.speed,
            parallax: prism.parallax,
            rotation: prism.item ? {
              x: prism.item.rotation.x.toFixed(4),
              y: prism.item.rotation.y.toFixed(4),
              z: prism.item.rotation.z.toFixed(4)
            } : null,
            position: prism.item ? {
              x: Math.round(prism.item.position.x),
              y: Math.round(prism.item.position.y),
              z: Math.round(prism.item.position.z)
            } : null
          } : null
        };
      });

      return {
        isSmMatch: u.mq.sm.matches,
        totalItems: items.length,
        items
      };
    })()
  `;

  const prismData = await send('Runtime.evaluate', { expression: auditPrismsExpr, returnByValue: true });
  console.log('Desktop Investors Audit:', JSON.stringify(prismData.result.value, null, 2));

  // Test dynamic parallax movement with small scroll adjustment
  const testParallaxExpr = `
    (() => {
      const ass = window.u.ASS;
      const d2w = window.u.Dom2Webgl;
      const beforeY = d2w.webGLItems['c:Pyramid0']?.item?.position?.y;
      ass.scrollTo(ass.currentPos + 200, false);
      const afterY = d2w.webGLItems['c:Pyramid0']?.item?.position?.y;
      return { beforeY, afterY, delta: (afterY - beforeY) };
    })()
  `;
  const parallaxData = await send('Runtime.evaluate', { expression: testParallaxExpr, returnByValue: true });
  console.log('Parallax Scroll Delta:', parallaxData.result.value);

  // Capture desktop screenshot
  const shot = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync('c:\\TTProject\\frontend\\audit_agent3\\investors_desktop_webgl.png', Buffer.from(shot.data, 'base64'));
  console.log('Saved investors_desktop_webgl.png');

  chrome.kill();

  fs.writeFileSync('c:\\TTProject\\frontend\\audit_agent3\\investors_desktop_report.json', JSON.stringify({
    prisms: prismData.result.value,
    parallax: parallaxData.result.value
  }, null, 2));
}

async function testMobileInvestors() {
  console.log('\n=== 2. TESTING MOBILE INVESTORS (FALLBACK GLOWING PNGs) ===');
  const chrome = spawn('C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', [
    '--headless=new',
    '--window-size=390,844',
    '--remote-debugging-port=' + PORT_MOBILE,
    '--disable-extensions',
    '--no-first-run',
    '--no-default-browser-check',
    'http://localhost:5173/?skiploader'
  ]);

  await new Promise(r => setTimeout(r, 2500));
  const res = await fetch(`http://localhost:${PORT_MOBILE}/json`);
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

  // Scroll to investors on mobile
  const scrollMobileExpr = `
    (() => {
      const inv = document.querySelector('.investors');
      if (inv) {
        inv.scrollIntoView();
      }
    })()
  `;
  await send('Runtime.evaluate', { expression: scrollMobileExpr });
  await new Promise(r => setTimeout(r, 1200));

  // Audit Mobile Fallback Images
  const mobileAuditExpr = `
    (() => {
      const items = Array.from(document.querySelectorAll('.investors__item')).map((item, idx) => {
        const icons = item.querySelectorAll('.investor__icon');
        const mobileFallback = icons[0];
        const desktopWebgl = icons[1];
        const img = mobileFallback ? mobileFallback.querySelector('img') : null;
        const partner = item.querySelector('.investor__body')?.innerText?.replace(/\\n/g, ' - ');

        return {
          idx: idx + 1,
          partner,
          mobileFallbackVisible: mobileFallback ? window.getComputedStyle(mobileFallback).display !== 'none' : false,
          desktopWebglHidden: desktopWebgl ? window.getComputedStyle(desktopWebgl).display === 'none' : true,
          mobileDisplay: mobileFallback ? window.getComputedStyle(mobileFallback).display : null,
          desktopDisplay: desktopWebgl ? window.getComputedStyle(desktopWebgl).display : null,
          image: {
            src: img ? img.getAttribute('src') : null,
            loaded: img ? img.complete : false,
            naturalWidth: img ? img.naturalWidth : null,
            naturalHeight: img ? img.naturalHeight : null
          }
        };
      });

      return {
        viewportWidth: window.innerWidth,
        items
      };
    })()
  `;

  const mobileData = await send('Runtime.evaluate', { expression: mobileAuditExpr, returnByValue: true });
  console.log('Mobile Investors Audit:', JSON.stringify(mobileData.result.value, null, 2));

  // Capture mobile screenshot
  const shot = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync('c:\\TTProject\\frontend\\audit_agent3\\investors_mobile_fallback.png', Buffer.from(shot.data, 'base64'));
  console.log('Saved investors_mobile_fallback.png');

  chrome.kill();

  fs.writeFileSync('c:\\TTProject\\frontend\\audit_agent3\\investors_mobile_report.json', JSON.stringify(mobileData.result.value, null, 2));
}

async function run() {
  await testDesktopInvestors();
  await testMobileInvestors();
  console.log('\n=== Investors & Research Partners Verification Complete ===');
  process.exit(0);
}

run().catch(e => {
  console.error('Investors audit failed:', e);
  process.exit(1);
});
