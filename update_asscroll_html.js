const fs = require('fs');

let html = fs.readFileSync('frontend/index.html', 'utf8');

// 1. Ensure <main asscroll>
if (html.includes('<div asscroll-container><main>')) {
  html = html.replace('<div asscroll-container><main>', '<div asscroll-container><main asscroll>');
  console.log('[OK] Replaced <div asscroll-container><main> with <div asscroll-container><main asscroll>');
} else if (html.includes('<main>')) {
  html = html.replace('<main>', '<main asscroll>');
  console.log('[OK] Replaced <main> with <main asscroll>');
} else {
  console.log('[INFO] <main asscroll> already present or <main> not matched');
}

// 2. Add .asscrollbar element if not already present
const scrollbarMarkup = '<div class="asscrollbar"><div class="asscrollbar__handle"><div></div></div></div>';

if (!html.includes('class="asscrollbar"')) {
  // Place right after the script tags, before the studio modal / style or closing body
  const target = '<script>window.posthog={capture:function(){},identify:function(){},init:function(){},register:function(){},people:{set:function(){}}};</script>';
  if (html.includes(target)) {
    html = html.replace(target, target + '\n' + scrollbarMarkup);
    console.log('[OK] Inserted asscrollbar markup after posthog script');
  } else {
    html = html.replace('</body>', scrollbarMarkup + '\n</body>');
    console.log('[OK] Inserted asscrollbar markup before </body>');
  }
} else {
  console.log('[INFO] asscrollbar markup already present');
}

fs.writeFileSync('frontend/index.html', html, 'utf8');
console.log('Successfully updated frontend/index.html with ASScroll markup!');

