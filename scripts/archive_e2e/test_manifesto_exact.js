const { spawn } = require('child_process');
const fs = require('fs');
const port = 9709;
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

  // Scroll to Y = 2050
  await send('Runtime.evaluate', { expression: 'window.u.ASS.scrollTo(2050, false);' });
  await new Promise(r => setTimeout(r, 2500));

  const stateRes = await send('Runtime.evaluate', {
    expression: `JSON.stringify({
      y: window.u.ASS.currentPos,
      sectionProgress: window.u.sectionProgress,
      posProgress: window.u.WebGL._cones._simulationPos.material.uniforms.u_progress.value,
      posExplode: window.u.WebGL._cones._simulationPos.material.uniforms.u_explode.value,
      rotY: window.u.WebGL._cones._material.customUniforms[15].value.y,
      rotZ: window.u.WebGL._cones._material.customUniforms[15].value.z
    })`,
    returnByValue: true
  });
  console.log('At 2050:', stateRes.result.value);

  const shot = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync('c:\\TTProject\\frontend\\manifesto_bulb_exact.png', Buffer.from(shot.data, 'base64'));
  console.log('Saved manifesto_bulb_exact.png');

  chrome.kill();
  process.exit(0);
}
run().catch(e => { console.error(e); chrome.kill(); process.exit(1); });

