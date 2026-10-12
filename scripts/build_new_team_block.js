const fs = require('fs');

const rawBlock = fs.readFileSync('scripts/team_block_raw.html', 'utf8');

// The 3 Core Pillars
const pillars = [
  {
    id: "Karp-Rabin Winnowing Core",
    image: "/images/1.png",
    alt: "Architectural Prism: Karp-Rabin Winnowing Core",
    role: "Deterministic Fingerprinting & SBERT Dense Vectors",
    name: "Karp-Rabin Winnowing Core",
    linkText1: "Studio",
    linkHref1: "#studio",
    linkText2: "Forensics",
    linkHref2: "#studio"
  },
  {
    id: "AST Syntax Normalizer",
    image: "/images/2.png",
    alt: "Architectural Prism: AST Syntax Normalizer Engine",
    role: "Syntactic Control-Flow & Homoglyph Evasion Detection",
    name: "AST Syntax Normalizer",
    linkText1: "Studio",
    linkHref1: "#studio",
    linkText2: "Trees",
    linkHref2: "#studio"
  },
  {
    id: "SHA-256 Merkle Ledger",
    image: "/images/3.png",
    alt: "Architectural Prism: SHA-256 Merkle Ledger Node",
    role: "Immutable Audit Proofs & Statutory Certificates",
    name: "SHA-256 Merkle Ledger",
    linkText1: "Ledger",
    linkHref1: "#ledger",
    linkText2: "Proofs",
    linkHref2: "#ledger"
  }
];

// Generate 18 slides (3 repeating 6 times)
let slidesHtml = '';
for (let repeat = 0; repeat < 6; repeat++) {
  for (const p of pillars) {
    slidesHtml += `<li class="team-card | js-slide" slide-id="${p.id}"><div class="team-card__inner"><img class="team-card__image | js-slide-image" src="${p.image}" alt="${p.alt}" loading="lazy"></div></li>`;
  }
}

// Generate 3 content items
let contentHtml = '';
for (const p of pillars) {
  contentHtml += `<li class="team-slider__content__item"><div class="team-card__content | js-slide-content" slide-id="${p.id}"><span class="t-16 t-lh-1.2 t-ls-0.05 t-600 t-uppercase mb-1 t-purple | js-role">${p.role}</span><h3 class="t-40 t-lh-1 t-56@md t-lh-0.9@md t-lh-1.2@md -t-ls-0.03 t-400 mb-1 | js-name">${p.name}</h3><div class="team-card__social"><a class="team-card__social__link | js-social-icon" href="${p.linkHref1}" title="Launch Studio for ${p.name}"><span class="sr">${p.linkText1}</span> <svg class="team-card__social__icon team-card__social__icon--twitter"><use xlink:href="images/svgsprite.svg#arrow"></use></svg> </a><a class="team-card__social__link | js-social-icon" href="${p.linkHref2}" title="Inspect Technical Ledger"><span class="sr">${p.linkText2}</span> <svg class="team-card__social__icon team-card__social__icon--linkedin"><use xlink:href="images/svgsprite.svg#arrow"></use></svg></a></div></div></li>`;
}

// Controls
const controlsHtml = `<div class="team-slider__controls"><button class="team-slider__control team-slider__previous | js-slider-prev" aria-label="Previous slide"><span class="sr">Previous</span><div class="team-slider__control-bg | js-slider-prev-bg"></div><div class="team-slider__control-hover | js-slider-prev-hover"></div><svg><use xlink:href="images/svgsprite.svg#arrow"></use></svg></button> <button class="team-slider__control team-slider__next | js-slider-next" aria-label="Next slide"><span class="sr">Next</span><div class="team-slider__control-bg | js-slider-next-bg"></div><div class="team-slider__control-hover | js-slider-next-hover"></div><svg><use xlink:href="images/svgsprite.svg#arrow"></use></svg></button></div>`;

// Bottom text block
const bottomCalloutHtml = `<div animate-from="y: '-5vw', scrollTrigger: { trigger: '.js-team-head', scrub: 0.5, once: false, start: 'top bottom' }"><h3 class="t-36 t-lh-1 -t-ls-0.03 t-400 mt-5@sm" animate-from="preset: 'splitTextRotateIn', rotate: 7, delay: 0.5, duration: 0.8, scrollTrigger: { start: 'top bottom' }">Mathematical Proof Over Heuristics.</h3><div class="team__body" animate-from="preset: 'splitTextRotateIn', rotate: 7, delay: 1, duration: 0.8, scrollTrigger: { start: 'top bottom' }, children: 'p'"><p class="t-20 t-lh-1.5 -t-ls-0.03 t-400">Legacy similarity checkers rely on opaque neural probabilities and brittle statistical heuristics. Veritas executes transparent, three-layer forensic verification: deterministic Karp-Rabin winnowing, AST syntactic tree canonicalization, and zero-knowledge cryptographic Merkle root anchoring.</p><p class="t-20 t-lh-1.5 -t-ls-0.03 t-400">Read our open UGC 2018 statutory benchmarking methodology and inspect real-time clone proofs <a href="#studio" rel="noreferrer noopener">here</a>.</p></div></div>`;

// Full replacement block
const newBlock = `<div class="team__head js-team-head" animate-mq="sm" animate-from="y: '-5vw', scrollTrigger: { scrub: 0.5, once: false, start: 'top bottom' }"><h2 class="t-56 t-lh-1 t-64@sm t-lh-0.9@sm t-104@md t-lh-1.1@md -t-ls-0.03 t-400 mb-2@xs mb-2.5@sm mb-3@md" animate-from="preset: 'splitTextRotateIn', scrollTrigger: { start: 'top bottom' }">Forensic Pillars</h2></div><div class="team-slider | js-slider"><div class="team-slider__slides-container"><ul class="team-slider__slides | js-slides">${slidesHtml}</ul></div><ul class="team-slider__content">${contentHtml}</ul>${controlsHtml}</div>${bottomCalloutHtml}</div>`;

fs.writeFileSync('scripts/team_block_new.html', newBlock, 'utf8');
console.log('Successfully generated new block. Length:', newBlock.length);

