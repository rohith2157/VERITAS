const fs = require('fs');
const live = fs.readFileSync('c:/TTProject/frontend/live_theme.js', 'utf8');
const local = fs.readFileSync('c:/TTProject/frontend/public/scripts/theme.js', 'utf8');

console.log('Live len:', live.length);
console.log('Local len:', local.length);

let idxL = 0, idxC = 0;
let diffCount = 0;

while (idxL < live.length && idxC < local.length && diffCount < 20) {
  if (live[idxL] !== local[idxC]) {
    diffCount++;
    console.log(`\n=== Diff #${diffCount} ===`);
    console.log('Live at', idxL, ':', JSON.stringify(live.slice(idxL, idxL + 60)));
    console.log('Local at', idxC, ':', JSON.stringify(local.slice(idxC, idxC + 60)));

    // Sync
    let synced = false;
    for (let jump = 5; jump < 200; jump++) {
      const probe = live.slice(idxL + jump, idxL + jump + 25);
      const pos = local.indexOf(probe, idxC);
      if (pos !== -1 && pos - idxC < 300) {
        idxL += jump;
        idxC = pos;
        synced = true;
        break;
      }
    }
    if (!synced) {
      idxL += 20;
      idxC += 20;
    }
  } else {
    idxL++;
    idxC++;
  }
}
console.log('\nTotal diff count checked:', diffCount);

