const { spawn } = require('child_process');
const fs = require('fs');
const os = require('os');
const port = 9695;
const chrome = spawn('C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', [
  '--headless=new',
  '--window-size=1440,900',
  '--remote-debugging-port=' + port,
  '--user-data-dir=' + os.tmpdir() + '/chrome-shape-' + Date.now(),
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
          c.activate({ delay: 0 });
          if (c._simulationPos) c._simulationPos.material.uniforms.u_show.value = 1;
          if (c._simulationSpring) c._simulationSpring.material.uniforms.u_show.value = 1;
          if (c._material) c._material.customUniforms[8].value = 1;
          if (c._depthMaterial) c._depthMaterial.customUniforms.u_show.value = 1;
          if (w._layer) w._layer.visible = false;
          resolve('ready');
        } else {
          setTimeout(check, 200);
        }
      };
      check();
    })
  `;
  await send('Runtime.evaluate', { expression: waitReady, awaitPromise: true });
  await new Promise(r => setTimeout(r, 3000));

  const shot = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync('c:\\TTProject\\frontend\\test_shape_size.png', Buffer.from(shot.data, 'base64'));
  console.log('Saved test_shape_size.png');

  chrome.kill();
  process.exit(0);
}
run().catch(err => { console.error('ERR:', err); chrome.kill(); process.exit(1); });
