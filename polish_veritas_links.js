const fs = require('fs');
let html = fs.readFileSync('frontend/index.html', 'utf8');

// 1. og:image:alt and twitter:image:alt
html = html.replace(
  'The Dala logo above the headline &quot;Unlock collective wisdom&quot;, sitting on top of a 3D brain composed of many small pyramidal particles.',
  'The Veritas logo above the headline &quot;Unlock collective truth&quot;, sitting on top of a 3D constellation composed of many small pyramidal particles.'
);
html = html.replace(
  'The Dala logo above the headline &quot;Unlock collective wisdom&quot;, sitting on top of a 3D brain composed of many small pyramidal particles.',
  'The Veritas logo above the headline &quot;Unlock collective truth&quot;, sitting on top of a 3D constellation composed of many small pyramidal particles.'
);

// 2. Replace typeform hrefs with #studio
html = html.split('href="https://askdala.typeform.com/to/lSujgyr8"').join('href="#studio"');

// 3. Replace Blog with Research
html = html.replace(
  '<a class="nav__link js-nav-link" aria-label="Blog" href="https://medium.com/dala-ai" target="_blank" rel="noopener">Blog</a>',
  '<a class="nav__link js-nav-link" aria-label="Research" href="#manifesto">Research</a>'
);
html = html.replace(
  '<a class="footer__nav__link t-16 t-lh-1.2 t-14@xs t-lh-1.4@xs t-16@sm t-lh-1.2@sm -t-ls-0.025 t-600 t-uppercase | js-nav-link" href="https://medium.com/dala-ai" target="_blank" rel="noopener">Blog</a>',
  '<a class="footer__nav__link t-16 t-lh-1.2 t-14@xs t-lh-1.4@xs t-16@sm t-lh-1.2@sm -t-ls-0.025 t-600 t-uppercase | js-nav-link" href="#manifesto">Research</a>'
);

// 4. Social links
html = html.replace('href="https://www.linkedin.com/company/askdala/"', 'href="https://linkedin.com"');
html = html.replace('href="https://twitter.com/askdala"', 'href="https://twitter.com"');

fs.writeFileSync('frontend/index.html', html, 'utf8');
console.log('Successfully polished remaining metadata and navigation links in frontend/index.html');

