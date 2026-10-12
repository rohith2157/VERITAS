const fs = require('fs');
let html = fs.readFileSync('frontend/index.html', 'utf8');

const target = '<div class="js-section" section-name="manifesto">';
const replacement = '<div class="js-section" section-name="manifesto" anchor-target="manifesto">';

if (html.includes(target)) {
  html = html.replace(target, replacement);
  fs.writeFileSync('frontend/index.html', html, 'utf8');
  console.log('Successfully added anchor-target="manifesto" to index.html!');
} else {
  console.log('Target not found or already has anchor-target');
}

