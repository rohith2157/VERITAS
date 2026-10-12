const fs = require('fs');
const code = fs.readFileSync('frontend/public/scripts/theme.js', 'utf8');

let idx = 0;
while ((idx = code.indexOf('show()', idx)) !== -1) {
  console.log('show() at', idx);
  console.log(code.substring(idx - 100, idx + 200));
  idx += 6;
}

