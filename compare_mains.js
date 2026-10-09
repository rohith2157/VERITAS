const fs = require('fs');
const d = fs.readFileSync('c:/TTProject/frontend/dala.html', 'utf8');
const i = fs.readFileSync('c:/TTProject/frontend/index.html', 'utf8');

const dMain = d.slice(d.indexOf('<main>'), d.indexOf('</main>'));
const iMain = i.slice(i.indexOf('<main>'), i.indexOf('</main>'));

let pD = 0, pI = 0;
let count = 0;
while (pD < dMain.length && pI < iMain.length) {
  if (dMain[pD] !== iMain[pI]) {
    count++;
    console.log(`\n--- Diff #${count} ---`);
    console.log('dala.html :', JSON.stringify(dMain.slice(pD, pD + 80)));
    console.log('index.html:', JSON.stringify(iMain.slice(pI, pI + 80)));
    // Find next matching block of 25 chars
    let synced = false;
    for (let jump = 5; jump < 200; jump++) {
      const probeD = dMain.slice(pD + jump, pD + jump + 25);
      const matchInI = iMain.indexOf(probeD, pI);
      if (matchInI !== -1 && matchInI - pI < 300) {
        pD += jump;
        pI = matchInI;
        synced = true;
        break;
      }
    }
    if (!synced) {
      pD += 30;
      pI += 30;
    }
  } else {
    pD++;
    pI++;
  }
}

