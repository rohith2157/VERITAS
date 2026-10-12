const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const PORT = 9726;
const chrome = spawn('C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', [
  '--headless=new',
  '--window-size=1440,900',
  '--remote-debugging-port=' + PORT,
  '--disable-extensions',
  '--no-first-run',
  '--no-default-browser-check',
  'http://localhost:5173/?skiploader'
]);

async function runSectionAudit() {
  await new Promise(r => setTimeout(r, 2500));
  const res = await fetch(`http://localhost:${PORT}/json`);
  const tabs = await res.json();
  const target = tabs.find(t => t.type === 'page' && t.url.includes('5173'));
  if (!target) throw new Error('Target page not found: ' + JSON.stringify(tabs));
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
          if (data.error) {
            console.error('CDP Error for ' + method + ':', data.error);
            resolve({ error: data.error });
          } else {
            resolve(data.result || {});
          }
        }
      };
      ws.addEventListener('message', handler);
      ws.send(JSON.stringify({ id, method, params }));
    });
  }

  await send('Runtime.enable');
  await send('Page.enable');

  console.log('=== AUDITING ASScroll & SECTION CHOREOGRAPHY ===');

  const waitReady = `
    new Promise((resolve) => {
      const check = () => {
        const ass = window.u?.ASS;
        const w = window.u?.WebGL;
        if (ass && w && w._cones && w._cones._loaded) {
          w._cones.activate({ delay: 0, duration: 0.01 });
          if (w._layer) w._layer.visible = false;
          setTimeout(() => resolve({
            maxScroll: ass.maxScroll,
            currentPos: ass.currentPos,
            containerTag: ass.containerElement.tagName,
            ease: ass.controller?.ease
          }), 800);
        } else {
          setTimeout(check, 200);
        }
      };
      check();
    })
  `;
  const initData = await send('Runtime.evaluate', { expression: waitReady, awaitPromise: true, returnByValue: true });
  console.log('ASScroll Engine Status:', initData.result.value);

  const sections = [
    { id: '1_landing', getEl: () => document.querySelector('.landing'), name: '1. Landing ("Unlock collective wisdom.")' },
    { id: '2_introduction', getEl: () => document.querySelector('.introduction'), name: '2. Introduction ("Make decisions with confidence")' },
    { id: '3_manifesto_intro', getEl: () => document.querySelector('.manifesto--introduction-container'), name: '3. Manifesto Introduction ("This is your workplace today...")' },
    { id: '4_manifesto_clarity', getEl: () => document.querySelectorAll('.manifesto--section')[0], name: '4. Manifesto Clarity ("Spark lightbulb moments")' },
    { id: '5_manifesto_integrity', getEl: () => document.querySelectorAll('.manifesto--section')[1], name: '5. Manifesto Integrity ("Build a better world of work")' },
    { id: '6_team', getEl: () => document.querySelector('.js-team-section'), name: '6. Team ("Our team")' },
    { id: '7_investors', getEl: () => document.querySelector('.investors'), name: '7. Research Partners / Investors' },
    { id: '8_footer', getEl: () => document.querySelector('.footer'), name: '8. Footer ("Your workplace has the answer")' }
  ];

  const results = [];

  for (let idx = 0; idx < sections.length; idx++) {
    const sec = sections[idx];
    const evalExpr = `
      (() => {
        const ass = window.u?.ASS;
        let el;
        if (${idx} === 0) el = document.querySelector('.landing');
        else if (${idx} === 1) el = document.querySelector('.introduction');
        else if (${idx} === 2) el = document.querySelector('.manifesto--introduction-container');
        else if (${idx} === 3) el = document.querySelectorAll('.manifesto--section')[0];
        else if (${idx} === 4) el = document.querySelectorAll('.manifesto--section')[1];
        else if (${idx} === 5) el = document.querySelector('.js-team-section');
        else if (${idx} === 6) el = document.querySelector('.investors');
        else if (${idx} === 7) el = document.querySelector('.footer');

        if (!el || !ass) return { found: false };
        const rect = el.getBoundingClientRect();
        const targetY = rect.top + ass.currentPos;
        ass.scrollTo(targetY, false);
        return {
          found: true,
          targetY: Math.round(targetY),
          maxScroll: ass.maxScroll,
          currentPos: Math.round(ass.currentPos),
          boundingRect: {
            top: Math.round(rect.top),
            height: Math.round(rect.height),
            width: Math.round(rect.width)
          },
          previewText: el.innerText.trim().split('\\n')[0].substring(0, 70)
        };
      })()
    `;

    const resSec = await send('Runtime.evaluate', { expression: evalExpr, returnByValue: true });
    const val = resSec.result.value;

    // Allow ASScroll RAF and GSAP ScrollTrigger animations to settle
    await new Promise(r => setTimeout(r, 1200));

    // Capture screenshot
    const shot = await send('Page.captureScreenshot', { format: 'png' });
    const filename = `c:\\TTProject\\frontend\\audit_agent3\\section_${sec.id}.png`;
    fs.writeFileSync(filename, Buffer.from(shot.data, 'base64'));

    // Check active ScrollAnimations at this position
    const animCheck = `
      (() => {
        const sa = window.u?.ScrollAnimations;
        const activeTweens = (sa?.resizeTweens || []).filter(t => {
          const p = t.tween ? t.tween.progress() : 0;
          return p > 0 && p < 1;
        });
        const completedTweens = (sa?.resizeTweens || []).filter(t => {
          const p = t.tween ? t.tween.progress() : 0;
          return p >= 1;
        });
        return {
          totalTweens: sa?.resizeTweens?.length || 0,
          activeCount: activeTweens.length,
          completedCount: completedTweens.length,
          currentScrollPos: Math.round(window.u?.ASS?.currentPos || 0),
          sectionName: window.u?.sectionName
        };
      })()
    `;
    const animState = await send('Runtime.evaluate', { expression: animCheck, returnByValue: true });

    results.push({
      section: sec.name,
      targetY: val.targetY,
      boundingRect: val.boundingRect,
      previewText: val.previewText,
      animState: animState.result.value,
      screenshot: `frontend/audit_agent3/section_${sec.id}.png`
    });

    console.log(`[PASS] ${sec.name}`);
    console.log(`       Target Y: ${val.targetY}px | Active Section: "${animState.result.value.sectionName}"`);
    console.log(`       Text snippet: "${val.previewText}"`);
    console.log(`       Tweens (Completed: ${animState.result.value.completedCount}/${animState.result.value.totalTweens})`);
    console.log(`       Screenshot: section_${sec.id}.png\n`);
  }

  fs.writeFileSync('c:\\TTProject\\frontend\\audit_agent3\\sections_scroll_report.json', JSON.stringify(results, null, 2));
  console.log('Audit completed successfully. Full log saved to sections_scroll_report.json');

  chrome.kill();
  process.exit(0);
}

runSectionAudit().catch(e => {
  console.error('Section audit failed:', e);
  chrome.kill();
  process.exit(1);
});
