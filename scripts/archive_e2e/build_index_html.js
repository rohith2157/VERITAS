const fs = require('fs');
let html = fs.readFileSync('c:/TTProject/frontend/live_index.html', 'utf8');

// Ensure anchor-target="manifesto" is on the manifesto section
html = html.replace(
  '<div class="js-section" section-name="manifesto">',
  '<div class="js-section" section-name="manifesto" anchor-target="manifesto">'
);

// Replace defunct PostHog analytics snippet with a clean no-op stub to prevent 404 network errors
const posthogIdx = html.indexOf('posthog');
if (posthogIdx !== -1) {
  const start = html.lastIndexOf('<script', posthogIdx);
  const end = html.indexOf('</script>', posthogIdx) + 9;
  const defunctScript = html.slice(start, end);
  html = html.replace(
    defunctScript,
    '<script>window.posthog={capture:function(){},identify:function(){},init:function(){},register:function(){},people:{set:function(){}}};</script>'
  );
}

// Ensure clear accessible labels on slider buttons
html = html.replace(
  '<button class="team-slider__control team-slider__previous | js-slider-prev">',
  '<button class="team-slider__control team-slider__previous | js-slider-prev" aria-label="Previous slide">'
);
html = html.replace(
  '<button class="team-slider__control team-slider__next | js-slider-next">',
  '<button class="team-slider__control team-slider__next | js-slider-next" aria-label="Next slide">'
);

// Add studio modal overlay and accessible styling before closing body tag
const studioModalHtml = `
<style>
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
    background: rgba(0, 0, 0, 0.85);
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
    z-index: 99999;
    align-items: center;
    justify-content: center;
    padding: 2rem;
    box-sizing: border-box;
  }
  .veritas-studio-overlay.active {
    display: flex !important;
  }
  .veritas-studio-card {
    background: #0d0d12;
    border: 1px solid rgba(255, 255, 255, 0.12);
    border-radius: 24px;
    padding: 2.5rem;
    max-width: 960px;
    width: 100%;
    color: #ffffff;
    box-shadow: 0 30px 60px rgba(0, 0, 0, 0.6);
  }
</style>

<div id="veritas-studio-modal" class="veritas-studio-overlay" role="dialog" aria-modal="true" aria-label="Originality Forensics Studio">
  <div class="veritas-studio-card">
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem;">
      <div>
        <span style="color: #8052ff; font-size: 14px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em;">Originality Forensics Engine</span>
        <h2 style="font-size: 36px; font-weight: 400; margin: 0.25rem 0 0 0; color: #ffffff; letter-spacing: -0.03em;">Document Verification Studio</h2>
      </div>
      <button id="veritas-close-modal" type="button" class="btn t-16 t-600 t-uppercase" aria-label="Close modal" style="cursor: pointer; background: transparent; border: 1px solid rgba(255,255,255,0.2); color: #fff; padding: 8px 20px; border-radius: 24px;">Close ✕</button>
    </div>
    
    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 1.5rem; margin-bottom: 2rem;">
      <div style="background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08); border-radius: 16px; padding: 1.5rem;">
        <div style="color: #ffb829; font-size: 12px; font-weight: 600; text-transform: uppercase; margin-bottom: 0.5rem;">Engine 01 • Python FastAPI</div>
        <div style="font-size: 20px; font-weight: 400; margin-bottom: 0.5rem;">Winnowing Fingerprint</div>
        <p style="font-size: 14px; font-weight: 200; color: #bdbdbd; line-height: 1.5; margin: 0;">Multi-gram hash fingerprinting across billions of academic repositories and source documents.</p>
      </div>
      <div style="background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08); border-radius: 16px; padding: 1.5rem;">
        <div style="color: #8052ff; font-size: 12px; font-weight: 600; text-transform: uppercase; margin-bottom: 0.5rem;">Engine 02 • Spring Boot 3</div>
        <div style="font-size: 20px; font-weight: 400; margin-bottom: 0.5rem;">Institutional Ledger</div>
        <p style="font-size: 14px; font-weight: 200; color: #bdbdbd; line-height: 1.5; margin: 0;">Immutable cryptographic audit ledger recording submission checkpoints and peer rubrics.</p>
      </div>
      <div style="background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08); border-radius: 16px; padding: 1.5rem;">
        <div style="color: #15846e; font-size: 12px; font-weight: 600; text-transform: uppercase; margin-bottom: 0.5rem;">Engine 03 • AI Matrix</div>
        <div style="font-size: 20px; font-weight: 400; margin-bottom: 0.5rem;">Synthetic Forensics</div>
        <p style="font-size: 14px; font-weight: 200; color: #bdbdbd; line-height: 1.5; margin: 0;">Perplexity and burstiness spectrum analysis detecting AI-generated and paraphrased text.</p>
      </div>
    </div>

    <div style="display: flex; gap: 1rem; justify-content: flex-end;">
      <a href="/?skiploader" id="veritas-modal-back-btn" class="btn t-16 t-600 t-uppercase" style="text-decoration: none; display: inline-flex; align-items: center; justify-content: center; background: #8052ff; color: #fff; padding: 12px 28px; border-radius: 24px;">Back to Experience</a>
    </div>
  </div>
</div>

<script>
// Wire up Request Access buttons & Modal keyboard accessibility
document.addEventListener('DOMContentLoaded', function() {
  const modal = document.getElementById('veritas-studio-modal');
  const closeBtn = document.getElementById('veritas-close-modal');
  const backBtn = document.getElementById('veritas-modal-back-btn');
  const requestBtns = document.querySelectorAll('a[aria-label="Request Access"], a[aria-label="Request access"], .landing .btn, .header__cta .btn, .footer .btn');
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
      const focusables = [closeBtn, backBtn].filter(Boolean);
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
`;

html = html.replace('</body>', studioModalHtml + '\n</body>');

fs.writeFileSync('c:/TTProject/frontend/index.html', html);
console.log('Saved frontend/index.html! Length:', html.length);
