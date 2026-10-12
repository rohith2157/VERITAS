const fs = require('fs');
const html = fs.readFileSync('frontend/index.html', 'utf8');
const start = html.indexOf('<div class="team__head');
const end = html.indexOf('<div class="investors">', start);
const block = html.substring(start, end);
fs.writeFileSync('scripts/team_block_raw.html', block, 'utf8');
console.log('Saved raw team block to scripts/team_block_raw.html, length:', block.length);

