const { spawn } = require('child_process');
const fs = require('fs');
const port = 9707;
const chrome = spawn('C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', [
  '--headless=new',
  '--window-size=1440,900',
  '--remote-debugging-port=' + port,
  'https://dala.craftedbygc.com/?skiploader'
]);

async function run() {
  await new Promise(r => setTimeout(r, 3000));
  const res = await fetch('http://localhost:' + port + '/json');
  const tabs = await res.json();
  const target = tabs.find(t => t.url.includes('dala.craftedbygc.com'));
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
  await new Promise(r => setTimeout(r, 2000));

  // Hero state
  const heroState = await send('Runtime.evaluate', {
    expression: `JSON.stringify({
      currentPos: window.u?.ASS?.currentPos,
      sectionIndex: window.u?.sectionIndex,
      sectionProgress: window.u?.sectionProgress,
      factor: window.u?.WebGL?._cones?._factor,
      scale: window.u?.WebGL?._cones?._scale,
      basePos: window.u?.WebGL?._cones?._params?.basePosition,
      rot: window.u?.WebGL?._cones?._material?.customUniforms[15]?.value,
      u_progress: window.u?.WebGL?._cones?._simulationPos?.material?.uniforms?.u_progress?.value,
      u_explode: window.u?.WebGL?._cones?._simulationPos?.material?.uniforms?.u_explode?.value
    })`,
    returnByValue: true
  });
  console.log('LIVE DALA HERO STATE:', heroState.result.value);

  let shot = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync('c:\\TTProject\\frontend\\reference_live_hero.png', Buffer.from(shot.data, 'base64'));
  console.log('Saved reference_live_hero.png');

  // Now click MANIFESTO link
  console.log('Clicking MANIFESTO nav link...');
  await send('Runtime.evaluate', {
    expression: `document.querySelector('a[anchor-link="manifesto"]').click();`
  });

  // Wait 3.5 seconds for GSAP mask transition and smooth scroll
  await new Promise(r => setTimeout(r, 3500));

  const manState = await send('Runtime.evaluate', {
    expression: `JSON.stringify({
      currentPos: window.u?.ASS?.currentPos,
      sectionIndex: window.u?.sectionIndex,
      sectionProgress: window.u?.sectionProgress,
      basePos: window.u?.WebGL?._cones?._params?.basePosition,
      rot: window.u?.WebGL?._cones?._material?.customUniforms[15]?.value,
      u_progress: window.u?.WebGL?._cones?._simulationPos?.material?.uniforms?.u_progress?.value,
      u_explode: window.u?.WebGL?._cones?._simulationPos?.material?.uniforms?.u_explode?.value
    })`,
    returnByValue: true
  });
  console.log('LIVE DALA MANIFESTO CLICK STATE:', manState.result.value);

  shot = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync('c:\\TTProject\\frontend\\reference_live_manifesto.png', Buffer.from(shot.data, 'base64'));
  console.log('Saved reference_live_manifesto.png');

  chrome.kill();
  process.exit(0);
}
run().catch(e => { console.error('ERR:', e); chrome.kill(); process.exit(1); });

