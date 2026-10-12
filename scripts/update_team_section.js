const fs = require('fs');
const path = require('path');

const indexPath = path.join(__dirname, '../frontend/index.html');
let html = fs.readFileSync(indexPath, 'utf8');

// Find boundaries of team section
const teamStartStr = '<div class="section js-section js-team-section mb-1" section-name="team" anchor-target="team">';
const teamStartIndex = html.indexOf(teamStartStr);

if (teamStartIndex === -1) {
  console.error('Could not find team section start in index.html');
  process.exit(1);
}

const investorsStartStr = '<div class="investors">';
const investorsIndex = html.indexOf(investorsStartStr, teamStartIndex);

if (investorsIndex === -1) {
  console.error('Could not find investors start in index.html');
  process.exit(1);
}

const arsArchitectureHtml = `<div class="section js-section js-team-section mb-1" section-name="team" anchor-target="team" style="padding-top: 5rem; padding-bottom: 5rem;">
  <div class="team" style="max-width: 1400px; margin: 0 auto; width: 100%; pointer-events: auto;">
    <!-- Section Header -->
    <div class="team__head js-team-head" style="margin-bottom: 3.5rem;">
      <div style="display: inline-flex; align-items: center; gap: 8px; background: rgba(255, 184, 41, 0.12); border: 1px solid rgba(255, 184, 41, 0.3); padding: 6px 14px; border-radius: 9999px; margin-bottom: 1rem;">
        <span style="width: 8px; height: 8px; border-radius: 50%; background: #ffb829; display: inline-block;"></span>
        <span style="color: #ffb829; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em;">ACADEMIC RESEARCH SKILLS (ARS) FORENSICS</span>
      </div>
      <h2 class="t-56 t-lh-1 t-64@sm t-lh-1.2@sm t-104@md t-lh-1.1@md -t-ls-0.03 t-400 mb-1.5" style="color: #ffffff;">
        ARS Forensics Architecture
      </h2>
      <p class="t-20 t-lh-1.5 -t-ls-0.03 t-200" style="color: #bdbdbd; max-width: 860px; margin: 0;">
        Autonomous evidence-based academic integrity system. Replacing black-box similarity scores with a 10-stage forensic pipeline, Socratic pre-submission defense, and 7-agent simulated peer review.
      </p>
    </div>

    <!-- 3 Architecture Pillars Grid -->
    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 1.75rem; margin-bottom: 3rem;">
      
      <!-- Card 1: /ars-pipeline -->
      <div class="veritas-ars-card" style="background: rgba(255, 255, 255, 0.03); border: 1px solid rgba(128, 82, 255, 0.3); border-radius: 20px; padding: 2rem; display: flex; flex-direction: column; justify-content: space-between; transition: all 0.25s ease; position: relative; overflow: hidden;">
        <div style="position: absolute; top: 0; left: 0; right: 0; height: 3px; background: linear-gradient(90deg, #8052ff, #a37aff);"></div>
        <div>
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.25rem;">
            <span style="background: rgba(128, 82, 255, 0.18); color: #8052ff; border: 1px solid rgba(128, 82, 255, 0.4); padding: 4px 10px; border-radius: 9999px; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em;">10-STAGE PIPELINE</span>
            <span style="color: #bdbdbd; font-size: 12px; font-family: monospace;">STAGE 01 — 10</span>
          </div>
          <h3 style="font-size: 28px; font-weight: 400; color: #ffffff; margin: 0 0 0.5rem 0; letter-spacing: -0.02em;">/ars-pipeline</h3>
          <div style="color: #a37aff; font-size: 14px; font-weight: 500; margin-bottom: 1rem;">Autonomous Forensics & Cryptographic Ingestion</div>
          <p style="color: #9a9a9a; font-size: 14px; line-height: 1.6; margin: 0 0 1.5rem 0; font-weight: 300;">
            Multi-modal ingestion of PDF, Word DOCX, and LaTeX submissions. Executes Rabin-Karp winnowing (<code style="color: #8052ff;">w=4, k=5</code>), cross-language AST clone normalization (Python/C++), Zhao et al. 2026 citation audits, and tamper-evident SHA-256 Merkle ledger anchoring.
          </p>
        </div>
        <div>
          <div style="background: rgba(0, 0, 0, 0.5); border: 1px solid rgba(255, 255, 255, 0.06); border-radius: 12px; padding: 12px 16px; margin-bottom: 1.25rem;">
            <div style="display: flex; justify-content: space-between; font-size: 12px; margin-bottom: 6px;">
              <span style="color: #bdbdbd;">Hash Latency</span>
              <span style="color: #15846e; font-weight: 600; font-family: monospace;">&lt; 12ms / 10k tokens</span>
            </div>
            <div style="display: flex; justify-content: space-between; font-size: 12px; margin-bottom: 6px;">
              <span style="color: #bdbdbd;">Syntax Normalizer</span>
              <span style="color: #8052ff; font-weight: 600; font-family: monospace;">AST Tree Clones (C++, Py)</span>
            </div>
            <div style="display: flex; justify-content: space-between; font-size: 12px;">
              <span style="color: #bdbdbd;">Audit Anchoring</span>
              <span style="color: #ffb829; font-weight: 600; font-family: monospace;">SHA-256 Merkle Block</span>
            </div>
          </div>
          <a href="#studio" class="btn t-14 t-600 t-uppercase" style="width: 100%; text-decoration: none; justify-content: center; background: #8052ff; border-radius: 20px;">
            <span class="btn__text pointer-events-none">Inspect Pipeline Engine</span>
            <div class="btn__hover pointer-events-none"></div>
          </a>
        </div>
      </div>

      <!-- Card 2: /ars-plan -->
      <div class="veritas-ars-card" style="background: rgba(255, 255, 255, 0.03); border: 1px solid rgba(255, 184, 41, 0.3); border-radius: 20px; padding: 2rem; display: flex; flex-direction: column; justify-content: space-between; transition: all 0.25s ease; position: relative; overflow: hidden;">
        <div style="position: absolute; top: 0; left: 0; right: 0; height: 3px; background: linear-gradient(90deg, #ffb829, #ffd276);"></div>
        <div>
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.25rem;">
            <span style="background: rgba(255, 184, 41, 0.18); color: #ffb829; border: 1px solid rgba(255, 184, 41, 0.4); padding: 4px 10px; border-radius: 9999px; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em;">SOCRATIC DEFENSE</span>
            <span style="color: #bdbdbd; font-size: 12px; font-family: monospace;">CH. 01 — 06</span>
          </div>
          <h3 style="font-size: 28px; font-weight: 400; color: #ffffff; margin: 0 0 0.5rem 0; letter-spacing: -0.02em;">/ars-plan</h3>
          <div style="color: #ffd276; font-size: 14px; font-weight: 500; margin-bottom: 1rem;">Chapter-by-Chapter Socratic Stress-Testing</div>
          <p style="color: #9a9a9a; font-size: 14px; line-height: 1.6; margin: 0 0 1.5rem 0; font-weight: 300;">
            Interactive pre-submission defense mode. Engages authors in adversarial Socratic dialogue to test methodology boundary proofs, formalize assumptions, detect premature claims, and verify evidence-to-conclusion integrity before peer review.
          </p>
        </div>
        <div>
          <div style="background: rgba(0, 0, 0, 0.5); border: 1px solid rgba(255, 255, 255, 0.06); border-radius: 12px; padding: 12px 16px; margin-bottom: 1.25rem;">
            <div style="display: flex; justify-content: space-between; font-size: 12px; margin-bottom: 6px;">
              <span style="color: #bdbdbd;">Interrogation Mode</span>
              <span style="color: #ffb829; font-weight: 600; font-family: monospace;">Socratic Dialectic</span>
            </div>
            <div style="display: flex; justify-content: space-between; font-size: 12px; margin-bottom: 6px;">
              <span style="color: #bdbdbd;">Boundary Audits</span>
              <span style="color: #15846e; font-weight: 600; font-family: monospace;">Power & Controls Check</span>
            </div>
            <div style="display: flex; justify-content: space-between; font-size: 12px;">
              <span style="color: #bdbdbd;">Failure Guard</span>
              <span style="color: #8052ff; font-weight: 600; font-family: monospace;">Lu et al. Nature 2026</span>
            </div>
          </div>
          <a href="#demobench" class="btn t-14 t-600 t-uppercase" style="width: 100%; text-decoration: none; justify-content: center; background: #ffb829; color: #000; border-radius: 20px;">
            <span class="btn__text pointer-events-none" style="color: #000;">Launch Socratic Defense</span>
            <div class="btn__hover pointer-events-none"></div>
          </a>
        </div>
      </div>

      <!-- Card 3: /ars-review -->
      <div class="veritas-ars-card" style="background: rgba(255, 255, 255, 0.03); border: 1px solid rgba(21, 132, 110, 0.35); border-radius: 20px; padding: 2rem; display: flex; flex-direction: column; justify-content: space-between; transition: all 0.25s ease; position: relative; overflow: hidden;">
        <div style="position: absolute; top: 0; left: 0; right: 0; height: 3px; background: linear-gradient(90deg, #15846e, #2bd9b5);"></div>
        <div>
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.25rem;">
            <span style="background: rgba(21, 132, 110, 0.2); color: #2bd9b5; border: 1px solid rgba(21, 132, 110, 0.45); padding: 4px 10px; border-radius: 9999px; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em;">SIMULATED PEER REVIEW</span>
            <span style="color: #bdbdbd; font-size: 12px; font-family: monospace;">7-AGENT PANEL</span>
          </div>
          <h3 style="font-size: 28px; font-weight: 400; color: #ffffff; margin: 0 0 0.5rem 0; letter-spacing: -0.02em;">/ars-review</h3>
          <div style="color: #2bd9b5; font-size: 14px; font-weight: 500; margin-bottom: 1rem;">Multi-Perspective Simulated Peer Review Panel</div>
          <p style="color: #9a9a9a; font-size: 14px; line-height: 1.6; margin: 0 0 1.5rem 0; font-weight: 300;">
            Simulates a rigorous 7-member peer review panel with adversarial attack intensity preservation. Automatically evaluates UGC 2018 Statutory classifications (Levels 0–3) and Section 7 exclusions to deliver an actionable, transparent verdict.
          </p>
        </div>
        <div>
          <div style="background: rgba(0, 0, 0, 0.5); border: 1px solid rgba(255, 255, 255, 0.06); border-radius: 12px; padding: 12px 16px; margin-bottom: 1.25rem;">
            <div style="display: flex; justify-content: space-between; font-size: 12px; margin-bottom: 6px;">
              <span style="color: #bdbdbd;">Simulated Panel</span>
              <span style="color: #2bd9b5; font-weight: 600; font-family: monospace;">7 Autonomous Agents</span>
            </div>
            <div style="display: flex; justify-content: space-between; font-size: 12px; margin-bottom: 6px;">
              <span style="color: #bdbdbd;">Statutory Standard</span>
              <span style="color: #ffb829; font-weight: 600; font-family: monospace;">UGC 2018 Levels 0–3</span>
            </div>
            <div style="display: flex; justify-content: space-between; font-size: 12px;">
              <span style="color: #bdbdbd;">Privacy Compliance</span>
              <span style="color: #8052ff; font-weight: 600; font-family: monospace;">DPDP Act 2023 Sec 12</span>
            </div>
          </div>
          <a href="#classroom" class="btn t-14 t-600 t-uppercase" style="width: 100%; text-decoration: none; justify-content: center; background: #15846e; border-radius: 20px;">
            <span class="btn__text pointer-events-none">Simulate Peer Review</span>
            <div class="btn__hover pointer-events-none"></div>
          </a>
        </div>
      </div>

    </div>

    <!-- Interactive Live Terminal Workbench -->
    <div style="background: #08080c; border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 20px; padding: 1.75rem; overflow: hidden;">
      <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid rgba(255, 255, 255, 0.08); padding-bottom: 1rem; margin-bottom: 1.25rem; flex-wrap: wrap; gap: 12px;">
        <div style="display: flex; align-items: center; gap: 10px;">
          <span style="display: inline-block; width: 10px; height: 10px; border-radius: 50%; background: #15846e; box-shadow: 0 0 10px #15846e;"></span>
          <span style="color: #ffffff; font-size: 14px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em;">ARS Autonomous Execution Console</span>
        </div>
        <div style="display: flex; gap: 8px;">
          <button type="button" class="veritas-ars-tab-btn" data-ars="pipeline" style="background: rgba(128, 82, 255, 0.2); border: 1px solid #8052ff; color: #fff; padding: 6px 14px; border-radius: 20px; font-size: 12px; font-weight: 600; cursor: pointer;">Run /ars-pipeline</button>
          <button type="button" class="veritas-ars-tab-btn" data-ars="plan" style="background: transparent; border: 1px solid rgba(255, 255, 255, 0.15); color: #bdbdbd; padding: 6px 14px; border-radius: 20px; font-size: 12px; font-weight: 600; cursor: pointer;">Run /ars-plan</button>
          <button type="button" class="veritas-ars-tab-btn" data-ars="review" style="background: transparent; border: 1px solid rgba(255, 255, 255, 0.15); color: #bdbdbd; padding: 6px 14px; border-radius: 20px; font-size: 12px; font-weight: 600; cursor: pointer;">Run /ars-review</button>
        </div>
      </div>
      <div id="veritas-ars-console-output" style="font-family: monospace, monospace; font-size: 13px; line-height: 1.6; color: #a37aff; min-height: 120px; background: #030305; padding: 1rem; border-radius: 12px; border: 1px solid rgba(255, 255, 255, 0.04); overflow-x: auto;">
        [ARS-PIPELINE] Initializing 10-Stage Academic Integrity Verification...<br>
        [STAGE 01] Multi-modal Ingestion: PDF/Word/LaTeX parsed • Extracted 14,820 tokens • Zero UTF-8 corruption<br>
        [STAGE 02] Homoglyph Sanitization: Canonical NFKD form • 0 invisible unicode glyphs flagged<br>
        [STAGE 03] Rabin-Karp Winnowing: k=5, w=4 • Polynomial rolling fingerprints indexed in 8.4ms<br>
        [STAGE 04] AST Structural Analysis: Abstract syntax tree mapped across 24 functions • 0 clones detected<br>
        [STAGE 05] Citation & Reference Audit: Zhao et al. 2026 anchor checks verified against 140 peer articles<br>
        [STAGE 10] Merkle Ledger Anchored: SHA-256 Block 0x9e41...c82a committed to immutable repository
      </div>
    </div>
  </div>
</div>
`;

// Replace from teamStartIndex to investorsIndex with the new ARS architecture section
html = html.substring(0, teamStartIndex) + arsArchitectureHtml + html.substring(investorsIndex);

// Also add click handler for ARS console in the page script
const scriptInsertMarker = '// Team slider keyboard navigation';
const arsConsoleScript = `// ARS Console Tab Interactivity
  const arsTabs = document.querySelectorAll('.veritas-ars-tab-btn');
  const arsConsole = document.getElementById('veritas-ars-console-output');
  const arsOutputs = {
    pipeline: '[ARS-PIPELINE] Initializing 10-Stage Academic Integrity Verification...<br>[STAGE 01] Multi-modal Ingestion: PDF/Word/LaTeX parsed • Extracted 14,820 tokens • Zero UTF-8 corruption<br>[STAGE 02] Homoglyph Sanitization: Canonical NFKD form • 0 invisible unicode glyphs flagged<br>[STAGE 03] Rabin-Karp Winnowing: k=5, w=4 • Polynomial rolling fingerprints indexed in 8.4ms<br>[STAGE 04] AST Structural Analysis: Abstract syntax tree mapped across 24 functions • 0 clones detected<br>[STAGE 05] Citation & Reference Audit: Zhao et al. 2026 anchor checks verified against 140 peer articles<br>[STAGE 10] Merkle Ledger Anchored: SHA-256 Block 0x9e41...c82a committed to immutable repository',
    plan: '[ARS-PLAN] Initiating Socratic Paper Architecture & Pre-Submission Defense...<br>[SOCRATIC-01] Premise Interrogation: Audited claims in Section 3.2 • Boundary power threshold confirmed<br>[SOCRATIC-02] Methodology Verification: Ablation controls verified against baseline non-neural winnowing<br>[SOCRATIC-03] Claim-to-Evidence Ratio: Theorems 1-4 supported by empirical logs • 0 unsupported leaps<br>[SOCRATIC-04] Nature 2026 Failure Mode Guard: Cross-tested against adversarial evasion datasets (Zhao et al.)<br>[VERDICT] Document defense passed with high integrity rating (Grade A • Ready for peer submission)',
    review: '[ARS-REVIEW] Assembling 7-Agent Autonomous Peer Review Panel...<br>[AGENT 1: Chief Arbiter] Originality score 94.2% • Structural novelty confirmed across all chapters<br>[AGENT 2: Methodological Purist] Winnowing window w=4, k=5 verified mathematically without parameter leakage<br>[AGENT 3: Adversarial Skeptic] Zero homoglyph evasion vulnerability found under NFKD sanitization<br>[AGENT 4: Statutory Ombudsman] UGC 2018 Statutory Classification: Level 0 (Similarities &lt; 10% • Clear)<br>[AGENT 5: Privacy Auditor] DPDP Act 2023 Section 12 compliant • Minor student age-gated consent verified<br>[PANEL VERDICT] Unanimous Accept with Distinction • Merkle certificate issued'
  };

  arsTabs.forEach(btn => {
    btn.addEventListener('click', () => {
      arsTabs.forEach(b => {
        b.style.background = 'transparent';
        b.style.borderColor = 'rgba(255, 255, 255, 0.15)';
        b.style.color = '#bdbdbd';
      });
      btn.style.background = 'rgba(128, 82, 255, 0.2)';
      btn.style.borderColor = '#8052ff';
      btn.style.color = '#ffffff';
      const mode = btn.getAttribute('data-ars');
      if (arsConsole && arsOutputs[mode]) {
        arsConsole.innerHTML = arsOutputs[mode];
      }
    });
  });

  `;

if (html.includes(scriptInsertMarker)) {
  html = html.replace(scriptInsertMarker, arsConsoleScript + scriptInsertMarker);
}

// In header and footer navigation, change 'Team' link text to 'ARS Architecture'
html = html.replace('>Team</a>', '>ARS Architecture</a>');
html = html.replace('>Team</button>', '>ARS Architecture</button>');

// Also update the document title and description
html = html.replace(
  '<title>Veritas — Universal Document Originality &amp; Institutional Integrity Platform</title>',
  '<title>Veritas — Universal Originality Forensics &amp; ARS Academic Integrity Platform</title>'
);

// Ensure the unblock scroll CSS is also in index.html head
const headStyle = `<style>
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
  .header__logo { width: 8.5rem !important; }
  .footer__logo { width: 8.5rem !important; }
  .veritas-ars-card:hover {
    transform: translateY(-4px);
    box-shadow: 0 12px 30px rgba(0, 0, 0, 0.5);
  }
</style>`;

html = html.replace(/<style>[\s\S]*?<\/style>/, headStyle);

fs.writeFileSync(indexPath, html, 'utf8');
console.log('Successfully replaced team section with ARS Forensics Architecture in index.html!');
