const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const port = 9700;
const chrome = spawn('C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', [
  '--headless=new',
  '--window-size=1440,900',
  '--remote-debugging-port=' + port,
  'http://localhost:5173/?skiploader'
]);

async function runAudit() {
  await new Promise(r => setTimeout(r, 2000));
  const res = await fetch('http://localhost:' + port + '/json');
  const tabs = await res.json();
  const target = tabs.find(t => t.url.includes('5173'));
  if (!target) {
    throw new Error('Could not find target tab');
  }
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

  // Wait ready
  const waitReady = `
    new Promise((resolve) => {
      const check = () => {
        const c = window.u?.WebGL?._cones;
        const fc = window.u?.WebGL?._frontCones;
        const w = window.u?.WebGL;
        if (c && c._loaded && fc && fc._loaded && w) {
          c.activate({ delay: 0 });
          if (c._simulationPos) c._simulationPos.material.uniforms.u_show.value = 1;
          if (c._simulationSpring) c._simulationSpring.material.uniforms.u_show.value = 1;
          if (c._material) c._material.customUniforms[8].value = 1;
          if (c._depthMaterial) c._depthMaterial.customUniforms.u_show.value = 1;
          if (w._layer) w._layer.visible = false;
          resolve({
            conesLoaded: c._loaded,
            frontConesLoaded: fc._loaded,
            conesCount: c._nb,
            frontConesCount: fc._nb
          });
        } else {
          setTimeout(check, 100);
        }
      };
      check();
    })
  `;
  const initResult = await send('Runtime.evaluate', { expression: waitReady, awaitPromise: true, returnByValue: true });
  console.log('Init status:', JSON.stringify(initResult.result.value, null, 2));

  // Let simulation settle for a moment
  await new Promise(r => setTimeout(r, 2000));

  // Step 1 & 3: Audit _frontCones
  const auditFrontCones = `
    (() => {
      const fc = window.u?.WebGL?._frontCones;
      if (!fc) return { error: '_frontCones not found' };
      const mesh = fc._mesh;
      const geom = fc._geometry;
      const mat = fc._material;
      
      // Check instance scales
      const dummy = new THREE.Matrix4();
      const pos = new THREE.Vector3();
      const rot = new THREE.Quaternion();
      const scale = new THREE.Vector3();
      const scales = [];
      for (let i = 0; i < Math.min(fc._nb, 10); i++) {
        mesh.getMatrixAt(i, dummy);
        dummy.decompose(pos, rot, scale);
        scales.push({ x: scale.x, y: scale.y, z: scale.z });
      }

      return {
        count: fc._nb,
        meshVisible: mesh ? mesh.visible : false,
        wireframe: mat ? !!mat.wireframe : false,
        vertexColors: mat ? mat.vertexColors : false,
        materialTransparent: mat ? mat.transparent : false,
        geometryAttributes: geom ? Object.keys(geom.attributes) : [],
        vertexCount: geom ? geom.attributes.position.count : 0,
        sampleScales: scales,
        basePosition: { x: fc._params.basePosition.x, y: fc._params.basePosition.y, z: fc._params.basePosition.z },
        position: { x: fc.position.x, y: fc.position.y, z: fc.position.z },
        customUniforms: mat && mat.customUniforms ? mat.customUniforms.map(u => ({ id: u.id, type: u.type, val: u.value })) : []
      };
    })()
  `;
  const fcAudit = await send('Runtime.evaluate', { expression: auditFrontCones, returnByValue: true });
  console.log('_frontCones audit:', JSON.stringify(fcAudit.result.value, null, 2));

  // Step 2 & 4: Sweep u.sectionProgress across 0, 1.0, 1.8, 2.0, 3.4, 4.0, 5.0, 5.9, 6.0
  const progressTestPoints = [0.0, 1.0, 1.8, 2.0, 3.4, 4.0, 5.0, 5.9, 6.0];
  const auditResults = [];

  for (const p of progressTestPoints) {
    const setP = `
      (() => {
        window.u.sectionProgress = ${p};
        const c = window.u.WebGL._cones;
        const fc = window.u.WebGL._frontCones;
        // Run update logic synchronously multiple frames to let easing converge
        for (let i = 0; i < 60; i++) {
          c._updateRotation();
          c._updatePosition();
          fc._updatePosition();
        }
        return {
          sectionProgress: window.u.sectionProgress,
          u_show: c._material.customUniforms[8].value,
          u_explode: c._material.customUniforms[13].value,
          sim_explode: c._simulationPos.material.uniforms.u_explode.value,
          u_progress: c._material.customUniforms[14].value,
          sim_progress: c._simulationPos.material.uniforms.u_progress.value,
          u_factor: c._material.customUniforms[3].value,
          sim_factor: c._simulationPos.material.uniforms.u_factor.value,
          u_scale: c._material.customUniforms[5].value,
          basePosition: {
            x: c._params.basePosition.x,
            y: c._params.basePosition.y,
            z: c._params.basePosition.z
          },
          u_offset: {
            x: c._material.customUniforms[12].value.x,
            y: c._material.customUniforms[12].value.y,
            z: c._material.customUniforms[12].value.z
          },
          rotX: c._material.customUniforms[15].value.x,
          rotY: c._material.customUniforms[15].value.y,
          rotZ: c._material.customUniforms[15].value.z,
          fc_basePosX: fc._params.basePosition.x,
          fc_posX: fc.position.x
        };
      })()
    `;
    const resPoint = await send('Runtime.evaluate', { expression: setP, returnByValue: true });
    auditResults.push(resPoint.result.value);

    // Let renderer draw 5 frames
    await new Promise(r => setTimeout(r, 200));

    // Capture screenshot at key points
    let shotName = null;
    if (p === 0.0) shotName = 'audit_fbo_target1_brain_p0.png';
    else if (p === 1.8) shotName = 'audit_fbo_target2_lightbulb_p1_8.png';
    else if (p === 2.0) shotName = 'audit_fbo_target2_lightbulb_p2.png';
    else if (p === 3.4) shotName = 'audit_fbo_target3_sphere_p3_4.png';
    else if (p === 4.0) shotName = 'audit_fbo_explode_investors_p4.png';
    else if (p === 6.0) shotName = 'audit_fbo_target4_converging_core_p6.png';

    if (shotName) {
      const screenshot = await send('Page.captureScreenshot', { format: 'png' });
      fs.writeFileSync(path.join(__dirname, shotName), Buffer.from(screenshot.data, 'base64'));
      console.log(`Saved screenshot: ${shotName}`);
    }
  }

  // Check frame render stability & FPS
  const fpsExpr = `
    new Promise((resolve) => {
      let frames = 0;
      const start = performance.now();
      const fn = () => {
        frames++;
        if (performance.now() - start < 1000) {
          requestAnimationFrame(fn);
        } else {
          resolve({
            fps: frames,
            deltaTime: window.u?.WebGL?.deltaTime || window.O?.deltaTime,
            rendererInfo: {
              calls: window.u?.WebGL?.renderer?.info?.render?.calls,
              triangles: window.u?.WebGL?.renderer?.info?.render?.triangles,
              geometries: window.u?.WebGL?.renderer?.info?.memory?.geometries,
              textures: window.u?.WebGL?.renderer?.info?.memory?.textures
            }
          });
        }
      };
      requestAnimationFrame(fn);
    })
  `;
  const fpsResult = await send('Runtime.evaluate', { expression: fpsExpr, awaitPromise: true, returnByValue: true });
  console.log('FPS & Render stability:', JSON.stringify(fpsResult.result.value, null, 2));

  fs.writeFileSync(path.join(__dirname, 'audit_uniforms_summary.json'), JSON.stringify({
    frontCones: fcAudit.result.value,
    sweep: auditResults,
    stability: fpsResult.result.value
  }, null, 2));

  console.log('Audit completed successfully.');
  chrome.kill();
  process.exit(0);
}

runAudit().catch(err => {
  console.error('Audit failed:', err);
  chrome.kill();
  process.exit(1);
});
