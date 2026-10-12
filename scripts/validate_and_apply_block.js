const fs = require('fs');

const rawBlock = fs.readFileSync('scripts/team_block_raw.html', 'utf8');
const newBlock = fs.readFileSync('scripts/team_block_new.html', 'utf8');
const indexHtml = fs.readFileSync('frontend/index.html', 'utf8');

// 1. Structural Invariance Checks
const requiredSelectors = [
  'team__head js-team-head',
  'team-slider | js-slider',
  'team-slider__slides | js-slides',
  'team-card | js-slide',
  'team-card__image | js-slide-image',
  'team-slider__content',
  'team-card__content | js-slide-content',
  'js-role',
  'js-name',
  'js-slider-prev',
  'js-slider-next'
];

for (const sel of requiredSelectors) {
  const countRaw = (rawBlock.match(new RegExp(sel.replace(/[|]/g, '\\|'), 'g')) || []).length;
  const countNew = (newBlock.match(new RegExp(sel.replace(/[|]/g, '\\|'), 'g')) || []).length;
  console.log(`Checking selector [${sel}]: Raw=${countRaw}, New=${countNew}`);
  if (countRaw !== countNew) {
    throw new Error(`Selector count mismatch for ${sel}: expected ${countRaw}, got ${countNew}`);
  }
}

// 2. Animate attributes check
const animRaw = (rawBlock.match(/animate-from/g) || []).length;
const animNew = (newBlock.match(/animate-from/g) || []).length;
console.log(`Checking animate-from count: Raw=${animRaw}, New=${animNew}`);
if (animRaw !== animNew) {
  throw new Error(`Animation attribute mismatch: expected ${animRaw}, got ${animNew}`);
}

// 3. Locate and replace in index.html
if (!indexHtml.includes(rawBlock)) {
  throw new Error('rawBlock could not be found verbatim in frontend/index.html');
}

const updatedHtml = indexHtml.replace(rawBlock, newBlock);
fs.writeFileSync('frontend/index.html', updatedHtml, 'utf8');
console.log('Successfully replaced team section in frontend/index.html!');

