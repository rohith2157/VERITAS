const fs = require('fs');
let html = fs.readFileSync('frontend/index.html', 'utf8');
const before = html;
html = html.replace(/anchor-link="team">Team<\/button>/g, 'anchor-link="team">Pillars</button>');
if (html !== before) {
  fs.writeFileSync('frontend/index.html', html, 'utf8');
  console.log('Successfully updated Team button text to Pillars in header and footer navigation.');
} else {
  console.log('No replacement made.');
}
