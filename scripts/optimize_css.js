const fs = require('fs');
const path = require('path');

function patchCss(filePath) {
  if (!fs.existsSync(filePath)) {
    console.log('Skipping missing file:', filePath);
    return;
  }
  let css = fs.readFileSync(filePath, 'utf8');
  let originalLen = css.length;

  // 1. Remove overflow:hidden from asscroll-container
  css = css.replace(
    'html:not(.is-touch) [asscroll-container]{overflow:hidden}',
    'html:not(.is-touch) [asscroll-container]{overflow:visible}'
  );

  // 2. Append guaranteed native scroll unblocker rules at the end of style.css
  const unblockRule = `
/* VERITAS ACCESSIBILITY & PERFORMANCE: UNBLOCK NATIVE SMOOTH SCROLL */
html, body {
  overflow-x: hidden !important;
  overflow-y: auto !important;
  scroll-behavior: smooth !important;
  height: auto !important;
  min-height: 100% !important;
  touch-action: pan-y !important;
  -webkit-overflow-scrolling: touch !important;
}
[asscroll-container], main, [asscroll], #root {
  overflow: visible !important;
  position: static !important;
  transform: none !important;
  height: auto !important;
  min-height: 100% !important;
}
.asscrollbar {
  display: none !important;
}
`;

  if (!css.includes('UNBLOCK NATIVE SMOOTH SCROLL')) {
    css += unblockRule;
    console.log(filePath, ': Appended native scroll unblocker rule');
  }

  fs.writeFileSync(filePath, css, 'utf8');
  console.log(filePath, ': Done. Length before:', originalLen, 'after:', css.length);
}

patchCss(path.join(__dirname, '../frontend/public/css/style.css'));
patchCss(path.join(__dirname, '../frontend/dist/css/style.css'));
