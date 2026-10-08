import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, ArrowRight, Sparkles, ShieldCheck, Cpu, Database, Network } from 'lucide-react';

/**
 * SplitLine: exact Dala rotating line reveal animation
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

export default function DalaManifestoPage({ onOpenStudio, onOpenClassroom, onOpenDemoBench, scrollProgress }) {
  const [activePartnerSlide, setActivePartnerSlide] = useState(0);

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

  // 1. Dynamic check triggered on virtual scroll translation
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

  // 2. Standard IntersectionObserver fallback
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

  const triadNodes = [
    {
      name: 'Python FastAPI Engine',
      port: 'PORT 8000',
      role: 'FORENSICS & AST VECTOR NODE',
      description: 'Executes Rabin-Karp winnowing fingerprinting, Cyrillic evasion decoding, Python AST clone detection, and perplexity burstiness metrics in <12ms.',
      icon: Cpu,
      stats: '4 Detection Modules'
    },
    {
      name: 'Spring Boot Enterprise Core',
      port: 'PORT 8080',
      role: 'INSTITUTIONAL LEDGER NODE',
      description: 'JPA-backed repository coordinating cross-submission cohort matrix queries, evaluation rubrics, gradebook compliance, and audit trails.',
      icon: Database,
      stats: 'Enterprise JPA Ledger'
    },
    {
      name: 'Originality Studio WebGL',
      port: 'PORT 5173',
      role: 'INTERACTIVE VISUALIZER NODE',
      description: 'Dual-pane synchronized diff inspection, cohort collusion heatmap clusters, and real-time 3D particle constellation telemetry.',
      icon: Network,
      stats: 'React 19 & Three.js'
    },
    {
      name: 'Veritas Zero-Trust Protocol',
      port: 'CONSORTIUM',
      role: 'ADAPTIVE AI INTEGRITY',
      description: 'Calibrating benchmark datasets against evolving LLM synthetic models to protect genuine human scholarship and academic rigor.',
      icon: ShieldCheck,
      stats: 'Open Integrity Protocol'
    }
  ];

  const partners = [
    {
      name: 'Higher Education Research Alliance',
      tier: 'TIER-1 UNIVERSITY RESEARCH',
      note: 'Evaluating multi-student collusion graphs and AST clone detection across 25,000+ computer science and humanities submissions.'
    },
    {
      name: 'Global Computer Science Consortium',
      tier: 'CODE INTEGRITY BENCHMARK',
      note: 'Benchmarked on 50,000+ competitive programming submissions against LeetCode, GitHub, and StackOverflow repos.'
    },
    {
      name: 'Autonomous AI Integrity Foundation',
      tier: 'SYNTHETIC DETECTION LAB',
      note: 'Continuous empirical tracking of LLM generation fingerprints, perplexity variance, and paraphrase evasion patterns.'
    }
  ];

  return (
    <div style={{ position: 'relative', zIndex: 1, color: 'var(--color-bone-white)', background: 'transparent' }}>
      
      {/* ==================== 1. LANDING / HERO (Frames 1-4) ==================== */}
      <div anchor-target="landing"></div>
      <section
        ref={sectionRefs.landing}
        className="section landing | js-section"
        section-name="landing"
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          padding: '140px 32px 80px',
          maxWidth: 'var(--page-max-width)',
          margin: '0 auto',
          boxSizing: 'border-box'
        }}
      >
        <div style={{ maxWidth: 640 }}>
          <h2
            className="landing__title t-56 t-80@xs t-104@sm t-150@md t-lh-0.9 -t-ls-0.03 t-400 mb-1.5 t-lh-1.1 mb-1"
            style={{ marginBottom: 28 }}
          >
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
                  Stop guessing integrity. Start verifying it.
                </div>
              </SplitLine>

              <SplitLine inView={visibleSections.landing} delay={0.45}>
                <p className="t-24 t-lh-1.5 -t-ls-0.02 t-200" style={{ marginBottom: 36, maxWidth: 540, color: 'var(--color-silver-mist)' }}>
                  Plug into the Veritas distributed intelligence triad. Three specialized engines — Python Vector & AST Fingerprinting, Spring Boot Institutional Ledger, and React Real-time Forensics — operating in synchrony to expose collusion, paraphrase evasion, and AI synthetic fabrication.
                </p>
              </SplitLine>

              <div className="overflow-hidden">
                <div
                  className="d-flex"
                  style={{
                    alignItems: 'center',
                    gap: 18,
                    flexWrap: 'wrap',
                    transform: visibleSections.landing ? 'translate(0px, 0px)' : 'translate(0px, 120%) rotate(2deg)',
                    transition: 'transform 1s cubic-bezier(0.16, 1, 0.3, 1) 0.55s'
                  }}
                >
                  <button
                    onClick={onOpenStudio}
                    className="btn t-16 t-14@xs t-16@sm t-ls-0.025 t-600 t-uppercase"
                    aria-label="Launch Originality Studio"
                  >
                    <span className="btn__text pointer-events-none">Launch Studio</span>
                    <div className="btn__hover pointer-events-none" aria-hidden="true" />
                  </button>

                  <button
                    onClick={onOpenDemoBench}
                    className="btn-ghost"
                    style={{ color: 'var(--color-silver-mist)' }}
                  >
                    <span>1-Click Bench</span>
                    <Sparkles size={15} color="var(--color-saffron-spark)" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ==================== 2. INTRODUCTION: DECISIONS WITH CONFIDENCE (Frames 5-9) ==================== */}
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
        <div className="mobile-blur" style={{ maxWidth: 560 }}>
          <SplitLine inView={visibleSections.intro} delay={0}>
            <span className="eyebrow-accent" style={{ marginBottom: 12 }}>
              TRIAD ARCHITECTURE & CONVICTION
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

      {/* ==================== 3. MANIFESTO INTRODUCTION / DISPERSED CHAOS (Frames 10-18) ==================== */}
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

      {/* ==================== 4. SPARK LIGHTBULB MOMENTS (Frames 19-29) ==================== */}
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
        <div className="manifesto__inner mobile-blur" style={{ maxWidth: 560 }}>
          <SplitLine inView={visibleSections.lightbulb} delay={0}>
            <span className="eyebrow-accent" style={{ marginBottom: 12 }}>
              A CLEAR SOURCE OF TRUTH
            </span>
          </SplitLine>

          <h2 className="heading-lg" style={{ marginBottom: 28 }}>
            <SplitLine inView={visibleSections.lightbulb} delay={0.1}>
              Spark lightbulb
            </SplitLine>
            <SplitLine inView={visibleSections.lightbulb} delay={0.2}>
              moments
            </SplitLine>
          </h2>

          <div className="manifesto__body" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div className="body-light">
              <SplitLine inView={visibleSections.lightbulb} delay={0.3}>
                Veritas is your intelligent, real-time source of truth that
              </SplitLine>
              <SplitLine inView={visibleSections.lightbulb} delay={0.36}>
                eliminates the anxiety and ambiguity of splintered scanners.
              </SplitLine>
            </div>

            <div className="body-light">
              <SplitLine inView={visibleSections.lightbulb} delay={0.42}>
                We connect the three engines behind the scenes and pull together
              </SplitLine>
              <SplitLine inView={visibleSections.lightbulb} delay={0.48}>
                exactly the forensic proof into an elegant side-by-side view.
              </SplitLine>
            </div>

            <div className="body-light">
              <SplitLine inView={visibleSections.lightbulb} delay={0.54}>
                Empower your faculty with mathematical conviction and clarity.
              </SplitLine>
            </div>
          </div>
        </div>
      </section>

      {/* ==================== 5. BUILD A BETTER WORLD OF WORK / LEARNING (Frames 30-34) ==================== */}
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
        <div className="manifesto__inner mobile-blur" style={{ maxWidth: 560 }}>
          <SplitLine inView={visibleSections.world} delay={0}>
            <span className="eyebrow-accent" style={{ marginBottom: 12 }}>
              INTENTIONAL RIGOR & PURPOSE
            </span>
          </SplitLine>

          <h2 className="heading-lg" style={{ marginBottom: 28 }}>
            <SplitLine inView={visibleSections.world} delay={0.1}>
              Build a culture
            </SplitLine>
            <SplitLine inView={visibleSections.world} delay={0.2}>
              of genuine originality
            </SplitLine>
          </h2>

          <div className="manifesto__body" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div className="body-light">
              <SplitLine inView={visibleSections.world} delay={0.3}>
                Our mission is to restore trust in human scholarship —
              </SplitLine>
              <SplitLine inView={visibleSections.world} delay={0.36}>
                reframing integrity from punitive policing to authentic mastery.
              </SplitLine>
            </div>

            <div className="body-light">
              <SplitLine inView={visibleSections.world} delay={0.42}>
                Students and researchers produce their best work when submissions
              </SplitLine>
              <SplitLine inView={visibleSections.world} delay={0.48}>
                are evaluated with transparent explainability and fairness.
              </SplitLine>
            </div>

            <div className="body-light">
              <SplitLine inView={visibleSections.world} delay={0.54}>
                We want to recreate that confidence on every submission.
              </SplitLine>
            </div>
          </div>
        </div>
      </section>

      {/* ==================== 6. THE ENGINES BEHIND VERITAS (TEAM) ==================== */}
      <section
        ref={sectionRefs.team}
        className="section js-section js-team-section mb-1"
        section-name="team"
        anchor-target="team"
        style={{
          minHeight: '80vh',
          padding: '120px 32px 80px',
          maxWidth: 'var(--page-max-width)',
          margin: '0 auto',
          boxSizing: 'border-box'
        }}
      >
        <div style={{ marginBottom: 48 }}>
          <SplitLine inView={visibleSections.team} delay={0}>
            <span className="eyebrow-accent">THE TRIAD ARCHITECTURE</span>
          </SplitLine>
          <h2 className="heading-md">
            <SplitLine inView={visibleSections.team} delay={0.1}>
              The engines behind Veritas
            </SplitLine>
          </h2>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
          gap: 28
        }}>
          {triadNodes.map((node, idx) => {
            const IconComponent = node.icon;
            return (
              <div
                key={idx}
                style={{
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 24,
                  padding: 28,
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  transition: 'transform 0.25s ease, border-color 0.25s ease, background-color 0.25s ease'
                }}
              >
                <div>
                  <div style={{
                    width: '100%',
                    height: 180,
                    borderRadius: 16,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: 'rgba(128, 82, 255, 0.06)',
                    border: '1px solid var(--border-subtle)',
                    marginBottom: 20,
                    gap: 12
                  }}>
                    <IconComponent size={40} color="var(--color-electric-iris)" />
                    <span style={{
                      fontSize: 11,
                      fontWeight: 600,
                      letterSpacing: '0.04em',
                      color: 'var(--color-saffron-spark)'
                    }}>
                      {node.port}
                    </span>
                  </div>

                  <div style={{
                    fontSize: 12,
                    fontWeight: 600,
                    textTransform: 'uppercase',
                    letterSpacing: '0.025em',
                    color: 'var(--color-electric-iris)',
                    marginBottom: 6
                  }}>
                    {node.role}
                  </div>

                  <h3 style={{ fontSize: 22, fontWeight: 400, color: 'var(--color-bone-white)', marginBottom: 12 }}>
                    {node.name}
                  </h3>

                  <p style={{ fontSize: 13, color: 'var(--color-silver-mist)', fontWeight: 300, lineHeight: 1.6 }}>
                    {node.description}
                  </p>
                </div>

                <div style={{
                  marginTop: 20,
                  paddingTop: 16,
                  borderTop: '1px solid var(--border-subtle)',
                  fontSize: 11,
                  fontWeight: 600,
                  color: 'var(--color-ash-gray)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em'
                }}>
                  {node.stats}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ==================== 7. INVESTORS & PARTNERS (Frames 35-39) ==================== */}
      <section
        ref={sectionRefs.investors}
        className="investors"
        style={{
          minHeight: '80vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'flex-end',
          padding: '120px 32px',
          maxWidth: 'var(--page-max-width)',
          margin: '0 auto',
          boxSizing: 'border-box'
        }}
      >
        <div style={{ maxWidth: 540 }}>
          {/* Arrow navigation buttons in violet circles */}
          <div style={{ display: 'flex', gap: 12, marginBottom: 32 }}>
            <button
              onClick={() => setActivePartnerSlide(prev => (prev - 1 + partners.length) % partners.length)}
              style={{
                width: 42,
                height: 42,
                borderRadius: '50%',
                background: 'var(--color-electric-iris)',
                border: 'none',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer'
              }}
              aria-label="Previous partner"
            >
              <ArrowLeft size={18} />
            </button>
            <button
              onClick={() => setActivePartnerSlide(prev => (prev + 1) % partners.length)}
              style={{
                width: 42,
                height: 42,
                borderRadius: '50%',
                background: 'var(--color-electric-iris)',
                border: 'none',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer'
              }}
              aria-label="Next partner"
            >
              <ArrowRight size={18} />
            </button>
          </div>

          <h2 className="heading-lg" style={{ marginBottom: 24 }}>
            <SplitLine inView={visibleSections.investors} delay={0}>
              Validated across
            </SplitLine>
            <SplitLine inView={visibleSections.investors} delay={0.1}>
              academia
            </SplitLine>
          </h2>

          <div className="body-light" style={{ lineHeight: 1.6, marginBottom: 32 }}>
            <SplitLine inView={visibleSections.investors} delay={0.2}>
              We collaborate with leading research consortia, computer science
            </SplitLine>
            <SplitLine inView={visibleSections.investors} delay={0.28}>
              departments, and AI labs to continually benchmark detection fidelity.
            </SplitLine>
          </div>

          <div style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 20,
            padding: 24
          }}>
            <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--color-saffron-spark)', textTransform: 'uppercase' }}>
              {partners[activePartnerSlide].tier}
            </span>
            <h4 style={{ fontSize: 20, fontWeight: 400, color: 'var(--color-bone-white)', margin: '6px 0 8px' }}>
              {partners[activePartnerSlide].name}
            </h4>
            <p style={{ fontSize: 13, color: 'var(--color-silver-mist)', fontWeight: 300, lineHeight: 1.5 }}>
              {partners[activePartnerSlide].note}
            </p>
          </div>
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
          padding: '120px 24px',
          maxWidth: 900,
          margin: '0 auto',
          boxSizing: 'border-box'
        }}
      >
        <h2 style={{
          fontSize: 'clamp(36px, 5.5vw, 68px)',
          fontWeight: 400,
          letterSpacing: '-2.4px',
          color: 'var(--color-bone-white)',
          lineHeight: 1.15,
          marginBottom: 36
        }}>
          <SplitLine inView={visibleSections.footer} delay={0} align="center">
            Your institution has the standard.
          </SplitLine>
          <SplitLine inView={visibleSections.footer} delay={0.12} align="center">
            Veritas delivers the proof.
          </SplitLine>
        </h2>

        <button
          onClick={onOpenStudio}
          className="btn t-16 t-14@xs t-16@sm t-ls-0.025 t-600 t-uppercase"
          style={{ padding: '16px 36px', fontSize: 14 }}
          aria-label="Launch Originality Studio"
        >
          <span className="btn__text pointer-events-none">Launch Originality Studio</span>
          <div className="btn__hover pointer-events-none" aria-hidden="true" />
        </button>
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
        <div>
          <span>© 2026 Veritas Technologies Limited.</span>{' '}
          <span style={{ color: 'var(--color-silver-mist)' }}>All rights reserved.</span>
        </div>

        <div style={{ display: 'flex', gap: 28, textTransform: 'uppercase', letterSpacing: '0.025em', fontSize: 12, fontWeight: 600 }}>
          <span onClick={onOpenStudio} style={{ color: 'var(--color-bone-white)', cursor: 'pointer' }}>Studio</span>
          <span onClick={onOpenClassroom} style={{ cursor: 'pointer' }}>Classroom</span>
          <span onClick={onOpenDemoBench} style={{ cursor: 'pointer' }}>Demo Bench</span>
          <span style={{ cursor: 'pointer' }}>Research Docs</span>
          <span style={{ cursor: 'pointer' }}>Privacy</span>
        </div>

        <div style={{ display: 'flex', gap: 20 }}>
          <span style={{ cursor: 'pointer' }}>GitHub</span>
          <span style={{ cursor: 'pointer' }}>Docs</span>
          <span style={{ cursor: 'pointer' }}>Contact</span>
        </div>
      </footer>

    </div>
  );
}
