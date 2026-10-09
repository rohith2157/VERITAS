const fs = require('fs');
let html = fs.readFileSync('frontend/index.html', 'utf8');

// Ensure variables.css is linked
if (!html.includes('/css/variables.css')) {
  html = html.replace('<link rel="stylesheet" href="/css/style.css', '<link rel="stylesheet" href="/css/variables.css"><link rel="stylesheet" href="/css/style.css');
}

// Update landing title from 150@md to 104@md and text to wisdom
html = html.replace(
  'landing__title t-56 t-80@xs t-104@sm t-150@md t-lh-0.9 -t-ls-0.03 t-400 mb-1.5 t-lh-1.1 mb-1" animate-from="preset: \'splitTextRotateIn\', delay: 0, duration: 1, scrollTrigger: { children: \'span\' }"><span class="d-block">Unlock</span> <span class="d-block">collective</span> <span class="d-block">truth.</span>',
  'landing__title t-56 t-80@xs t-104@sm t-104@md t-lh-0.9 -t-ls-0.03 t-400 mb-1.5 t-lh-1.1 mb-1" animate-from="preset: \'splitTextRotateIn\', delay: 0, duration: 1, scrollTrigger: { children: \'span\' }"><span class="d-block">Unlock</span> <span class="d-block">collective</span> <span class="d-block">wisdom.</span>'
);

// Update landing body copy to match DESIGN (11).md
html = html.replace(
  'Stop managing accusations. Start proving originality.',
  'Stop managing knowledge. Start using it.'
);
html = html.replace(
  'Plug into institutional-grade document intelligence. Ask Veritas to instantly verify originality across billions of academic sources, repositories, and AI synthetics. Focus on doing your best work with context, conviction and clarity.',
  'Plug into your team’s shared brainpower. Ask Dala to instantly find anything or anyone from any workplace system. Focus on doing your best work with context, conviction and clarity.'
);

// Update loader and footer headings to match DESIGN (11).md
html = html.replace(
  'Your institution has the standard.</div></div><div class="site-loader__heading-text"><div class="site-loader__heading-inner | js-site-loader-heading-text">Let Veritas uphold it.',
  'Your workplace has the answer.</div></div><div class="site-loader__heading-text"><div class="site-loader__heading-inner | js-site-loader-heading-text">Just ask Dala for it.'
);

html = html.replace(
  'Your institution has the standard. Let Veritas uphold it.',
  'Your workplace has the answer. Just ask Dala for it.'
);

fs.writeFileSync('frontend/index.html', html);
console.log('Successfully updated frontend/index.html with design folder specifications!');

