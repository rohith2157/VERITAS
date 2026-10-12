const fs = require('fs');

const filePath = 'frontend/index.html';
let html = fs.readFileSync(filePath, 'utf8');

const replacements = [
  // 1. Title & Meta
  {
    target: '<title>Dala</title>',
    replacement: '<title>Veritas — Universal Document Originality &amp; Institutional Integrity Platform</title>',
    name: 'Page Title'
  },
  {
    target: '<meta name="description" content="Your workplace has the answer. Just ask Dala for it.">',
    replacement: '<meta name="description" content="Enterprise-grade document originality and academic integrity platform. Multi-engine winnowing fingerprinting, AST syntax forensics, and adversarial evasion detection.">',
    name: 'Meta Description'
  },
  {
    target: '<meta property="og:title" content="Dala">',
    replacement: '<meta property="og:title" content="Veritas — Universal Document Originality &amp; Integrity Platform">',
    name: 'OG Title'
  },
  {
    target: '<meta property="og:site_name" content="Your workplace has the answer. Just ask Dala for it.">',
    replacement: '<meta property="og:site_name" content="Veritas — Document Originality &amp; Integrity Platform">',
    name: 'OG Site Name'
  },
  {
    target: '<meta property="og:description" content="Your workplace has the answer. Just ask Dala for it.">',
    replacement: '<meta property="og:description" content="Universal document originality and academic integrity platform powered by winnowing fingerprinting, AST syntax forensics, and cryptographic audit ledgers.">',
    name: 'OG Description'
  },
  {
    target: '<meta name="twitter:title" content="Dala">',
    replacement: '<meta name="twitter:title" content="Veritas">',
    name: 'Twitter Title'
  },
  {
    target: '<meta name="twitter:description" content="Your workplace has the answer. Just ask Dala for it.">',
    replacement: '<meta name="twitter:description" content="Universal document originality and academic integrity platform.">',
    name: 'Twitter Description'
  },
  {
    target: '<meta name="twitter:site" content="@askdala">',
    replacement: '<meta name="twitter:site" content="@veritas_ai">',
    name: 'Twitter Site'
  },

  // 2. Site Loader
  {
    target: '<div class="site-loader__heading-inner | js-site-loader-heading-text">Your workplace has the answer.</div>',
    replacement: '<div class="site-loader__heading-inner | js-site-loader-heading-text">Institutional integrity has a new standard.</div>',
    name: 'Site Loader Line 1'
  },
  {
    target: '<div class="site-loader__heading-inner | js-site-loader-heading-text">Ask Dala to find it.</div>',
    replacement: '<div class="site-loader__heading-inner | js-site-loader-heading-text">Ask Veritas to verify it.</div>',
    name: 'Site Loader Line 2'
  },

  // 3. Screen Reader Brand
  {
    target: '<h1 class="sr">Dala</h1>',
    replacement: '<h1 class="sr">Veritas</h1>',
    name: 'SR H1'
  },
  {
    target: '<span class="sr">Dala</span>',
    replacement: '<span class="sr">Veritas</span>',
    all: true,
    name: 'SR Brand Name'
  },

  // 4. Hero / Landing Section
  {
    target: '<span class="d-block">Unlock</span> <span class="d-block">collective</span> <span class="d-block">wisdom.</span>',
    replacement: '<span class="d-block">Unlock</span> <span class="d-block">collective</span> <span class="d-block">truth.</span>',
    name: 'Hero Title'
  },
  {
    target: '<div class="t-16 t-lh-1.2 t-ls-0.05 t-600 t-uppercase mb-1 t-yellow" animate-from="preset: \'splitTextRotateIn\', rotate: 7, delay: 1, duration: 1">Stop managing knowledge. Start using it.</div>',
    replacement: '<div class="t-16 t-lh-1.2 t-ls-0.05 t-600 t-uppercase mb-1 t-yellow" animate-from="preset: \'splitTextRotateIn\', rotate: 7, delay: 1, duration: 1">STOP GUESSING SIMILARITY. START PROVING ORIGINALITY.</div>',
    name: 'Hero Eyebrow'
  },
  {
    target: 'Plug into your team’s shared brainpower. Ask Dala to instantly find anything or anyone from any workplace system. Focus on doing your best work with context, conviction and clarity.',
    replacement: 'Plug into institutional-grade document intelligence. Ask Veritas to instantly verify originality across billions of academic sources, code repositories, and AI synthetics. Focus on evaluating work with context, conviction, and absolute clarity.',
    name: 'Hero Paragraph'
  },

  // 5. Introduction Section
  {
    target: 'Make decisions with confidence',
    replacement: 'Make evaluations with confidence',
    name: 'Intro Title'
  },
  {
    target: 'Dala’s bleeding-edge AI search tool automates extracting knowledge from across your organisation so that you can take the guesswork out of your work.',
    replacement: 'Veritas unifies autonomous forensic engines in a single verification pipeline. While legacy tools check isolated strings, our architecture correlates structural AST code clones, cross-language homoglyphs, and synthetic AI perplexity in milliseconds.',
    name: 'Intro Paragraph'
  },

  // 6. Manifesto Chaos Block 1
  {
    target: 'This is your workplace today. Countless fragments of critical knowledge scattered across hundreds of disparate systems.',
    replacement: 'This is academic and institutional evaluation today. Countless fragments of critical submissions scattered across disparate legacy systems.',
    name: 'Chaos Block 1 - P1'
  },
  {
    target: '30% of your time is spent trying to organise and find the information and expertise you need to do your job.',
    replacement: '30% of evaluator hours are wasted cross-checking code duplicates and investigating disguised, paraphrased submissions.',
    name: 'Chaos Block 1 - P2'
  },

  // 7. Manifesto Chaos Block 2
  {
    target: 'The impossible battle to make sense of this chaos leaves your team feeling overwhelmed and unproductive.',
    replacement: 'The impossible battle to detect sophisticated evasion leaves evaluators overwhelmed, second-guessing black-box similarity scores.',
    name: 'Chaos Block 2 - P1'
  },
  {
    target: 'They’re confronted with the anxiety of bothering a busy coworker again, or aimlessly trying to connect the dots with incomplete context.',
    replacement: 'Instructors are confronted with the anxiety of false accusations, or aimlessly trying to prove collusion with incomplete context.',
    name: 'Chaos Block 2 - P2'
  },

  // 8. Manifesto Chaos Block 3
  {
    target: 'Existing solutions are cumbersome and quickly become outdated. Yet another decaying system that requires continuous maintenance.',
    replacement: 'Legacy scanners are easily bypassed by Cyrillic homoglyphs and AST refactoring. Yet another black-box system that requires continuous manual overrides.',
    name: 'Chaos Block 3 - P1'
  },
  {
    target: 'They fail to understand what you need from the vast amounts of information that your team creates every day.',
    replacement: 'They fail to explain why a submission was flagged, eroding the foundation of trust between educators, researchers, and students.',
    name: 'Chaos Block 3 - P2'
  },

  // 9. Manifesto - Lightbulb / Clarity
  {
    target: 'Spark lightbulb moments',
    replacement: 'Spark forensic clarity',
    name: 'Manifesto Title 1'
  },
  {
    target: 'Dala is your intelligent, real-time source of truth that eliminates the cultural, financial and operational struggles of splintered tools.',
    replacement: 'Veritas is your intelligent, real-time foundation of originality that eliminates the uncertainty and friction of black-box plagiarism checkers.',
    name: 'Manifesto 1 - P1'
  },
  {
    target: 'We connect your systems behind the scenes and pull together exactly the knowledge you require into an elegant contextual view.',
    replacement: 'We correlate multi-ngram winnowing, AST syntax trees, and cryptographically anchored submissions into an indisputable forensic view.',
    name: 'Manifesto 1 - P2'
  },
  {
    target: 'Just ask Dala for the answer that advances your work, and helps you make better decisions with more confidence.',
    replacement: 'Ask Veritas for the attribution proof that protects academic standards and empowers genuine intellectual discovery.',
    name: 'Manifesto 1 - P3'
  },

  // 10. Manifesto - World / Standard of Trust
  {
    target: 'Build a better world of work',
    replacement: 'Build a higher standard of trust',
    name: 'Manifesto Title 2'
  },
  {
    target: 'Our mission is to make work more coherent and delightful—reframing productivity from <em>doing more</em> to <a href="https://medium.com/dala-ai/why-we-started-dala-a36fc6cbbdb9" target="_blank" rel="noreferrer noopener"><em>being better<span class="t-white">.</span></em></a>',
    replacement: 'Our mission is to make scholarship transparent and verifiable—reframing integrity from <em>punitive surveillance</em> to <a href="#manifesto" rel="noreferrer noopener"><em>authentic learning<span class="t-white">.</span></em></a>',
    name: 'Manifesto 2 - P1'
  },
  {
    target: 'Your happiest and most purposeful moments at work are when you’re in flow, intellectually stimulated, and creating value for customers.',
    replacement: 'The most meaningful moments in education and research happen when original thought is recognized, rewarded, and protected.',
    name: 'Manifesto 2 - P2'
  },
  {
    target: 'We want to recreate that every time you experience Dala. A tool that is completely integrated with how you think, feel and work.',
    replacement: 'We engineered Veritas to uphold that promise: an enterprise-grade platform completely aligned with institutional rigor and fairness.',
    name: 'Manifesto 2 - P3'
  },

  // 11. Team Section Roles
  {
    target: '<span class="t-16 t-lh-1.2 t-ls-0.05 t-600 t-uppercase mb-1 t-purple | js-role">Co Founder &amp; CEO</span>',
    replacement: '<span class="t-16 t-lh-1.2 t-ls-0.05 t-600 t-uppercase mb-1 t-purple | js-role">Head of AI &amp; Detection Research</span>',
    name: 'Haroun Role'
  },
  {
    target: '<span class="t-16 t-lh-1.2 t-ls-0.05 t-600 t-uppercase mb-1 t-purple | js-role">Product Design Lead</span>',
    replacement: '<span class="t-16 t-lh-1.2 t-ls-0.05 t-600 t-uppercase mb-1 t-purple | js-role">VP of Product &amp; Institutional Integrity</span>',
    name: 'Poppy Role'
  },
  {
    target: '<span class="t-16 t-lh-1.2 t-ls-0.05 t-600 t-uppercase mb-1 t-purple | js-role">Co Founder &amp; CTO</span>',
    replacement: '<span class="t-16 t-lh-1.2 t-ls-0.05 t-600 t-uppercase mb-1 t-purple | js-role">Staff Engineer &amp; Core AST Forensics</span>',
    name: 'Joel Role'
  },

  // 12. Team Careers / Collaboration
  {
    target: 'We are actively hiring intentional, empathetic and curious people who thrive on creating delightful experiences. If you\'d like to be a part of the journey, email <a href="mailto:careers@dala.ai">careers@dala.ai</a> with your CV or portfolio, and a thoughtful note.',
    replacement: 'We are actively partnering with pioneering academic institutions, computer science faculties, and technical research labs. If you\'d like to deploy Veritas or benchmark your departmental codebase, get in touch at <a href="mailto:integrity@veritas.edu">integrity@veritas.edu</a>.',
    name: 'Team Collaboration Text'
  },
  {
    target: 'Read more about our values <a href="https://medium.com/dala-ai/why-we-wrote-our-values-before-we-wrote-a-single-line-of-code-99ada8a18cd5" target="_blank" rel="noreferrer noopener">here</a>.',
    replacement: 'Read our open benchmarking methodology and evasion robustness whitepaper <a href="#manifesto" rel="noreferrer noopener">here</a>.',
    name: 'Team Values Link'
  },

  // 13. Investors & Research Partners
  {
    target: '<h2 class="t-56 t-lh-1 t-64@sm t-lh-0.9@sm t-104@md -t-ls-0.03 t-400 mb-2@xs mb-1@sm mb-1.5@md" animate-from="preset: \'splitTextRotateIn\', rotate: 7, duration: 0.8, scrollTrigger: { start: \'top bottom\' }">Our investors</h2>',
    replacement: '<h2 class="t-56 t-lh-1 t-64@sm t-lh-0.9@sm t-104@md -t-ls-0.03 t-400 mb-2@xs mb-1@sm mb-1.5@md" animate-from="preset: \'splitTextRotateIn\', rotate: 7, duration: 0.8, scrollTrigger: { start: \'top bottom\' }">Research partners &amp; backers</h2>',
    name: 'Partners Heading'
  },
  {
    target: 'We are supported by some of the world&#39;s most pioneering operators and progressive funds to fuel our growth.',
    replacement: 'Backed by leading computer science institutions, academic integrity grants, and progressive venture partners to establish open originality standards.',
    name: 'Partners Subtext'
  },
  {
    target: '<div class="t-32 t-lh-1.25 -t-ls-0.03 t-400">Seedcamp</div></div>',
    replacement: '<div class="t-32 t-lh-1.25 -t-ls-0.03 t-400">Seedcamp</div><div class="t-16 t-lh-1.3 -t-ls-0.02 t-400 t-grey-4">Higher Education Research Alliance</div></div>',
    name: 'Partner 1 Subtitle'
  },
  {
    target: '<div class="t-16 t-lh-1.3 -t-ls-0.02 t-400 t-grey-4">Co-founder of Funding Circle</div>',
    replacement: '<div class="t-16 t-lh-1.3 -t-ls-0.02 t-400 t-grey-4">Global CS Consortium Benchmark</div>',
    name: 'Partner 2 Subtitle'
  },
  {
    target: '<div class="t-32 t-lh-1.25 -t-ls-0.03 t-400">Evening Fund</div></div>',
    replacement: '<div class="t-32 t-lh-1.25 -t-ls-0.03 t-400">Evening Fund</div><div class="t-16 t-lh-1.3 -t-ls-0.02 t-400 t-grey-4">Autonomous AI Integrity Foundation</div></div>',
    name: 'Partner 3 Subtitle'
  },
  {
    target: '<div class="t-32 t-lh-1.25 -t-ls-0.03 t-400">Valia Ventures</div></div>',
    replacement: '<div class="t-32 t-lh-1.25 -t-ls-0.03 t-400">Valia Ventures</div><div class="t-16 t-lh-1.3 -t-ls-0.02 t-400 t-grey-4">Open Academic Forensics Lab</div></div>',
    name: 'Partner 4 Subtitle'
  },
  {
    target: '<div class="t-16 t-lh-1.3 -t-ls-0.02 t-400 t-grey-4">Co-founder &amp; CPO at Personio</div>',
    replacement: '<div class="t-16 t-lh-1.3 -t-ls-0.02 t-400 t-grey-4">Enterprise LMS Federation Partner</div>',
    name: 'Partner 5 Subtitle'
  },

  // 14. Footer
  {
    target: '<h2 class="t-40 t-lh-1 t-48@sm t-lh-1.2@sm t-64@md t-lh-1.1@md -t-ls-0.03 t-400 mb-2" animate-from="preset: \'splitTextRotateIn\', scrollTrigger: { start: \'top bottom\' }">Your workplace has the answer. Ask Dala to find it.</h2>',
    replacement: '<h2 class="t-40 t-lh-1 t-48@sm t-lh-1.2@sm t-64@md t-lh-1.1@md -t-ls-0.03 t-400 mb-2" animate-from="preset: \'splitTextRotateIn\', scrollTrigger: { start: \'top bottom\' }">Academic integrity has a new standard. Ask Veritas to verify it.</h2>',
    name: 'Footer Heading'
  },
  {
    target: '© 2021 Dala Technologies Limited.',
    replacement: '© 2026 Veritas Technologies.',
    name: 'Footer Copyright'
  },
  {
    target: 'href="mailto:hello@dala.ai"',
    replacement: 'href="mailto:integrity@veritas.edu"',
    name: 'Footer Email Link'
  },

  // 15. Cookie Notice
  {
    target: 'This website uses cookies. <a href="#cookies"',
    replacement: 'This platform uses cookies for session authentication and ledger integrity. <a href="#cookies"',
    name: 'Cookie Notice Text'
  }
];

let successCount = 0;
let failCount = 0;

replacements.forEach(r => {
  if (r.all) {
    if (html.includes(r.target)) {
      html = html.split(r.target).join(r.replacement);
      console.log(`[OK - ALL] ${r.name}`);
      successCount++;
    } else {
      console.warn(`[FAIL] ${r.name} - target not found!`);
      failCount++;
    }
  } else {
    if (html.includes(r.target)) {
      html = html.replace(r.target, r.replacement);
      console.log(`[OK] ${r.name}`);
      successCount++;
    } else {
      console.warn(`[FAIL] ${r.name} - target not found!`);
      failCount++;
    }
  }
});

console.log(`\nResults: ${successCount} succeeded, ${failCount} failed.`);

if (failCount === 0) {
  fs.writeFileSync(filePath, html, 'utf8');
  console.log('Successfully wrote updated Veritas problem statement content to ' + filePath);
} else {
  console.error('Aborting write due to missing targets.');
  process.exit(1);
}

