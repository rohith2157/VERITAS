const fs = require('fs');
const liveCss = fs.readFileSync('c:/TTProject/frontend/live_style.css', 'utf8');

const variablesCss = `
:root {
  --color-void: #000000;
  --color-bone-white: #ffffff;
  --color-ash-gray: #9a9a9a;
  --color-silver-mist: #bdbdbd;
  --color-electric-iris: #8052ff;
  --color-saffron-spark: #ffb829;
  --color-deep-verdant: #15846e;
  --font-ppneuemontreal: 'PPNeueMontreal', ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  --text-caption: 12px;
  --leading-caption: 1.5;
  --text-nav-label: 14px;
  --leading-nav-label: 1.2;
  --tracking-nav-label: 0.35px;
  --text-body: 18px;
  --leading-body: 1.5;
  --text-heading-2xs: 24px;
  --leading-heading-2xs: 1.25;
  --tracking-heading-2xs: -0.48px;
  --text-heading-xs: 27px;
  --leading-heading-xs: 1;
  --text-subheading: 36px;
  --leading-subheading: 1.2;
  --text-heading-sm: 42px;
  --leading-heading-sm: 1.2;
  --tracking-heading-sm: -1.68px;
  --text-heading: 48px;
  --leading-heading: 1.1;
  --tracking-heading: -1.68px;
  --text-heading-lg: 78px;
  --leading-heading-lg: 1.1;
  --tracking-heading-lg: -3.12px;
  --text-display: 113px;
  --leading-display: 1.1;
  --tracking-display: -4.52px;
  --font-weight-extralight: 200;
  --font-weight-regular: 400;
  --font-weight-semibold: 600;
  --font-weight-bold: 700;
  --spacing-unit: 6px;
  --spacing-6: 6px;
  --spacing-12: 12px;
  --spacing-18: 18px;
  --spacing-24: 24px;
  --spacing-30: 30px;
  --spacing-36: 36px;
  --spacing-60: 60px;
  --spacing-96: 96px;
  --spacing-120: 120px;
  --page-max-width: 1280px;
  --radius-3xl: 24px;
  --radius-full: 9999px;
  --radius-nav: 24px;
  --radius-tags: 9999px;
  --radius-cards: 24px;
  --radius-buttons: 24px;
  --surface-void-canvas: #000000;
  --surface-deep-verdant-tint: #15846e;
  --surface-electric-iris: #8052ff;
}

/* Veritas Studio Modal Overlay */
.veritas-studio-overlay {
  display: none;
  position: fixed;
  inset: 0;
  z-index: 10000;
  background: rgba(0, 0, 0, 0.92);
  backdrop-filter: blur(20px);
  overflow-y: auto;
  padding: 2rem 1.5rem;
  font-family: var(--font-ppneuemontreal);
}
.veritas-studio-overlay.active {
  display: block;
}
.veritas-studio-card {
  max-width: 1200px;
  margin: 0 auto;
  background: #0a0a0c;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 24px;
  padding: 2.5rem;
  box-shadow: 0 24px 64px rgba(0, 0, 0, 0.8);
}
`;

const combinedCss = variablesCss + '\n' + liveCss;
fs.writeFileSync('c:/TTProject/frontend/public/css/style.css', combinedCss);
console.log('Restored frontend/public/css/style.css cleanly! Total size:', combinedCss.length);

