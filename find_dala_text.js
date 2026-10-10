const fs = require('fs');
const html = fs.readFileSync('frontend/index.html', 'utf8');

// Strip tags and scripts to find visible text containing "Dala"
const regex = /[^>]*Dala[^<]*/gi;
let match;
console.log('--- VISIBLE OCCURRENCES OF DALA ---');
while ((match = regex.exec(html)) !== null) {
  const str = match[0].trim();
  if (str && !str.includes('dala-d.png') && !str.includes('dala_cookie') && !str.includes('dala.ai')) {
    console.log('Line around match:', str);
  }
}

