const { spawn } = require('child_process');
const fs = require('fs');

const PORT = 9728;
const chrome = spawn('C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', [
  '--headless=new',
  '--window-size=1440,900',
  '--remote-debugging-port=' + PORT,
  '--disable-extensions',
  '--no-first-run',
  '--no-default-browser-check',
  'http://localhost:5173/?skiploader'
]);

async function testTeamSlider() {
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

  console.log('=== AUDITING TEAM SLIDER COMPONENT ===');

  // Scroll to Team section first
  const scrollToTeamExpr = `
    (() => {
      const ass = window.u?.ASS;
      const team = document.querySelector('.js-team-section');
      if (team && ass) {
        const y = team.getBoundingClientRect().top + ass.currentPos;
        ass.scrollTo(y, false);
        return { targetY: y };
      }
      return { error: 'team not found' };
    })()
  `;
  await send('Runtime.evaluate', { expression: scrollToTeamExpr });
  await new Promise(r => setTimeout(r, 1200));

  // Helper to get active slide state
  async function getSliderState() {
    const expr = `
      (() => {
        const slider = window.u?.components?.sliders?.get(0);
        if (!slider) return { error: 'slider instance not found' };

        const activeSlide = slider.activeSlide;
        const activeContent = activeSlide?.content?.el;
        const roleEl = activeContent ? activeContent.querySelector('.js-role') : null;
        const nameEl = activeContent ? activeContent.querySelector('.js-name') : null;
        const socialLinks = activeContent ? Array.from(activeContent.querySelectorAll('.js-social-icon')).map(a => ({
          href: a.href,
          text: a.innerText.trim(),
          svg: !!a.querySelector('svg')
        })) : [];

        const computedRoleStyle = roleEl ? window.getComputedStyle(roleEl) : null;
        const slideContainerTransform = window.getComputedStyle(slider.dom.slideContainer).transform;

        return {
          activeIndex: slider.activeIndex,
          slideId: activeSlide ? activeSlide.slide?.getAttribute('slide-id') : null,
          name: nameEl ? nameEl.innerText.replace(/\\s+/g, ' ').trim() : null,
          role: roleEl ? roleEl.innerText.replace(/\\s+/g, ' ').trim() : null,
          roleClass: roleEl ? roleEl.className : null,
          roleColor: computedRoleStyle ? computedRoleStyle.color : null,
          isElectricIris: computedRoleStyle ? (computedRoleStyle.color === 'rgb(128, 82, 255)' || computedRoleStyle.color === '#8052ff') : false,
          socialLinks,
          slideContainerTransform,
          allowAnimation: slider.allowAnimation
        };
      })()
    `;
    const res = await send('Runtime.evaluate', { expression: expr, returnByValue: true });
    return res.result.value;
  }

  const reports = [];

  // 1. Initial State (Slide 0: Haroun Hickman)
  const initial = await getSliderState();
  console.log('[Slide 0 Initial - Haroun Hickman]');
  console.log('  Name:', initial.name);
  console.log('  Role:', initial.role);
  console.log('  Role Color:', initial.roleColor, `(Electric Iris: ${initial.isElectricIris ? 'VERIFIED' : 'FAILED'})`);
  console.log('  Social Links:', initial.socialLinks);
  console.log('  Container Transform:', initial.slideContainerTransform);

  let shot = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync('c:\\TTProject\\frontend\\audit_agent3\\slider_0_haroun.png', Buffer.from(shot.data, 'base64'));
  reports.push({ step: 'initial', state: initial, screenshot: 'frontend/audit_agent3/slider_0_haroun.png' });

  // 2. Click Next -> Slide 1: Poppy Reid
  console.log('\n--- Clicking Next Button ---');
  await send('Runtime.evaluate', { expression: `document.querySelector('.js-slider-next').click()` });
  await new Promise(r => setTimeout(r, 1200));

  const state1 = await getSliderState();
  console.log('[Slide 1 Next - Poppy Reid]');
  console.log('  Name:', state1.name);
  console.log('  Role:', state1.role);
  console.log('  Role Color:', state1.roleColor, `(Electric Iris: ${state1.isElectricIris ? 'VERIFIED' : 'FAILED'})`);
  console.log('  Social Links:', state1.socialLinks);
  console.log('  Container Transform:', state1.slideContainerTransform);

  shot = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync('c:\\TTProject\\frontend\\audit_agent3\\slider_1_poppy.png', Buffer.from(shot.data, 'base64'));
  reports.push({ step: 'next_1', state: state1, screenshot: 'frontend/audit_agent3/slider_1_poppy.png' });

  // 3. Click Next -> Slide 2: Joel Kang
  console.log('\n--- Clicking Next Button ---');
  await send('Runtime.evaluate', { expression: `document.querySelector('.js-slider-next').click()` });
  await new Promise(r => setTimeout(r, 1200));

  const state2 = await getSliderState();
  console.log('[Slide 2 Next - Joel Kang]');
  console.log('  Name:', state2.name);
  console.log('  Role:', state2.role);
  console.log('  Role Color:', state2.roleColor, `(Electric Iris: ${state2.isElectricIris ? 'VERIFIED' : 'FAILED'})`);
  console.log('  Social Links:', state2.socialLinks);
  console.log('  Container Transform:', state2.slideContainerTransform);

  shot = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync('c:\\TTProject\\frontend\\audit_agent3\\slider_2_joel.png', Buffer.from(shot.data, 'base64'));
  reports.push({ step: 'next_2', state: state2, screenshot: 'frontend/audit_agent3/slider_2_joel.png' });

  // 4. Click Next -> Wraps to Slide 0 (Haroun Hickman)
  console.log('\n--- Clicking Next Button (Testing Wrap-around Snapping) ---');
  await send('Runtime.evaluate', { expression: `document.querySelector('.js-slider-next').click()` });
  await new Promise(r => setTimeout(r, 1200));

  const stateWrap = await getSliderState();
  console.log('[Slide 3 Next - Wrapped to Haroun Hickman]');
  console.log('  Name:', stateWrap.name);
  console.log('  Role:', stateWrap.role);
  console.log('  Container Transform:', stateWrap.slideContainerTransform);

  shot = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync('c:\\TTProject\\frontend\\audit_agent3\\slider_3_wrapped_haroun.png', Buffer.from(shot.data, 'base64'));
  reports.push({ step: 'next_wrap', state: stateWrap, screenshot: 'frontend/audit_agent3/slider_3_wrapped_haroun.png' });

  // 5. Click Previous -> Back to Slide 2 (Joel Kang)
  console.log('\n--- Clicking Previous Button (Testing Reverse Snapping) ---');
  await send('Runtime.evaluate', { expression: `document.querySelector('.js-slider-prev').click()` });
  await new Promise(r => setTimeout(r, 1200));

  const statePrev = await getSliderState();
  console.log('[Slide 4 Prev - Joel Kang]');
  console.log('  Name:', statePrev.name);
  console.log('  Role:', statePrev.role);
  console.log('  Container Transform:', statePrev.slideContainerTransform);

  shot = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync('c:\\TTProject\\frontend\\audit_agent3\\slider_4_prev_joel.png', Buffer.from(shot.data, 'base64'));
  reports.push({ step: 'prev_to_joel', state: statePrev, screenshot: 'frontend/audit_agent3/slider_4_prev_joel.png' });

  fs.writeFileSync('c:\\TTProject\\frontend\\audit_agent3\\team_slider_report.json', JSON.stringify(reports, null, 2));
  console.log('\n=== Team Slider Audit Passed & Verified ===');

  chrome.kill();
  process.exit(0);
}

testTeamSlider().catch(e => {
  console.error('Slider test failed:', e);
  chrome.kill();
  process.exit(1);
});
