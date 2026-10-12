const fs = require('fs');
const live = fs.readFileSync('c:/TTProject/frontend/live_style.css', 'utf8');
const local = fs.readFileSync('c:/TTProject/frontend/public/css/style.css', 'utf8');

console.log('Live style len:', live.length);
console.log('Local style len:', local.length);

console.log('Does local start with live?', local.startsWith(live));
if (local.startsWith(live)) {
  console.log('Local has extra bytes at end:', local.length - live.length);
  console.log('First 500 chars of extra content:');
  console.log(local.slice(live.length, live.length + 500));
} else {
  console.log('Local does not start with live!');
  let i = 0;
  while (i < live.length && live[i] === local[i]) i++;
  console.log('First diff at', i);
  console.log('Live:', live.slice(i, i + 60));
  console.log('Local:', local.slice(i, i + 60));
}

