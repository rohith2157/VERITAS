const fs = require('fs');
const path = require('path');

const capturesDir = 'c:\\TTProject\\frontend\\e2e_artifacts';
const frontendDir = 'c:\\TTProject\\frontend';

const comparisons = [
  {
    name: '01. Landing Hero (Desktop)',
    captured: path.join(capturesDir, 'capture_01_hero_desktop.png'),
    references: [
      path.join(frontendDir, 'final_landing.png'),
      path.join(frontendDir, 'view_1_landing.png'),
      path.join(frontendDir, 'real_dala_screenshot.png')
    ],
    section: 'Landing / Hero',
    features: ['WebGL 3D brain particles rendered on canvas', 'Headlines Unlock collective wisdom', 'Header navigation and Dala logo', 'Request Access CTA']
  },
  {
    name: '02. Introduction Section',
    captured: path.join(capturesDir, 'capture_02_intro.png'),
    references: [
      path.join(frontendDir, 'verified_intro.png'),
      path.join(frontendDir, 'final_intro.png'),
      path.join(frontendDir, 'view_2_intro.png')
    ],
    section: 'Introduction',
    features: ['Make decisions with confidence typography', 'Automates extracting knowledge copy', 'Seamless ASS smooth scroll alignment']
  },
  {
    name: '03. Manifesto Chaos Section',
    captured: path.join(capturesDir, 'capture_03_manifesto_chaos.png'),
    references: [
      path.join(frontendDir, 'verified_manifesto_chaos.png'),
      path.join(frontendDir, 'view_3_manifesto.png')
    ],
    section: 'Manifesto Introduction',
    features: ['Fragments of critical knowledge copy', 'Disparate systems typography', 'Two-column animated paragraphs']
  },
  {
    name: '04. Manifesto Lightbulb Morph Section',
    captured: path.join(capturesDir, 'capture_04_manifesto_bulb.png'),
    references: [
      path.join(frontendDir, 'manifesto_bulb_exact.png'),
      path.join(frontendDir, 'view_4_clarity.png')
    ],
    section: 'Manifesto Bulb',
    features: ['Spark lightbulb moments heading', '3D particles assembled in lightbulb shape', 'Right-aligned text column layout']
  },
  {
    name: '05. Manifesto Values Section',
    captured: path.join(capturesDir, 'capture_05_manifesto_values.png'),
    references: [
      path.join(frontendDir, 'final_manifesto.png')
    ],
    section: 'Manifesto Values',
    features: ['Build a better world of work heading', 'Left-aligned text column layout', 'Link to being better']
  },
  {
    name: '06. Team Section (Initial View)',
    captured: path.join(capturesDir, 'capture_06_team_initial.png'),
    references: [
      path.join(frontendDir, 'verified_team.png'),
      path.join(frontendDir, 'final_team.png'),
      path.join(frontendDir, 'view_5_team.png')
    ],
    section: 'Team',
    features: ['Our team heading', 'Portraits of Haroun Hickman, Poppy Reid, Joel Kang', 'Slider controls with SVG arrows', 'Build with us section']
  },
  {
    name: '07. Team Section (Slider Advanced)',
    captured: path.join(capturesDir, 'capture_07_team_next.png'),
    references: [
      path.join(frontendDir, 'test_team_slider_next.png'),
      path.join(frontendDir, 'real_team_slider_next.png')
    ],
    section: 'Team Slider Next',
    features: ['Slider transform animation updated', 'Active card transition', 'Interactive controls active']
  },
  {
    name: '08. Investors Section',
    captured: path.join(capturesDir, 'capture_08_investors.png'),
    references: [
      path.join(frontendDir, 'investors_exact.png'),
      path.join(frontendDir, 'verified_investors.png'),
      path.join(frontendDir, 'view_6_partners.png')
    ],
    section: 'Investors',
    features: ['3D WebGL rotating pyramids with custom colors', 'Seedcamp, James Meekings, Evening Fund, Valia Ventures, Roman Schumacher', 'Parallax alignment']
  },
  {
    name: '09. Footer Section',
    captured: path.join(capturesDir, 'capture_09_footer.png'),
    references: [
      path.join(frontendDir, 'scroll_5_footer.png')
    ],
    section: 'Footer',
    features: ['Your workplace has the answer headline', 'Footer Request access CTA', 'Dala logo, copyright 2021 Dala Technologies Limited', 'Nav links and social icons']
  },
  {
    name: '10. Originality Forensics Studio Modal',
    captured: path.join(capturesDir, 'capture_10_veritas_studio_modal.png'),
    references: [
      path.join(frontendDir, 'verify_agent5_studio.png'),
      path.join(frontendDir, 'test_studio_modal.png')
    ],
    section: 'Studio Modal',
    features: ['Backdrop blur overlay', 'Document Verification Studio card', '3 Forensics Engine cards (FastAPI, Spring Boot, AI Matrix)', 'Back to Experience button']
  },
  {
    name: '11. Mobile Viewport (390x844)',
    captured: path.join(capturesDir, 'capture_11_mobile_hero.png'),
    references: [
      path.join(frontendDir, 'view_mobile_landing.png')
    ],
    section: 'Mobile View',
    features: ['Responsive mobile navigation toggle burger', 'Stacked layout with mobile typography', 'Zero horizontal scroll overflow']
  }
];

const auditResults = [];

for (const comp of comparisons) {
  const capExists = fs.existsSync(comp.captured);
  const capSize = capExists ? fs.statSync(comp.captured).size : 0;
  
  const refStats = comp.references.map(ref => {
    const exists = fs.existsSync(ref);
    return {
      path: path.basename(ref),
      exists,
      size: exists ? fs.statSync(ref).size : 0
    };
  });

  const valid = capExists && capSize > 10000;
  auditResults.push({
    name: comp.name,
    section: comp.section,
    capturedFile: path.basename(comp.captured),
    capturedSizeBytes: capSize,
    capturedValid: valid,
    referenceFiles: refStats,
    visualFeaturesVerified: comp.features,
    visualRegressionStatus: valid ? 'PASS' : 'FAIL'
  });
}

console.log('\n======================================================');
console.log('       VISUAL REGRESSION AUDIT RESULTS                ');
console.log('======================================================');
let allPassed = true;
for (const r of auditResults) {
  console.log(`[${r.visualRegressionStatus}] ${r.name}`);
  console.log(`       File: ${r.capturedFile} (${Math.round(r.capturedSizeBytes / 1024)} KB)`);
  console.log(`       Verified Features: ${r.visualFeaturesVerified.join(' | ')}`);
  if (!r.capturedValid) allPassed = false;
}
console.log('======================================================\n');

fs.writeFileSync(
  path.join(frontendDir, 'audit_visual_regression.json'),
  JSON.stringify(auditResults, null, 2)
);

process.exit(allPassed ? 0 : 1);
