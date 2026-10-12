const { spawn } = require('child_process');
const fs = require('fs');

const port = 9705;
const chrome = spawn('C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', [
  '--headless=new',
  '--window-size=1440,900',
  '--remote-debugging-port=' + port,
  'http://localhost:5173/?skiploader'
]);

async function run() {
  await new Promise(r => setTimeout(r, 2000));
  const res = await fetch('http://localhost:' + port + '/json');
  const tabs = await res.json();
  const target = tabs.find(t => t.url.includes('5173'));
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
          resolve(data.result);
        }
      };
      ws.addEventListener('message', handler);
      ws.send(JSON.stringify({ id, method, params }));
    });
  }

  await send('Runtime.enable');
  await send('Page.enable');

  // Wait for WebGL engine and ASScroll ready
  const waitReady = `
    new Promise((resolve) => {
      const check = () => {
        const c = window.u?.WebGL?._cones;
        const w = window.u?.WebGL;
        if (c && c._loaded && w) {
          c.activate({ delay: 0, duration: 0.01 });
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
  await new Promise(r => setTimeout(r, 1200));

  async function takeScreenshot(filename) {
    const shot = await send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync('c:\\TTProject\\' + filename, Buffer.from(shot.data, 'base64'));
    console.log('[SAVED]', filename);
  }

  async function scrollToSelector(selector, filename) {
    const expr = `
      (() => {
        const ass = window.u?.ASS;
        const el = document.querySelector('${selector}');
        if (el && ass) {
          const rect = el.getBoundingClientRect();
          const targetY = rect.top + ass.currentPos;
          ass.scrollTo(targetY, false);
          return { selector: '${selector}', targetY, maxScroll: ass.maxScroll };
        }
        return { notFound: '${selector}' };
      })()
    `;
    const res = await send('Runtime.evaluate', { expression: expr, returnByValue: true });
    console.log('Scrolled to', selector, res.result.value);
    await new Promise(r => setTimeout(r, 1200));
    await takeScreenshot(filename);
  }

  // 1. Landing / Hero
  await takeScreenshot('veritas_1_landing.png');

  // 2. Introduction
  await scrollToSelector('.introduction', 'veritas_2_intro.png');

  // 3. Manifesto Chaos
  await scrollToSelector('.manifesto--introduction-container', 'veritas_3_chaos.png');

  // 4. Team Section
  await scrollToSelector('.team', 'veritas_4_team.png');

  // 5. Research Partners / Investors
  await scrollToSelector('.investors', 'veritas_5_partners.png');

  // 6. Footer
  await scrollToSelector('.footer', 'veritas_6_footer.png');

  // 7. Test Studio Modal Trigger
  console.log('Testing Studio Modal trigger...');
  const openModalExpr = `
    (() => {
      const btn = document.querySelector('.header__cta .btn');
      if (btn) {
        btn.click();
        const modal = document.querySelector('#veritas-studio-modal');
        return { clicked: true, modalActive: modal ? modal.classList.contains('active') : false };
      }
      return { clicked: false };
    })()
  `;
  const modalRes = await send('Runtime.evaluate', { expression: openModalExpr, returnByValue: true });
  console.log('Modal trigger result:', modalRes.result.value);
  await new Promise(r => setTimeout(r, 800));
  await takeScreenshot('veritas_7_studio_modal.png');

  // 8. Validate text contents
  const validateExpr = `
    (() => {
      const title = document.title;
      const heroTitle = document.querySelector('.landing__title')?.innerText;
      const heroEyebrow = document.querySelector('.landing__body .t-yellow')?.innerText;
      const introTitle = document.querySelector('.introduction__title')?.innerText;
      const introBody = document.querySelector('.introduction__body')?.innerText;
      const partnersTitle = document.querySelector('.investors__text h2')?.innerText;
      const footerTitle = document.querySelector('.footer__head h2')?.innerText;
      return {
        title,
        heroTitle,
        heroEyebrow,
        introTitle,
        introBody,
        partnersTitle,
        footerTitle
      };
    })()
  `;
  const validateRes = await send('Runtime.evaluate', { expression: validateExpr, returnByValue: true });
  console.log('\n--- VERIFIED LIVE CONTENT IN DOM ---');
  console.log(JSON.stringify(validateRes.result.value, null, 2));

  chrome.kill();
  process.exit(0);
}

run().catch(e => {
  console.error(e);
  chrome.kill();
  process.exit(1);
});

