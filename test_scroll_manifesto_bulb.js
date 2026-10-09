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
  await new Promise(r => setTimeout(r, 1000));

  // Let's test scrolling smoothly using window.u.ASS.scrollTo
  // Let's inspect all section positions
  const getSections = `
    (() => {
      const ass = window.u?.ASS;
      const sections = [...document.querySelectorAll('.js-section')].map((s, i) => {
        const rect = s.getBoundingClientRect();
        return {
          index: i,
          className: s.className,
          top: rect.top,
          targetY: rect.top + (ass ? ass.currentPos : 0),
          height: rect.height
        };
      });
      return { currentPos: ass?.currentPos, maxScroll: ass?.maxScroll, sections };
    })()
  `;
  const secRes = await send('Runtime.evaluate', { expression: getSections, returnByValue: true });
  console.log('Sections:', JSON.stringify(secRes.result.value, null, 2));

  // Let's scroll to target of section index 2 (manifesto introduction)
  const targetManifesto = secRes.result.value.sections[2].targetY;
  console.log('Scrolling to manifesto at Y:', targetManifesto);

  await send('Runtime.evaluate', {
    expression: `window.u.ASS.scrollTo(${targetManifesto}, false);`
  });

  // Wait 2.5 seconds for easing and animations to settle
  await new Promise(r => setTimeout(r, 2500));

  const checkState = `
    (() => {
      const c = window.u?.WebGL?._cones;
      return {
        sectionIndex: window.u?.sectionIndex,
        sectionProgress: window.u?.sectionProgress,
        posProgress: c?._simulationPos?.material?.uniforms?.u_progress?.value,
        posExplode: c?._simulationPos?.material?.uniforms?.u_explode?.value,
        posFactor: c?._simulationPos?.material?.uniforms?.u_factor?.value,
        basePos: c?._params?.basePosition,
        rotY: c?._material?.customUniforms[15]?.value?.y,
        rotZ: c?._material?.customUniforms[15]?.value?.z
      };
    })()
  `;
  const stateRes = await send('Runtime.evaluate', { expression: checkState, returnByValue: true });
  console.log('Manifesto State:', JSON.stringify(stateRes.result.value, null, 2));

  const shot = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync('c:\\TTProject\\frontend\\test_manifesto_bulb.png', Buffer.from(shot.data, 'base64'));
  console.log('Saved test_manifesto_bulb.png');

  chrome.kill();
  process.exit(0);
}
run().catch(e => { console.error(e); chrome.kill(); process.exit(1); });

