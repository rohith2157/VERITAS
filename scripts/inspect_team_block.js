const fs = require('fs');
const html = fs.readFileSync('frontend/index.html', 'utf8');
const start = html.indexOf('<div class="team__head');
const end = html.indexOf('<div class="investors">', start);
console.log('Start index:', start, 'End index:', end);
const block = html.substring(start, end);
console.log('Block length:', block.length);
console.log('First 200 chars:\n', block.slice(0, 200));
console.log('\nLast 200 chars:\n', block.slice(-200));
