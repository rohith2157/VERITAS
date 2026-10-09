const fs = require('fs');
const html = fs.readFileSync('frontend/index.html', 'utf8');

const targets = html.match(/anchor-target="[^"]+"/g);
console.log('anchor-targets in index.html:', targets);

const links = html.match(/anchor-link="[^"]+"/g);
console.log('anchor-links in index.html:', links);

