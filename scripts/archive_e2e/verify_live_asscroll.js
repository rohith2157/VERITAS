const { spawn } = require('child_process');
const fs = require('fs');

const port = 9712;
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

  // Wait for ASScroll and WebGL to initialize
  const waitReady = `
    new Promise((resolve) => {
      const check = () => {
        const ass = window.u?.ASS;
        const c = window.u?.WebGL?._cones;
        if (ass && c && c._loaded) {
          c.activate({ delay: 0, duration: 0.01 });
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

  // Inspect state before scrolling
  const initialInspect = `
    (() => {
      const ass = window.u?.ASS;
      const main = document.querySelector('main');
      const bar = document.querySelector('.asscrollbar');
      const handle = document.querySelector('.asscrollbar__handle');
      return {
        assPresent: !!ass,
        scrollElementsCount: ass?.scrollElements?.length,
        mainHasAsscroll: main?.hasAttribute('asscroll'),
        barPresent: !!bar,
        barClass: bar?.className,
        handlePresent: !!handle,
        handleStyle: handle?.getAttribute('style'),
        bodyHeight: document.body.style.height,
        maxScroll: ass?.maxScroll,
        currentPos: ass?.currentPos
      };
    })()
  `;
  const initRes = await send('Runtime.evaluate', { expression: initialInspect, returnByValue: true });
  console.log('INITIAL ASSCROLL STATE:');
  console.log(JSON.stringify(initRes.result.value, null, 2));

  // Scroll to 509.6px (matching exact value from user DevTools screenshot!)
  const scrollExpr = `
    (() => {
      const ass = window.u?.ASS;
      if (ass) {
        ass.scrollTo(509.6, false);
        return { target: 509.6, currentPos: ass.currentPos };
      }
      return null;
    })()
  `;
  await send('Runtime.evaluate', { expression: scrollExpr });
  await new Promise(r => setTimeout(r, 1200));

  // Inspect state after scrolling
  const afterInspect = `
    (() => {
      const ass = window.u?.ASS;
      const main = document.querySelector('main');
      const bar = document.querySelector('.asscrollbar');
      const handle = document.querySelector('.asscrollbar__handle');
      const header = document.querySelector('.header');
      return {
        currentPos: ass?.currentPos,
        mainTransform: main?.style?.transform,
        barClass: bar?.className,
        handleStyle: handle?.getAttribute('style'),
        handleBoundingRect: handle?.getBoundingClientRect(),
        headerVisible: header ? window.getComputedStyle(header).visibility : null,
        headerTransform: header ? window.getComputedStyle(header).transform : null
      };
    })()
  `;
  const afterRes = await send('Runtime.evaluate', { expression: afterInspect, returnByValue: true });
  console.log('\nAFTER SCROLLING TO 509.6px:');
  console.log(JSON.stringify(afterRes.result.value, null, 2));

  // Capture screenshot of the scroll state
  const shot = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync('c:\\TTProject\\verify_asscroll_509.png', Buffer.from(shot.data, 'base64'));
  console.log('[SAVED] verify_asscroll_509.png');

  chrome.kill();
  process.exit(0);
}

run().catch(e => {
  console.error(e);
  chrome.kill();
  process.exit(1);
});

