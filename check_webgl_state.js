const { spawn } = require('child_process');
const port = 9699;
const chrome = spawn('C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', [
  '--headless=new',
  '--window-size=1440,900',
  '--remote-debugging-port=' + port,
  'http://localhost:5173/?skiploader'
]);

async function checkState() {
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
  await send('Console.enable');

  // Wait ready
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
  await new Promise(r => setTimeout(r, 2000));

  const evalExpr = `
    (() => {
      const c = window.u?.WebGL?._cones;
      const w = window.u?.WebGL;
      return {
        loaded: c ? c._loaded : false,
        active: c ? c.active : false,
        position: c ? { x: c.position.x, y: c.position.y, z: c.position.z } : null,
        basePos: c ? { x: c._params.basePosition.x, y: c._params.basePosition.y, z: c._params.basePosition.z } : null,
        factor: c ? c._factor : null,
        scale: c ? c._scale : null,
        u_show: c && c._material ? c._material.customUniforms[8].value : null,
        u_factor: c && c._material ? c._material.customUniforms[3].value : null,
        u_scale: c && c._material ? c._material.customUniforms[5].value : null,
        u_explode: c && c._material ? c._material.customUniforms[12].value : null,
        sectionProgress: window.u?.sectionProgress
      };
    })()
  `;
  const result = await send('Runtime.evaluate', { expression: evalExpr, returnByValue: true });
  console.log('State:', JSON.stringify(result.result.value, null, 2));
  chrome.kill();
  process.exit(0);
}
checkState().catch(e => { console.error(e); chrome.kill(); process.exit(1); });

