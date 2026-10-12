const { spawn } = require('child_process');
const fs = require('fs');
const port = 9707;
const chrome = spawn('C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', [
  '--headless=new',
  '--window-size=1440,900',
  '--remote-debugging-port=' + port,
  'http://localhost:5173/?skiploader'
]);

async function testTeamSlider() {
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

  // Scroll to team
  const scrollToTeam = `
    (() => {
      const ass = window.u?.ASS;
      const team = document.querySelector('.team');
      if (team && ass) {
        const y = team.getBoundingClientRect().top + ass.currentPos;
        ass.scrollTo(y, false);
      }
    })()
  `;
  await send('Runtime.evaluate', { expression: scrollToTeam });
  await new Promise(r => setTimeout(r, 1200));

  // Click next button
  const clickNext = `
    (() => {
      const nextBtn = document.querySelector('.js-slider-next');
      if (nextBtn) {
        nextBtn.click();
        return 'clicked next';
      }
      return 'not found';
    })()
  `;
  const clickRes = await send('Runtime.evaluate', { expression: clickNext, returnByValue: true });
  console.log('Next button:', clickRes.result.value);
  await new Promise(r => setTimeout(r, 1000));

  const shot = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync('c:\\TTProject\\frontend\\test_team_slider_next.png', Buffer.from(shot.data, 'base64'));
  console.log('Saved test_team_slider_next.png');

  chrome.kill();
  process.exit(0);
}
testTeamSlider().catch(e => { console.error(e); chrome.kill(); process.exit(1); });

