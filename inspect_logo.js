const fs = require('fs');
const html = fs.readFileSync('frontend/index.html', 'utf8');

const regex = /<svg width="113" height="48" viewBox="0 0 113 48"[\s\S]*?<\/svg>/g;
const matches = html.match(regex);
console.log('Matches found:', matches ? matches.length : 0);
if (matches) {
  console.log('First match length:', matches[0].length);
}

