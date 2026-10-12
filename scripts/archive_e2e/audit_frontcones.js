const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const port = 9701;
const chrome = spawn('C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', [
  '--headless=new',
  '--window-size=1440,900',
  '--remote-debugging-port=' + port,
  'http://localhost:5173/?skiploader'
]);

async function auditFrontConesDetails() {
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

  // Wait ready
  const waitReady = `
    new Promise((resolve) => {
      const check = () => {
        const fc = window.u?.WebGL?._frontCones;
        if (fc && fc._loaded) {
          resolve(true);
        } else {
          setTimeout(check, 100);
        }
      };
      check();
    })
  `;
  await send('Runtime.evaluate', { expression: waitReady, awaitPromise: true });

  const evalFC = `
    (() => {
      const fc = window.u?.WebGL?._frontCones;
      if (!fc) return { error: '_frontCones not found' };
      const mesh = fc._mesh;
      const geom = fc._geometry;
      const mat = fc._material;
      const arr = mesh.instanceMatrix.array;
      
      // Calculate scale from instance matrix col 0, 1, 2 lengths
      const sampleScales = [];
      for (let i = 0; i < Math.min(fc._nb, 10); i++) {
        const o = i * 16;
        const sx = Math.hypot(arr[o], arr[o+1], arr[o+2]);
        const sy = Math.hypot(arr[o+4], arr[o+5], arr[o+6]);
        const sz = Math.hypot(arr[o+8], arr[o+9], arr[o+10]);
        const px = arr[o+12];
        const py = arr[o+13];
        const pz = arr[o+14];
        sampleScales.push({ sx, sy, sz, px, py, pz });
      }

      const colorAttr = geom.getAttribute('a_color');
      const paramAttr = geom.getAttribute('a_param');
      const angleAttr = geom.getAttribute('a_angle');
      const posAttr = geom.getAttribute('position');
      const indexAttr = geom.getIndex();

      return {
        instanceCount: fc._nb,
        meshVisible: mesh.visible,
        hasWireframe: !!mat.wireframe,
        wireframeLinewidth: mat.wireframeLinewidth,
        transparent: mat.transparent,
        vertexColors: mat.vertexColors,
        vertexCount: posAttr ? posAttr.count : 0,
        triangleCount: indexAttr ? indexAttr.count / 3 : 0,
        attributes: Object.keys(geom.attributes),
        colorCount: colorAttr ? colorAttr.count : 0,
        sampleScales,
        uniforms: mat.customUniforms.map(u => ({ id: u.id, type: u.type, val: u.value })),
        basePosition: { x: fc._params.basePosition.x, y: fc._params.basePosition.y, z: fc._params.basePosition.z },
        position: { x: fc.position.x, y: fc.position.y, z: fc.position.z }
      };
    })()
  `;

  const fcResult = await send('Runtime.evaluate', { expression: evalFC, returnByValue: true });
  console.log('Front Cones Detailed Audit:\n', JSON.stringify(fcResult.result.value, null, 2));

  fs.writeFileSync(path.join(__dirname, 'frontcones_detailed_audit.json'), JSON.stringify(fcResult.result.value, null, 2));
  chrome.kill();
  process.exit(0);
}

auditFrontConesDetails().catch(e => {
  console.error(e);
  chrome.kill();
  process.exit(1);
});
