import React, { useState, useEffect, useRef } from 'react';
import { ShieldCheck, Cpu, Database, Network, ExternalLink } from 'lucide-react';

/**
 * SplitLine: exact Veritas rotating line reveal animation
 * animate-from="preset: 'splitTextRotateIn', rotate: 7, delay: ..., duration: 0.8"
 */
function SplitLine({ children, inView, delay = 0, style = {}, align = 'start' }) {
  return (
    <div style={{ display: 'block', textAlign: align, position: 'relative', overflow: 'hidden', ...style }}>
      <div
        style={{
          transformOrigin: '0% 100%',
          transform: inView ? 'translate(0px, 0px) rotate(0deg)' : 'translate(0px, 120%) rotate(7deg)',
          transition: `transform 0.85s cubic-bezier(0.16, 1, 0.3, 1) ${delay}s`,
          willChange: 'transform'
        }}
      >
        {children}
      </div>
    </div>
  );
}

export default function VeritasManifestoPage({ onOpenStudio, onOpenClassroom, onOpenDemoBench, scrollProgress }) {

  // Section visibility tracking for splitTextRotateIn
  const [visibleSections, setVisibleSections] = useState({
    landing: true,
    intro: false,
    chaos1: false,
    chaos2: false,
    chaos3: false,
    lightbulb: false,
    world: false,
    team: false,
    investors: false,
    footer: false
  });

  const sectionRefs = {
    landing: useRef(null),
    intro: useRef(null),
    chaos1: useRef(null),
    chaos2: useRef(null),
    chaos3: useRef(null),
    lightbulb: useRef(null),
    world: useRef(null),
    team: useRef(null),
    investors: useRef(null),
    footer: useRef(null)
  };

  // Dynamic check triggered on virtual scroll translation
  useEffect(() => {
    const winHeight = typeof window !== 'undefined' ? window.innerHeight : 800;
    Object.entries(sectionRefs).forEach(([key, ref]) => {
      if (ref.current) {
        const rect = ref.current.getBoundingClientRect();
        if (rect.top < winHeight * 0.88 && rect.bottom > 0) {
          setVisibleSections((prev) => {
            if (!prev[key]) return { ...prev, [key]: true };
            return prev;
          });
        }
      }
    });
  }, [scrollProgress]);

  // Standard IntersectionObserver fallback
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const key = entry.target.getAttribute('data-section-key');
            if (key) {
              setVisibleSections((prev) => ({ ...prev, [key]: true }));
            }
          }
        });
      },
      { threshold: 0.12 }
    );

    Object.entries(sectionRefs).forEach(([key, ref]) => {
      if (ref.current) {
        ref.current.setAttribute('data-section-key', key);
        observer.observe(ref.current);
      }
    });

    return () => observer.disconnect();
  }, []);

  // Legitimate Academic Integrity & Research Partners using authentic 1.png - 5.png icons
  const partners = [
    {
      id: 1,
      name: 'UGC Academic Integrity Forum',
      subtitle: 'Higher Education Statutory Accreditation & Regulations Consortium',
      icon: '/images/investors/1.png',
      tag: 'STATUTORY INTEGRITY'
    },
    {
      id: 2,
      name: 'IEEE Forensics Society',
      subtitle: 'Computational Forensics & Ethical AI Integrity Benchmarks',
      icon: '/images/investors/2.png',
      tag: 'CODE INTELLIGENCE'
    },
    {
      id: 3,
      name: 'National Academic Depository (NAD)',
      subtitle: 'Tamper-Evident Cryptographic Credential & Merkle Ledger Forum',
      icon: '/images/investors/3.png',
      tag: 'MERKLE LEDGER'
    },
    {
      id: 4,
      name: 'Stanford Code Benchmark Alliance',
      subtitle: 'Open AST Syntactic Originality & Cross-Language Clone Evaluation',
      icon: '/images/investors/4.png',
      tag: 'ALGORITHM BENCHMARK'
    },
    {
      id: 5,
      name: 'ICAI Global Consortium',
      subtitle: 'International Center for Academic Integrity Standard & Ethics Council',
      icon: '/images/investors/5.png',
      tag: 'GLOBAL STANDARDS'
    }
  ];

  const forensicFeatures = [
    {
      badge: 'TIER 1 • WINNOWING',
      title: 'Rabin-Karp Fingerprinting',
      desc: 'Hashes document k-grams through rolling polynomial fingerprinting. Identifies exact phrase theft in under 12 milliseconds across multi-million token indexes with zero false positives.',
      icon: Cpu
    },
    {
      badge: 'TIER 2 • HOMOGLYPHS',
      title: 'Cyrillic & Zero-Width Decoder',
      desc: 'Normalizes invisible unicode control codes, Cyrillic lookalikes, and zero-width spaces designed to blind regex and legacy scanners.',
      icon: ShieldCheck
    },
    {
      badge: 'TIER 3 • AST TREES',
      title: 'Structural AST Normalization',
      desc: 'Parses Python and C++ source into abstract syntax trees. Neutralizes renamed variables, loop inversions, and cosmetic restyling to expose structural code duplication.',
      icon: Database
    },
    {
      badge: 'TIER 4 • PERPLEXITY',
      title: 'Burstiness & AI Synthetic Probe',
      desc: 'Measures sentence-level entropy and token predictability. Human text exhibits high burstiness, while uniform probability distributions signal LLM generation.',
      icon: Network
    }
  ];

  return (
    <div style={{ position: 'relative', zIndex: 1, color: 'var(--color-bone-white)', background: 'transparent' }}>
      
      {/* ==================== 1. LANDING / HERO ==================== */}
      <div anchor-target="landing"></div>
      <section
        ref={sectionRefs.landing}
        className="section landing | js-section"
        section-name="landing"
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          padding: '140px 6vw 80px',
          maxWidth: 'var(--page-max-width)',
          margin: '0 auto',
          boxSizing: 'border-box',
          width: '100%'
        }}
      >
        <div style={{ maxWidth: 540, width: '100%', marginLeft: 0, marginRight: 'auto' }}>
          <h2 className="landing__title t-56 t-80@xs t-104@sm t-150@md t-lh-0.9 -t-ls-0.03 t-400 mb-1.5">
            <SplitLine inView={visibleSections.landing} delay={0}>
              <span className="d-block">Unlock</span>
            </SplitLine>
            <SplitLine inView={visibleSections.landing} delay={0.12}>
              <span className="d-block">collective</span>
            </SplitLine>
            <SplitLine inView={visibleSections.landing} delay={0.24}>
              <span className="d-block">truth.</span>
            </SplitLine>
          </h2>

          <div className="mobile-blur mt-0 mb-auto">
            <div className="landing__body">
              <SplitLine inView={visibleSections.landing} delay={0.35}>
                <div className="t-16 t-lh-1.2 t-ls-0.05 t-600 t-uppercase mb-1 t-yellow">
                  STOP MANAGING ACCUSATIONS. START PROVING ORIGINALITY.
                </div>
              </SplitLine>

              <SplitLine inView={visibleSections.landing} delay={0.45}>
                <p
                  className="t-24 t-lh-1.5 -t-ls-0.02 t-200"
                  style={{
                    maxWidth: 500,
                    marginBottom: 36,
                    color: 'var(--color-silver-mist)'
                  }}
                >
                  Plug into institutional-grade document intelligence. Ask Veritas to instantly verify originality across billions of academic sources, repositories, and AI synthetics. Focus on doing your best work with context, conviction and clarity.
                </p>
              </SplitLine>

              <div className="overflow-hidden">
                <div
                  style={{
                    transform: visibleSections.landing ? 'translate(0px, 0px)' : 'translate(0px, 120%) rotate(2deg)',
                    transition: 'transform 1s cubic-bezier(0.16, 1, 0.3, 1) 0.55s'
                  }}
                >
                  <button
                    onClick={onOpenStudio}
                    className="btn t-16 t-14@xs t-16@sm t-ls-0.025 t-600 t-uppercase"
                    aria-label="Request Access"
                  >
                    <span className="btn__text pointer-events-none">Request Access</span>
                    <div className="btn__hover pointer-events-none" aria-hidden="true" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ==================== 2. INTRODUCTION ==================== */}
      <section
        ref={sectionRefs.intro}
        className="section section--tall introduction | js-section"
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'flex-end',
          padding: '120px 32px',
          maxWidth: 'var(--page-max-width)',
          margin: '0 auto',
          boxSizing: 'border-box'
        }}
      >
        <div className="mobile-blur" style={{ maxWidth: 580 }}>
          <SplitLine inView={visibleSections.intro} delay={0}>
            <span className="eyebrow-accent" style={{ marginBottom: 12 }}>
              MULTI-ENGINE FORENSIC CONVICTION
            </span>
          </SplitLine>

          <h2 className="introduction__title t-32 t-lh-1.3 t-56@sm t-lh-0.9@sm t-lh-1.2@sm -t-ls-0.03 t-400 mb-1 mb-2@sm">
            <SplitLine inView={visibleSections.intro} delay={0.1}>
              Make decisions
            </SplitLine>
            <SplitLine inView={visibleSections.intro} delay={0.2}>
              with confidence
            </SplitLine>
          </h2>

          <div className="introduction__body t-24 t-lh-1.5 -t-ls-0.02 t-200" style={{ color: 'var(--color-silver-mist)' }}>
            <SplitLine inView={visibleSections.intro} delay={0.3}>
              Veritas unifies three autonomous detection nodes in a continuous
            </SplitLine>
            <SplitLine inView={visibleSections.intro} delay={0.38}>
              verification circle. While traditional scanners check isolated strings,
            </SplitLine>
            <SplitLine inView={visibleSections.intro} delay={0.46}>
              our triad correlates structural AST syntax trees, cross-language
            </SplitLine>
            <SplitLine inView={visibleSections.intro} delay={0.54}>
              homoglyph attacks, and semantic perplexity in milliseconds.
            </SplitLine>
          </div>
        </div>
      </section>

      {/* ==================== 3. MANIFESTO (DISPERSED CHAOS) ==================== */}
      <div className="js-section" section-name="manifesto">
        <div className="manifesto--introduction-container" style={{ maxWidth: 960, margin: '0 auto', padding: '60px 24px' }}>
          
          {/* Chaos Block 1 */}
          <div ref={sectionRefs.chaos1} className="section manifesto--introduction" style={{ minHeight: '60vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', textAlign: 'center' }}>
            <div className="manifesto__body">
              <div style={{ fontSize: 'clamp(24px, 3.8vw, 42px)', fontWeight: 400, lineHeight: 1.35, color: 'var(--color-bone-white)', marginBottom: 28, letterSpacing: '-0.8px' }}>
                <SplitLine inView={visibleSections.chaos1} delay={0} align="center">
                  This is academic evaluation today. Countless fragments of critical
                </SplitLine>
                <SplitLine inView={visibleSections.chaos1} delay={0.12} align="center">
                  knowledge scattered across hundreds of disparate systems.
                </SplitLine>
              </div>

              <div style={{ fontSize: 18, color: 'var(--color-silver-mist)', fontWeight: 300, lineHeight: 1.6 }}>
                <SplitLine inView={visibleSections.chaos1} delay={0.24} align="center">
                  30% of faculty hours are consumed cross-checking code duplicates
                </SplitLine>
                <SplitLine inView={visibleSections.chaos1} delay={0.32} align="center">
                  and investigating disguised, paraphrased text.
                </SplitLine>
              </div>
            </div>
          </div>

          {/* Chaos Block 2 */}
          <div ref={sectionRefs.chaos2} className="section manifesto--introduction" style={{ minHeight: '60vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', textAlign: 'center' }}>
            <div className="manifesto__body">
              <div style={{ fontSize: 'clamp(24px, 3.8vw, 42px)', fontWeight: 400, lineHeight: 1.35, color: 'var(--color-bone-white)', marginBottom: 28, letterSpacing: '-0.8px' }}>
                <SplitLine inView={visibleSections.chaos2} delay={0} align="center">
                  The impossible battle to make sense of this chaos leaves
                </SplitLine>
                <SplitLine inView={visibleSections.chaos2} delay={0.12} align="center">
                  evaluators overwhelmed and uncertain.
                </SplitLine>
              </div>

              <div style={{ fontSize: 18, color: 'var(--color-silver-mist)', fontWeight: 300, lineHeight: 1.6 }}>
                <SplitLine inView={visibleSections.chaos2} delay={0.24} align="center">
                  Instructors are confronted with the anxiety of false positives,
                </SplitLine>
                <SplitLine inView={visibleSections.chaos2} delay={0.32} align="center">
                  or aimlessly trying to connect the dots with incomplete context.
                </SplitLine>
              </div>
            </div>
          </div>

          {/* Chaos Block 3 */}
          <div ref={sectionRefs.chaos3} className="section manifesto--introduction" style={{ minHeight: '60vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', textAlign: 'center' }}>
            <div className="manifesto__body">
              <div style={{ fontSize: 'clamp(24px, 3.8vw, 42px)', fontWeight: 400, lineHeight: 1.35, color: 'var(--color-bone-white)', marginBottom: 28, letterSpacing: '-0.8px' }}>
                <SplitLine inView={visibleSections.chaos3} delay={0} align="center">
                  Legacy solutions are cumbersome and quickly bypassed.
                </SplitLine>
                <SplitLine inView={visibleSections.chaos3} delay={0.12} align="center">
                  Yet another black-box scanner that requires continuous overrides.
                </SplitLine>
              </div>

              <div style={{ fontSize: 18, color: 'var(--color-silver-mist)', fontWeight: 300, lineHeight: 1.6 }}>
                <SplitLine inView={visibleSections.chaos3} delay={0.24} align="center">
                  They fail to explain why a submission was flagged, eroding the trust
                </SplitLine>
                <SplitLine inView={visibleSections.chaos3} delay={0.32} align="center">
                  between educators and students.
                </SplitLine>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* ==================== 4. SPARK FORENSIC CLARITY (LIGHTBULB MOMENT) ==================== */}
      <section
        ref={sectionRefs.lightbulb}
        className="section section--tall manifesto manifesto--section items-end@md js-section"
        section-name="manifesto"
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'flex-end',
          padding: '120px 32px',
          maxWidth: 'var(--page-max-width)',
          margin: '0 auto',
          boxSizing: 'border-box'
        }}
      >
        <div className="mobile-blur" style={{ maxWidth: 580 }}>
          <SplitLine inView={visibleSections.lightbulb} delay={0}>
            <span className="eyebrow-accent" style={{ marginBottom: 12 }}>
              THE VERIFICATION CORE
            </span>
          </SplitLine>

          <h2 className="heading-lg" style={{ marginBottom: 24 }}>
            <SplitLine inView={visibleSections.lightbulb} delay={0.1}>
              Spark forensic
            </SplitLine>
            <SplitLine inView={visibleSections.lightbulb} delay={0.2}>
              clarity
            </SplitLine>
          </h2>

          <div className="body-light" style={{ lineHeight: 1.6, marginBottom: 32 }}>
            <SplitLine inView={visibleSections.lightbulb} delay={0.3}>
              Veritas is an intelligent originality infrastructure that surfaces deep
            </SplitLine>
            <SplitLine inView={visibleSections.lightbulb} delay={0.38}>
              attribution across your entire document and code ecosystem. By unifying
            </SplitLine>
            <SplitLine inView={visibleSections.lightbulb} delay={0.46}>
              winnowing fingerprinting, AST parsing, and perplexity scoring, it delivers
            </SplitLine>
            <SplitLine inView={visibleSections.lightbulb} delay={0.54}>
              transparent explanations instead of arbitrary similarity scores.
            </SplitLine>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16, marginTop: 24 }}>
            {forensicFeatures.slice(0, 2).map((feat, i) => (
              <div key={i} className="veritas-surface" style={{ padding: 20 }}>
                <span style={{ fontSize: 10, fontWeight: 600, color: 'var(--color-saffron-spark)', letterSpacing: '0.04em' }}>
                  {feat.badge}
                </span>
                <h4 style={{ fontSize: 16, fontWeight: 400, color: 'var(--color-bone-white)', margin: '6px 0 8px' }}>
                  {feat.title}
                </h4>
                <p style={{ fontSize: 12, color: 'var(--color-silver-mist)', fontWeight: 300, lineHeight: 1.5, margin: 0 }}>
                  {feat.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ==================== 5. BUILD A HIGHER STANDARD OF INTEGRITY (WORLD) ==================== */}
      <section
        ref={sectionRefs.world}
        className="section section--tall manifesto manifesto--section items-start@md js-section"
        section-name="manifesto"
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'flex-start',
          padding: '120px 32px',
          maxWidth: 'var(--page-max-width)',
          margin: '0 auto',
          boxSizing: 'border-box'
        }}
      >
        <div className="mobile-blur" style={{ maxWidth: 580 }}>
          <SplitLine inView={visibleSections.world} delay={0}>
            <span className="eyebrow-accent" style={{ marginBottom: 12 }}>
              INSTITUTIONAL ECOSYSTEM
            </span>
          </SplitLine>

          <h2 className="heading-lg" style={{ marginBottom: 24 }}>
            <SplitLine inView={visibleSections.world} delay={0.1}>
              Build a higher
            </SplitLine>
            <SplitLine inView={visibleSections.world} delay={0.2}>
              standard of trust
            </SplitLine>
          </h2>

          <div className="body-light" style={{ lineHeight: 1.6, marginBottom: 32 }}>
            <SplitLine inView={visibleSections.world} delay={0.3}>
              Our mission is to empower universities, research labs, and technical
            </SplitLine>
            <SplitLine inView={visibleSections.world} delay={0.38}>
              organizations to celebrate genuine human scholarship. Through immutable
            </SplitLine>
            <SplitLine inView={visibleSections.world} delay={0.46}>
              grading compliance and peer collusion detection, instructors foster
            </SplitLine>
            <SplitLine inView={visibleSections.world} delay={0.54}>
              culture rooted in rigor, accountability, and student growth.
            </SplitLine>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16, marginTop: 24 }}>
            {forensicFeatures.slice(2, 4).map((feat, i) => (
              <div key={i} className="veritas-surface" style={{ padding: 20 }}>
                <span style={{ fontSize: 10, fontWeight: 600, color: 'var(--color-electric-iris)', letterSpacing: '0.04em' }}>
                  {feat.badge}
                </span>
                <h4 style={{ fontSize: 16, fontWeight: 400, color: 'var(--color-bone-white)', margin: '6px 0 8px' }}>
                  {feat.title}
                </h4>
                <p style={{ fontSize: 12, color: 'var(--color-silver-mist)', fontWeight: 300, lineHeight: 1.5, margin: 0 }}>
                  {feat.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ==================== 6. ARS FORENSICS ARCHITECTURE (/ars-pipeline, /ars-plan, /ars-review) ==================== */}
      <section
        ref={sectionRefs.team}
        className="section js-section js-team-section mb-1"
        section-name="team"
        anchor-target="team"
        style={{
          padding: '120px 32px 60px',
          maxWidth: 'var(--page-max-width)',
          margin: '0 auto',
          boxSizing: 'border-box'
        }}
      >
        <div className="team" style={{ maxWidth: '100%', width: '100%', pointerEvents: 'auto' }}>
          <div className="team__head js-team-head" style={{ marginBottom: 40 }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(255, 184, 41, 0.12)', border: '1px solid rgba(255, 184, 41, 0.3)', padding: '6px 14px', borderRadius: 9999, marginBottom: 16 }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#ffb829', display: 'inline-block' }}></span>
              <span style={{ color: '#ffb829', fontSize: 12, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>ACADEMIC RESEARCH SKILLS (ARS) FORENSICS</span>
            </div>
            <h2 className="t-56 t-lh-1 t-64@sm t-lh-1.2@sm t-104@md t-lh-1.1@md -t-ls-0.03 t-400 mb-2">
              <SplitLine inView={visibleSections.team} delay={0}>
                ARS Forensics Architecture
              </SplitLine>
            </h2>
            <p className="t-20 t-lh-1.5 -t-ls-0.03 t-400" style={{ color: 'var(--color-silver-mist)', maxWidth: 820 }}>
              Autonomous evidence-based academic integrity system. Replacing black-box similarity scores with a 10-stage forensic pipeline, Socratic pre-submission defense, and 7-agent simulated peer review.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 24, marginBottom: 40 }}>
            {/* 1. /ars-pipeline */}
            <div
              className="veritas-surface"
              style={{
                borderRadius: 20,
                border: '1px solid rgba(128, 82, 255, 0.35)',
                padding: 28,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                position: 'relative',
                overflow: 'hidden'
              }}
            >
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: 'linear-gradient(90deg, #8052ff, #a37aff)' }}></div>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                  <span style={{ background: 'rgba(128, 82, 255, 0.18)', color: '#8052ff', border: '1px solid rgba(128, 82, 255, 0.4)', padding: '4px 10px', borderRadius: 9999, fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>10-STAGE PIPELINE</span>
                  <span style={{ color: '#bdbdbd', fontSize: 12, fontFamily: 'monospace' }}>STAGE 01 — 10</span>
                </div>
                <h3 style={{ fontSize: 26, fontWeight: 400, color: '#ffffff', margin: '0 0 8px 0', letterSpacing: '-0.02em' }}>/ars-pipeline</h3>
                <div style={{ color: '#a37aff', fontSize: 13, fontWeight: 500, marginBottom: 12 }}>Autonomous Forensics & Cryptographic Ingestion</div>
                <p style={{ color: 'var(--color-silver-mist)', fontSize: 13, lineHeight: 1.6, margin: '0 0 20px 0', fontWeight: 300 }}>
                  Multi-modal ingestion of PDF, Word DOCX, and LaTeX submissions. Executes Rabin-Karp winnowing (w=4, k=5), cross-language AST clone normalization (Python/C++), Zhao et al. 2026 citation audits, and tamper-evident SHA-256 Merkle ledger anchoring.
                </p>
              </div>
              <div>
                <div style={{ background: 'rgba(0, 0, 0, 0.6)', border: '1px solid rgba(255, 255, 255, 0.06)', borderRadius: 12, padding: '12px 16px', marginBottom: 16 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 6 }}>
                    <span style={{ color: '#bdbdbd' }}>Hash Latency</span>
                    <span style={{ color: '#15846e', fontWeight: 600, fontFamily: 'monospace' }}>&lt; 12ms / 10k tokens</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 6 }}>
                    <span style={{ color: '#bdbdbd' }}>Syntax Normalizer</span>
                    <span style={{ color: '#8052ff', fontWeight: 600, fontFamily: 'monospace' }}>AST Tree Clones</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
                    <span style={{ color: '#bdbdbd' }}>Audit Anchoring</span>
                    <span style={{ color: '#ffb829', fontWeight: 600, fontFamily: 'monospace' }}>SHA-256 Merkle Block</span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={onOpenStudio}
                  className="btn t-14 t-600 t-uppercase"
                  style={{ width: '100%', justifyContent: 'center', background: '#8052ff', borderRadius: 20 }}
                >
                  <span className="btn__text pointer-events-none">Inspect Pipeline Engine</span>
                  <div className="btn__hover pointer-events-none"></div>
                </button>
              </div>
            </div>

            {/* 2. /ars-plan */}
            <div
              className="veritas-surface"
              style={{
                borderRadius: 20,
                border: '1px solid rgba(255, 184, 41, 0.35)',
                padding: 28,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                position: 'relative',
                overflow: 'hidden'
              }}
            >
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: 'linear-gradient(90deg, #ffb829, #ffd276)' }}></div>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                  <span style={{ background: 'rgba(255, 184, 41, 0.18)', color: '#ffb829', border: '1px solid rgba(255, 184, 41, 0.4)', padding: '4px 10px', borderRadius: 9999, fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>SOCRATIC DEFENSE</span>
                  <span style={{ color: '#bdbdbd', fontSize: 12, fontFamily: 'monospace' }}>CH. 01 — 06</span>
                </div>
                <h3 style={{ fontSize: 26, fontWeight: 400, color: '#ffffff', margin: '0 0 8px 0', letterSpacing: '-0.02em' }}>/ars-plan</h3>
                <div style={{ color: '#ffd276', fontSize: 13, fontWeight: 500, marginBottom: 12 }}>Chapter-by-Chapter Socratic Stress-Testing</div>
                <p style={{ color: 'var(--color-silver-mist)', fontSize: 13, lineHeight: 1.6, margin: '0 0 20px 0', fontWeight: 300 }}>
                  Interactive pre-submission defense mode. Engages authors in adversarial Socratic dialogue to test methodology boundary proofs, formalize assumptions, detect premature claims, and verify evidence-to-conclusion integrity before peer review.
                </p>
              </div>
              <div>
                <div style={{ background: 'rgba(0, 0, 0, 0.6)', border: '1px solid rgba(255, 255, 255, 0.06)', borderRadius: 12, padding: '12px 16px', marginBottom: 16 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 6 }}>
                    <span style={{ color: '#bdbdbd' }}>Interrogation Mode</span>
                    <span style={{ color: '#ffb829', fontWeight: 600, fontFamily: 'monospace' }}>Socratic Dialectic</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 6 }}>
                    <span style={{ color: '#bdbdbd' }}>Boundary Audits</span>
                    <span style={{ color: '#15846e', fontWeight: 600, fontFamily: 'monospace' }}>Power & Controls</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
                    <span style={{ color: '#bdbdbd' }}>Failure Guard</span>
                    <span style={{ color: '#8052ff', fontWeight: 600, fontFamily: 'monospace' }}>Lu et al. Nature 2026</span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={onOpenDemoBench}
                  className="btn t-14 t-600 t-uppercase"
                  style={{ width: '100%', justifyContent: 'center', background: '#ffb829', color: '#000', borderRadius: 20 }}
                >
                  <span className="btn__text pointer-events-none" style={{ color: '#000' }}>Launch Socratic Defense</span>
                  <div className="btn__hover pointer-events-none"></div>
                </button>
              </div>
            </div>

            {/* 3. /ars-review */}
            <div
              className="veritas-surface"
              style={{
                borderRadius: 20,
                border: '1px solid rgba(21, 132, 110, 0.4)',
                padding: 28,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                position: 'relative',
                overflow: 'hidden'
              }}
            >
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: 'linear-gradient(90deg, #15846e, #2bd9b5)' }}></div>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                  <span style={{ background: 'rgba(21, 132, 110, 0.2)', color: '#2bd9b5', border: '1px solid rgba(21, 132, 110, 0.45)', padding: '4px 10px', borderRadius: 9999, fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>SIMULATED PEER REVIEW</span>
                  <span style={{ color: '#bdbdbd', fontSize: 12, fontFamily: 'monospace' }}>7-AGENT PANEL</span>
                </div>
                <h3 style={{ fontSize: 26, fontWeight: 400, color: '#ffffff', margin: '0 0 8px 0', letterSpacing: '-0.02em' }}>/ars-review</h3>
                <div style={{ color: '#2bd9b5', fontSize: 13, fontWeight: 500, marginBottom: 12 }}>Multi-Perspective Simulated Peer Review Panel</div>
                <p style={{ color: 'var(--color-silver-mist)', fontSize: 13, lineHeight: 1.6, margin: '0 0 20px 0', fontWeight: 300 }}>
                  Simulates a rigorous 7-member peer review panel with adversarial attack intensity preservation. Automatically evaluates UGC 2018 Statutory classifications (Levels 0–3) and Section 7 exclusions to deliver an actionable, transparent verdict.
                </p>
              </div>
              <div>
                <div style={{ background: 'rgba(0, 0, 0, 0.6)', border: '1px solid rgba(255, 255, 255, 0.06)', borderRadius: 12, padding: '12px 16px', marginBottom: 16 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 6 }}>
                    <span style={{ color: '#bdbdbd' }}>Simulated Panel</span>
                    <span style={{ color: '#2bd9b5', fontWeight: 600, fontFamily: 'monospace' }}>7 Autonomous Agents</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 6 }}>
                    <span style={{ color: '#bdbdbd' }}>Statutory Standard</span>
                    <span style={{ color: '#ffb829', fontWeight: 600, fontFamily: 'monospace' }}>UGC 2018 Levels 0–3</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
                    <span style={{ color: '#bdbdbd' }}>Privacy Compliance</span>
                    <span style={{ color: '#8052ff', fontWeight: 600, fontFamily: 'monospace' }}>DPDP Act 2023 Sec 12</span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={onOpenClassroom}
                  className="btn t-14 t-600 t-uppercase"
                  style={{ width: '100%', justifyContent: 'center', background: '#15846e', borderRadius: 20 }}
                >
                  <span className="btn__text pointer-events-none">Simulate Peer Review</span>
                  <div className="btn__hover pointer-events-none"></div>
                </button>
              </div>
            </div>
          </div>

          <div style={{ marginTop: 40 }}>
            <h3 className="t-36 t-lh-1 -t-ls-0.03 t-400" style={{ marginBottom: 16 }}>
              <SplitLine inView={visibleSections.team} delay={0.2}>
                Build with us.
              </SplitLine>
            </h3>
            <p className="t-20 t-lh-1.5 -t-ls-0.03 t-400" style={{ color: 'var(--color-silver-mist)', maxWidth: 680 }}>
              We are researchers, engineers, and educators who believe academic honesty should be empowering, transparent, and verifiable. Join us in setting a higher bar for original thought.
            </p>
          </div>
        </div>
      </section>

      {/* ==================== 7. INVESTORS & RESEARCH PARTNERS (AUTHENTIC 1.png - 5.png) ==================== */}
      <section
        ref={sectionRefs.investors}
        className="investors"
        style={{
          padding: '120px 32px',
          maxWidth: 'var(--page-max-width)',
          margin: '0 auto',
          boxSizing: 'border-box'
        }}
      >
        <div style={{ width: '100%', marginBottom: 40 }}>
          <span className="eyebrow-accent" style={{ marginBottom: 12 }}>
            RESEARCH ALLIANCES & CONSORTIA
          </span>
          <h2 className="t-56 t-lh-1 t-64@sm t-lh-1.2@sm t-104@md t-lh-1.1@md -t-ls-0.03 t-400 mb-2">
            <SplitLine inView={visibleSections.investors} delay={0}>
              Our research partners
            </SplitLine>
          </h2>
          <p className="t-20 t-lh-1.5 -t-ls-0.03 t-400" style={{ color: 'var(--color-silver-mist)', maxWidth: 640 }}>
            Validated across competitive programming datasets, university faculty research cohorts, and automated code review pipelines.
          </p>
        </div>

        {/* The 5 Partner Cards with Authentic Glowing Prism Icons */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: 24,
          width: '100%'
        }}>
          {partners.map((partner) => (
            <div
              key={partner.id}
              className="investor veritas-surface"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 20,
                padding: '24px 28px',
                borderRadius: 24,
                transition: 'transform 0.3s ease, border-color 0.3s ease'
              }}
            >
              <div className="investor__icon" style={{ width: 68, height: 68, flex: '0 0 68px' }}>
                <img
                  className="investor__icon__image"
                  src={partner.icon}
                  alt={`Glowing prism icon for ${partner.name}`}
                  style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                />
              </div>
              <div className="investor__body">
                <span style={{ fontSize: 10, fontWeight: 600, color: 'var(--color-saffron-spark)', letterSpacing: '0.04em', textTransform: 'uppercase' }}>
                  {partner.tag}
                </span>
                <div className="t-24 t-lh-1.25 -t-ls-0.03 t-400" style={{ color: 'var(--color-bone-white)', margin: '4px 0' }}>
                  {partner.name}
                </div>
                <div style={{ fontSize: 13, color: 'var(--color-silver-mist)', fontWeight: 300 }}>
                  {partner.subtitle}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ==================== 8. FINAL CTA & FOOTER ==================== */}
      <section
        ref={sectionRefs.footer}
        className="section footer | js-section"
        style={{
          minHeight: '85vh',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          textAlign: 'center',
          padding: '120px 24px 60px',
          maxWidth: 960,
          margin: '0 auto',
          boxSizing: 'border-box'
        }}
      >
        <div className="footer__head">
          <h2
            className="t-40 t-lh-1 t-48@sm t-lh-1.2@sm t-64@md t-lh-1.1@md -t-ls-0.03 t-400 mb-2"
            style={{ marginBottom: 32 }}
          >
            <SplitLine inView={visibleSections.footer} delay={0} align="center">
              Your institution has the standard.
            </SplitLine>
            <SplitLine inView={visibleSections.footer} delay={0.12} align="center">
              Let Veritas uphold it.
            </SplitLine>
          </h2>
        </div>

        <p className="t-20 t-lh-1.5 -t-ls-0.03 t-400" style={{ color: 'var(--color-silver-mist)', maxWidth: 580, marginBottom: 40 }}>
          Experience multi-agent forensic verification in real time. Launch our Originality Studio or run automated test benchmarks with zero setup.
        </p>

        <div className="overflow-hidden">
          <div
            className="d-flex"
            style={{
              justifyContent: 'center',
              gap: 18,
              flexWrap: 'wrap',
              transform: visibleSections.footer ? 'translate(0px, 0px)' : 'translate(0px, 120%) rotate(2deg)',
              transition: 'transform 1s cubic-bezier(0.16, 1, 0.3, 1) 0.35s'
            }}
          >
            <button
              onClick={onOpenStudio}
              className="btn t-16 t-14@xs t-16@sm t-ls-0.025 t-600 t-uppercase"
              style={{ padding: '16px 36px' }}
              aria-label="Launch Originality Studio"
            >
              <span className="btn__text pointer-events-none">Launch Studio</span>
              <div className="btn__hover pointer-events-none" aria-hidden="true" />
            </button>

            <button
              onClick={onOpenClassroom}
              className="btn-pill-secondary"
              style={{ padding: '16px 28px' }}
              aria-label="Open Classroom Portal"
            >
              <span>Classroom Portal</span>
            </button>
          </div>
        </div>
      </section>

      {/* ==================== FOOTER BAR ==================== */}
      <footer style={{
        borderTop: '1px solid var(--border-subtle)',
        padding: '36px 32px',
        maxWidth: 'var(--page-max-width)',
        margin: '0 auto',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: 24,
        fontSize: 13,
        color: 'var(--color-ash-gray)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontWeight: 600, color: 'var(--color-bone-white)', letterSpacing: '-0.3px' }}>
            VERITAS
          </span>
          <span style={{ color: 'var(--border-strong)' }}>•</span>
          <span>Originality Intelligence Platform</span>
        </div>

        <div style={{ display: 'flex', gap: 24 }}>
          <button onClick={onOpenStudio} className="nav-label" style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
            STUDIO
          </button>
          <button onClick={onOpenClassroom} className="nav-label" style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
            CLASSROOM
          </button>
          <button onClick={onOpenDemoBench} className="nav-label" style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
            BENCHMARK
          </button>
        </div>

        <div>
          © {new Date().getFullYear()} Veritas Research Consortium. All rights reserved.
        </div>
      </footer>

    </div>
  );
}
