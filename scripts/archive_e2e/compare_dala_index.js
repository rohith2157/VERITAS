const fs = require('fs');
const d = fs.readFileSync('c:/TTProject/frontend/dala.html', 'utf8');
const i = fs.readFileSync('c:/TTProject/frontend/index.html', 'utf8');

function getSections(html) {
  const parts = html.split('<div');
  return parts
    .filter(p => p.includes('js-section'))
    .map(p => '<div' + p.slice(0, p.indexOf('>')) + '>');
}

console.log('dala.html js-sections:');
getSections(d).forEach((s, idx) => console.log(idx, s));

console.log('\nindex.html js-sections:');
getSections(i).forEach((s, idx) => console.log(idx, s));

