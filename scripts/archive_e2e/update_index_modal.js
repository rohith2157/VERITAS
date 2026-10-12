const fs = require('fs');

const indexPath = 'c:/TTProject/frontend/index.html';
let html = fs.readFileSync(indexPath, 'utf8');

// 1. Fix the broken HTML attribute rel="“noreferrer" noopener”
html = html.replace('rel="“noreferrer" noopener”', 'rel="noreferrer noopener"');

// 2. Locate the style and modal block
const styleMarker = '<style>';
const scriptEndMarker = '</script>\n\n</body></html>';

const styleIdx = html.indexOf(styleMarker);
if (styleIdx === -1) {
  console.error('Style marker not found!');
  process.exit(1);
}

const beforeStyle = html.substring(0, styleIdx);

const newStyleAndModal = `<style>
  :focus-visible {
    outline: 2px solid #8052ff !important;
    outline-offset: 3px !important;
  }
  .veritas-studio-overlay {
    display: none;
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background: rgba(0, 0, 0, 0.94);
    backdrop-filter: blur(24px);
    -webkit-backdrop-filter: blur(24px);
    z-index: 99999;
    align-items: center;
    justify-content: center;
    padding: 1.5rem;
    box-sizing: border-box;
    opacity: 0;
    transition: opacity 0.25s cubic-bezier(0.16, 1, 0.3, 1);
  }
  .veritas-studio-overlay.active {
    display: flex !important;
    opacity: 1;
  }
  .veritas-studio-card {
    background: #000000;
    border: 1px solid rgba(255, 255, 255, 0.12);
    border-radius: 24px;
    padding: 2.25rem;
    max-width: 1080px;
    width: 100%;
    color: #ffffff;
    box-shadow: 0 40px 100px rgba(0, 0, 0, 0.9);
    max-height: 90vh;
    overflow-y: auto;
    scrollbar-width: none;
    position: relative;
  }
  .veritas-studio-card::-webkit-scrollbar {
    display: none;
  }
  .veritas-tab-btn {
    background: transparent;
    border: 1px solid rgba(255, 255, 255, 0.15);
    color: #bdbdbd;
    padding: 8px 18px;
    border-radius: 9999px;
    font-size: 13px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;
    text-transform: uppercase;
    letter-spacing: 0.025em;
  }
  .veritas-tab-btn:hover {
    border-color: rgba(255, 255, 255, 0.4);
    color: #ffffff;
  }
  .veritas-tab-btn.active {
    background: #8052ff;
    border-color: #8052ff;
    color: #ffffff;
    box-shadow: 0 0 16px rgba(128, 82, 255, 0.4);
  }
  .veritas-meter-bar {
    height: 6px;
    background: rgba(255, 255, 255, 0.08);
    border-radius: 9999px;
    overflow: hidden;
    margin-top: 8px;
  }
  .veritas-meter-fill {
    height: 100%;
    background: linear-gradient(90deg, #8052ff, #ffb829);
    border-radius: 9999px;
    transition: width 0.6s cubic-bezier(0.16, 1, 0.3, 1);
  }
  .veritas-badge {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 4px 10px;
    border-radius: 9999px;
    font-size: 11px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }
  @media (max-width: 768px) {
    .veritas-workbench-grid {
      grid-template-columns: 1fr !important;
    }
    .veritas-studio-card {
      padding: 1.5rem;
    }
  }
</style>

<div id="veritas-studio-modal" class="veritas-studio-overlay" role="dialog" aria-modal="true" aria-label="Originality Forensics Studio">
  <div class="veritas-studio-card">
    <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 1.5rem;">
      <div>
        <div style="color: #ffb829; font-size: 13px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 0.25rem;">Veritas Forensic Architecture • Institutional Originality</div>
        <h2 style="font-size: 36px; font-weight: 400; margin: 0; color: #ffffff; letter-spacing: -0.03em;">Document Verification Studio</h2>
        <p style="font-size: 15px; font-weight: 200; color: #bdbdbd; margin: 0.25rem 0 0 0; line-height: 1.4;">Real-time multi-engine analysis powered by Python FastAPI Winnowing and Spring Boot 3 cryptographic ledger.</p>
      </div>
      <button id="veritas-close-modal" type="button" aria-label="Close modal" style="cursor: pointer; background: transparent; border: 1px solid rgba(255,255,255,0.2); color: #fff; padding: 8px 18px; border-radius: 24px; font-size: 14px; font-weight: 600; text-transform: uppercase; transition: all 0.2s ease;">Close ✕</button>
    </div>

    <!-- Scenario Preset Selector -->
    <div style="display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 1.5rem;">
      <button type="button" class="veritas-tab-btn active" data-scenario="homoglyph">Scenario 1: Cyrillic Homoglyph Attack</button>
      <button type="button" class="veritas-tab-btn" data-scenario="ast">Scenario 2: CS Lab AST Code Clone</button>
      <button type="button" class="veritas-tab-btn" data-scenario="clean">Scenario 3: Original Human Paper</button>
    </div>

    <!-- Interactive Workbench -->
    <div class="veritas-workbench-grid" style="display: grid; grid-template-columns: 1.1fr 0.9fr; gap: 1.5rem; margin-bottom: 1.75rem;">
      <!-- Left Column: Source Document -->
      <div style="background: rgba(255, 255, 255, 0.02); border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 16px; padding: 1.25rem; display: flex; flex-direction: column;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.75rem;">
          <span style="color: #9a9a9a; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em;">Source Inspection Window</span>
          <span id="veritas-doc-meta" style="color: #bdbdbd; font-size: 12px; font-family: monospace;">1,248 characters • UTF-8</span>
        </div>
        <div id="veritas-doc-preview" style="background: #060608; border: 1px solid rgba(255, 255, 255, 0.05); border-radius: 12px; padding: 1rem; font-family: monospace, monospace; font-size: 13px; line-height: 1.6; color: #e0e0e0; min-height: 180px; flex-grow: 1; word-break: break-word; overflow-y: auto; max-height: 240px;">
        </div>
        <button id="veritas-run-scan-btn" type="button" class="btn t-14 t-600 t-uppercase" style="width: 100%; margin-top: 1rem; background: #8052ff; color: #fff; padding: 12px; border-radius: 24px; cursor: pointer; border: none; letter-spacing: 0.025em; transition: transform 0.15s ease;">
          <span class="btn__text pointer-events-none">Re-Analyze Forensic Hashes</span>
          <div class="btn__hover pointer-events-none" aria-hidden="true"></div>
        </button>
      </div>

      <!-- Right Column: Live Telemetry -->
      <div style="display: flex; flex-direction: column; gap: 1rem;">
        <!-- Engine 01: Winnowing -->
        <div style="background: rgba(255, 255, 255, 0.02); border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 16px; padding: 1.25rem;">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <span style="color: #8052ff; font-size: 12px; font-weight: 600; text-transform: uppercase;">Engine 01 • Python FastAPI Winnowing</span>
            <span id="veritas-containment-badge" class="veritas-badge" style="background: rgba(128, 82, 255, 0.15); color: #8052ff;">Containment</span>
          </div>
          <div style="display: flex; justify-content: space-between; align-items: baseline; margin-top: 0.5rem;">
            <div id="veritas-containment-score" style="font-size: 32px; font-weight: 400; color: #ffffff; letter-spacing: -0.02em;">89.4%</div>
            <div id="veritas-window-info" style="font-size: 13px; color: #bdbdbd; font-family: monospace;">142 / 159 matching k-grams</div>
          </div>
          <div class="veritas-meter-bar">
            <div id="veritas-meter-fill" class="veritas-meter-fill" style="width: 89.4%;"></div>
          </div>
          <div style="font-size: 12px; font-weight: 200; color: #9a9a9a; margin-top: 0.5rem;">Guaranteed detection threshold: sub-sequence length w=4, k=5.</div>
        </div>

        <!-- Engine 02: Homoglyph & Evasion Detector -->
        <div style="background: rgba(255, 255, 255, 0.02); border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 16px; padding: 1.25rem;">
          <div style="color: #ffb829; font-size: 12px; font-weight: 600; text-transform: uppercase; margin-bottom: 0.35rem;">Engine 02 • Stylometric & Evasion Detector</div>
          <div id="veritas-evasion-status" style="font-size: 15px; font-weight: 400; color: #ffb829;">14 Cyrillic Homoglyphs Flagged (U+0430, U+0435, U+043E)</div>
          <div style="font-size: 12px; font-weight: 200; color: #9a9a9a; margin-top: 0.25rem;">Canonical NFKD homoglyph mapping strips adversarial obfuscation.</div>
        </div>

        <!-- Engine 03: Spring Boot 3 Ledger -->
        <div style="background: rgba(255, 255, 255, 0.02); border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 16px; padding: 1.25rem;">
          <div style="color: #15846e; font-size: 12px; font-weight: 600; text-transform: uppercase; margin-bottom: 0.35rem;">Engine 03 • Spring Boot 3 Audit Ledger</div>
          <div id="veritas-ledger-hash" style="font-family: monospace; font-size: 13px; color: #15846e;">Block Hash: 0x7f4e918c...3a29b (Confirmed)</div>
          <div style="font-size: 12px; font-weight: 200; color: #9a9a9a; margin-top: 0.25rem;">Immutable SHA-256 submission checkpoint anchored in H2/PostgreSQL.</div>
        </div>
      </div>
    </div>

    <!-- Footer Bar -->
    <div style="display: flex; justify-content: space-between; align-items: center; border-top: 1px solid rgba(255, 255, 255, 0.08); padding-top: 1.25rem;">
      <div style="font-size: 13px; color: #15846e; display: flex; align-items: center; gap: 8px;">
        <span style="display: inline-block; width: 8px; height: 8px; border-radius: 50%; background: #15846e; box-shadow: 0 0 10px #15846e;"></span>
        <span>LIVE CLUSTER ONLINE • ZERO REPOSITORY CONTAMINATION</span>
      </div>
      <a href="/?skiploader" id="veritas-modal-back-btn" class="btn t-14 t-600 t-uppercase" style="text-decoration: none; display: inline-flex; align-items: center; justify-content: center; background: #8052ff; color: #fff; padding: 10px 24px; border-radius: 24px; letter-spacing: 0.025em;">Back to Experience</a>
    </div>
  </div>
</div>

<script>
// Wire up Request Access buttons, interactive scenarios & modal keyboard a11y
document.addEventListener('DOMContentLoaded', function() {
  const modal = document.getElementById('veritas-studio-modal');
  const closeBtn = document.getElementById('veritas-close-modal');
  const backBtn = document.getElementById('veritas-modal-back-btn');
  const scanBtn = document.getElementById('veritas-run-scan-btn');
  const tabBtns = document.querySelectorAll('.veritas-tab-btn');
  const requestBtns = document.querySelectorAll('a[aria-label="Request Access"], a[aria-label="Request access"], .landing .btn, .header__cta .btn, .footer .btn');

  const docPreview = document.getElementById('veritas-doc-preview');
  const docMeta = document.getElementById('veritas-doc-meta');
  const containmentScore = document.getElementById('veritas-containment-score');
  const windowInfo = document.getElementById('veritas-window-info');
  const meterFill = document.getElementById('veritas-meter-fill');
  const evasionStatus = document.getElementById('veritas-evasion-status');
  const ledgerHash = document.getElementById('veritas-ledger-hash');

  const scenarios = {
    homoglyph: {
      text: 'The d<span style="color:#ffb829; font-weight:bold;">\u0435</span>sign <span style="color:#ffb829; font-weight:bold;">\u043E</span>f distгibut<span style="color:#ffb829; font-weight:bold;">\u0435</span>d consensus proto<span style="color:#ffb829; font-weight:bold;">\u0441</span>ols r<span style="color:#ffb829; font-weight:bold;">\u0435</span>quires rigorous formal v<span style="color:#ffb829; font-weight:bold;">\u0435</span>rifi<span style="color:#ffb829; font-weight:bold;">\u0441</span>ation. Adversarial evasion attempts often substitute identical Cyrillic glyphs (\u0435, \u043E, \u0441, \u0430) into Latin text to defeat standard string matchers, yet the Veritas Winnowing engine normalizes canonical token boundaries.',
      meta: '842 characters • 14 Cyrillic Homoglyphs detected',
      containment: '89.4%',
      windows: '142 / 159 matching k-grams',
      evasion: '14 Cyrillic Homoglyphs Flagged (U+0430, U+0435, U+043E)',
      evasionColor: '#ffb829',
      hash: 'Block Hash: 0x7f4e918c...3a29b (Confirmed)'
    },
    ast: {
      text: '<span style="color:#8052ff;">def</span> winnow_cluster_tokens(stream, k=5, w=4):\\n    n_grams = [hash(stream[i:i+k]) for i in range(len(stream)-k+1)]\\n    fingerprints = []\\n    for idx in range(len(n_grams) - w + 1):\\n        window = n_grams[idx:idx + w]\\n        fingerprints.append(min(window))\\n    return set(fingerprints)\\n# Variable renaming detected; structural AST tree matches 96.8%',
      meta: '412 characters • Python AST Cloned Tokens',
      containment: '96.8%',
      windows: '178 / 184 AST syntax nodes',
      evasion: '0 Homoglyphs • Full Structural Syntax Clone Detected',
      evasionColor: '#8052ff',
      hash: 'Block Hash: 0x3c99a41d...fe710 (Confirmed)'
    },
    clean: {
      text: 'Empirical validation of high-dimensional manifold projections in unsupervised representation spaces demonstrates unique topological divergence. All benchmark datasets maintain pristine cryptographic provenance with zero historical submission overlap.',
      meta: '286 characters • Original Human Provenance',
      containment: '2.1%',
      windows: '3 / 144 baseline noise overlap',
      evasion: 'Clean Document • Zero Adversarial Glyph Tampering',
      evasionColor: '#15846e',
      hash: 'Block Hash: 0x091b248a...991e5 (New Block Created)'
    }
  };

  let currentScenario = 'homoglyph';

  function applyScenario(key) {
    currentScenario = key;
    const s = scenarios[key];
    if (!s) return;
    docPreview.innerHTML = s.text;
    docMeta.textContent = s.meta;
    containmentScore.textContent = s.containment;
    windowInfo.textContent = s.windows;
    meterFill.style.width = s.containment;
    evasionStatus.textContent = s.evasion;
    evasionStatus.style.color = s.evasionColor;
    ledgerHash.textContent = s.hash;
  }

  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      tabBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      applyScenario(btn.dataset.scenario);
    });
  });

  if (scanBtn) {
    scanBtn.addEventListener('click', () => {
      containmentScore.textContent = 'Scanning...';
      meterFill.style.width = '0%';
      setTimeout(() => {
        applyScenario(currentScenario);
      }, 350);
    });
  }

  // Initialize with homoglyph
  applyScenario('homoglyph');

  let lastFocusedElement = null;

  function openModal(opener) {
    if (!modal) return;
    lastFocusedElement = opener || document.activeElement;
    modal.classList.add('active');
    setTimeout(() => {
      if (closeBtn) closeBtn.focus();
    }, 50);
  }

  function closeModal() {
    if (!modal) return;
    modal.classList.remove('active');
    if (lastFocusedElement && typeof lastFocusedElement.focus === 'function') {
      lastFocusedElement.focus();
    }
  }

  requestBtns.forEach(btn => {
    btn.addEventListener('click', function(e) {
      e.preventDefault();
      openModal(btn);
    });
    btn.addEventListener('keydown', function(e) {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        openModal(btn);
      }
    });
  });

  if (closeBtn) {
    closeBtn.addEventListener('click', closeModal);
  }

  if (backBtn) {
    backBtn.addEventListener('click', function(e) {
      e.preventDefault();
      closeModal();
    });
  }

  if (modal) {
    modal.addEventListener('click', function(e) {
      if (e.target === modal) {
        closeModal();
      }
    });
  }

  // Keyboard trap and Escape listener for modal
  document.addEventListener('keydown', function(e) {
    if (!modal || !modal.classList.contains('active')) return;
    
    if (e.key === 'Escape') {
      e.preventDefault();
      closeModal();
      return;
    }

    if (e.key === 'Tab') {
      const focusables = Array.from(modal.querySelectorAll('button, a, input, textarea, [tabindex]:not([tabindex="-1"])')).filter(el => el.offsetParent !== null);
      if (focusables.length === 0) return;
      
      const first = focusables[0];
      const last = focusables[focusables.length - 1];

      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
  });

  // Cookie notice toggle
  const cookieToggle = document.querySelector('.js-cookie-notice-toggle');
  const cookieNotice = document.querySelector('.js-cookie-notice');
  if (cookieToggle && cookieNotice) {
    const isAccepted = localStorage.getItem('dala_cookie_accepted') === 'true' || 
                       document.cookie.split(';').some(c => c.trim().startsWith('cookie_notice_accepted=true'));
    if (isAccepted) {
      cookieNotice.style.display = 'none';
    }
    const dismissCookie = () => {
      cookieNotice.style.display = 'none';
      localStorage.setItem('dala_cookie_accepted', 'true');
      document.cookie = 'cookie_notice_accepted=true; path=/; max-age=31536000';
    };
    cookieToggle.addEventListener('click', dismissCookie);
    cookieToggle.addEventListener('keydown', function(e) {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        dismissCookie();
      }
    });
  }

  // Team slider keyboard navigation
  const prevBtn = document.querySelector('.js-slider-prev');
  const nextBtn = document.querySelector('.js-slider-next');
  [prevBtn, nextBtn].forEach(btn => {
    if (btn) {
      btn.addEventListener('keydown', function(e) {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          btn.click();
        }
      });
    }
  });
});
</script>

</body></html>`;

fs.writeFileSync(indexPath, beforeStyle + newStyleAndModal);
console.log('Successfully upgraded index.html with interactive Veritas Forensics Studio and fixed attributes!');

