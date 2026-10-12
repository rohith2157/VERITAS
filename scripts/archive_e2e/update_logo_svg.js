const fs = require('fs');
let html = fs.readFileSync('frontend/index.html', 'utf8');

const oldLogoSvg = `<svg width="113" height="48" viewBox="0 0 113 48" fill="none" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">`;

// New Veritas logo SVG with geometric icon and PPNeueMontreal "Veritas" wordmark
const newHeaderLogoSvg = `<svg width="130" height="48" viewBox="0 0 130 48" fill="none" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"><image width="38.8085" height="48" xlink:href="/images/dala-d.png?id=ef5e37d64e9743b91d7e"/><g class="js-header-logo-text-group" clip-path="url(#textClipVeritas)"><text class="js-header-logo-text" x="44" y="30.5" fill="white" font-family="PPNeueMontreal, system-ui, -apple-system, sans-serif" font-size="21" font-weight="600" letter-spacing="-0.03em">Veritas</text></g><clipPath id="textClipVeritas"><rect width="90" height="36" x="38" fill="white" y="6"/></clipPath></svg>`;

const newFooterLogoSvg = `<svg width="130" height="48" viewBox="0 0 130 48" fill="none" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"><image width="38.8085" height="48" xlink:href="/images/dala-d.png?id=ef5e37d64e9743b91d7e"/><g class="js-header-logo-text-group" clip-path="url(#textClipFooterVeritas)"><text class="js-header-logo-text" x="44" y="30.5" fill="white" font-family="PPNeueMontreal, system-ui, -apple-system, sans-serif" font-size="21" font-weight="600" letter-spacing="-0.03em">Veritas</text></g><clipPath id="textClipFooterVeritas"><rect width="90" height="36" x="38" fill="white" y="6"/></clipPath></svg>`;

const regex = /<svg width="113" height="48" viewBox="0 0 113 48"[\s\S]*?<\/svg>/;

if (regex.test(html)) {
  html = html.replace(regex, newHeaderLogoSvg);
  console.log('Replaced header logo SVG');
}

if (regex.test(html)) {
  html = html.replace(regex, newFooterLogoSvg);
  console.log('Replaced footer logo SVG');
}

// Adjust header__logo and footer__logo width in style if needed
if (!html.includes('.header__logo { width: 8.5rem !important; }')) {
  const stylePatch = `
<style>
  .header__logo { width: 8.5rem !important; }
  .footer__logo { width: 8.5rem !important; }
</style>
`;
  html = html.replace('</head>', stylePatch + '</head>');
}

fs.writeFileSync('frontend/index.html', html, 'utf8');
console.log('Updated Veritas logos in frontend/index.html');

