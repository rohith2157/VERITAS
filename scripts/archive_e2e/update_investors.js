const fs = require('fs');
let html = fs.readFileSync('frontend/index.html', 'utf8');

for (let i = 1; i <= 5; i++) {
  const pattern = new RegExp(
    `<div class="investor__icon d-none@sm"[^>]*><img class="investor__icon__image" src="/images/investors/${i}.png"[^>]*><\\/div>\\s*<div class="investor__icon d-none d-block@sm"[^>]*><\\/div>`,
    'g'
  );
  const replacement = `<div class="investor__icon" animate-from="yPercent: 100, autoAlpha: 0, rotate: 14, ease: 'expo.out', duration: 1"><img class="investor__icon__image" src="/images/investors/${i}.png" alt="Partner Prism ${i}" loading="lazy"></div>`;
  html = html.replace(pattern, replacement);
}

fs.writeFileSync('frontend/index.html', html, 'utf8');
console.log('Successfully updated investor shape icons in index.html!');

