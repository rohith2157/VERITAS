import React, { useState } from 'react';
import { ArrowLeft, ArrowRight, Sparkles, CheckCircle, ShieldCheck, Cpu, Database, Network } from 'lucide-react';

export default function DalaManifestoPage({ onOpenStudio, onOpenClassroom, onOpenDemoBench }) {
  const [activePartnerSlide, setActivePartnerSlide] = useState(0);

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
      
      {/* ==================== 1. HERO SECTION (Frames 1-4) ==================== */}
      <section style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        padding: '120px 32px 60px',
        maxWidth: 'var(--page-max-width)',
        margin: '0 auto',
        boxSizing: 'border-box'
      }}>
        <div style={{ maxWidth: 620 }}>
          <div style={{
            fontSize: 13,
            fontWeight: 600,
            textTransform: 'uppercase',
            letterSpacing: '0.35px',
            color: 'var(--color-saffron-spark)',
            marginBottom: 24,
            display: 'inline-block'
          }}>
            STOP GUESSING INTEGRITY. VERIFY WITH COLLECTIVE TRUTH.
          </div>

          <h1 className="display-title" style={{ marginBottom: 32, lineHeight: 1.05 }}>
            <span style={{ display: 'block' }}>Unlock</span>
            <span style={{ display: 'block' }}>collective</span>
            <span style={{ display: 'block' }}>truth.</span>
          </h1>

          <p className="body-light" style={{ marginBottom: 40, maxWidth: 540, lineHeight: 1.6 }}>
            Plug into the Veritas distributed intelligence triad. Three specialized engines — Python Vector & AST Fingerprinting, Spring Boot Institutional Ledger, and React Real-time Forensics — operating in synchrony to expose collusion, paraphrase evasion, and AI synthetic fabrication.
          </p>

          <div style={{ display: 'flex', alignItems: 'center', gap: 18, flexWrap: 'wrap' }}>
            <button
              onClick={onOpenStudio}
              className="btn-pill-primary"
            >
              Launch Studio
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
      </section>

      {/* ==================== 2. MAKE DECISIONS WITH CONFIDENCE (Frames 5-9) ==================== */}
      <section style={{
        minHeight: '90vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'flex-end',
        padding: '100px 32px',
        maxWidth: 'var(--page-max-width)',
        margin: '0 auto',
        boxSizing: 'border-box'
      }}>
        <div style={{ maxWidth: 540 }}>
          <span className="eyebrow-accent">
            TRIAD ARCHITECTURE & CONVICTION
          </span>

          <h2 className="heading-lg" style={{ marginBottom: 28 }}>
            Make decisions with confidence
          </h2>

          <p className="body-light" style={{ lineHeight: 1.6 }}>
            Veritas unifies three autonomous detection nodes in a continuous verification circle. While traditional scanners check isolated strings, our triad correlates structural AST syntax trees, cross-language homoglyph attacks, and semantic perplexity in milliseconds.
          </p>
        </div>
      </section>

      {/* ==================== 3. CHAOS & DISPERSED FRAGMENTS (Frames 10-18) ==================== */}
      <section style={{
        minHeight: '110vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        textAlign: 'center',
        padding: '120px 24px',
        maxWidth: 900,
        margin: '0 auto',
        boxSizing: 'border-box'
      }}>
        <p style={{
          fontSize: 'clamp(22px, 3.5vw, 36px)',
          fontWeight: 400,
          lineHeight: 1.35,
          color: 'var(--color-bone-white)',
          marginBottom: 48,
          letterSpacing: '-0.8px'
        }}>
          This is academic evaluation today. Dispersed submissions, siloed classrooms, undetected AI substitutions, and fragmented grading criteria.
        </p>

        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 24,
          maxWidth: 680,
          color: 'var(--color-silver-mist)',
          fontSize: 18,
          fontWeight: 200,
          lineHeight: 1.6
        }}>
          <p>
            30% of faculty hours are consumed cross-checking code duplicates and investigating disguised text.
          </p>
          <p>
            Single-vector plagiarism detectors miss Cyrillic homoglyph substitutions, structural AST reshuffling, and LLM burstiness anomalies.
          </p>
          <p style={{ color: 'var(--color-saffron-spark)', fontWeight: 400 }}>
            Leaving instructors to connect the dots with incomplete evidence and subjective guesswork.
          </p>
        </div>
      </section>

      {/* ==================== 4. SPARK LIGHTBULB MOMENTS (Frames 19-29) ==================== */}
      <section style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'flex-end',
        padding: '100px 32px',
        maxWidth: 'var(--page-max-width)',
        margin: '0 auto',
        boxSizing: 'border-box'
      }}>
        <div style={{ maxWidth: 560 }}>
          <span className="eyebrow-accent">
            TRIAD CONSENSUS & PROOF
          </span>

          <h2 className="heading-lg" style={{ marginBottom: 28 }}>
            Spark lightbulb moments
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <p className="body-light">
              Veritas acts as your unified, real-time integrity engine that eliminates the ambiguity of single-score cheating reports.
            </p>
            <p className="body-light">
              Node A (FastAPI) parses winnowing k-grams and AST syntax trees; Node B (Spring Boot) cross-validates institution-wide student cohorts; Node C (Studio) surfaces visual side-by-side diff matrices.
            </p>
            <p className="body-light">
              Immediate, mathematical proof that empowers educators to mentor rather than police.
            </p>
          </div>
        </div>
      </section>

      {/* ==================== 5. BUILD A CULTURE OF ORIGINALITY (Frames 30-34) ==================== */}
      <section style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        padding: '100px 32px',
        maxWidth: 'var(--page-max-width)',
        margin: '0 auto',
        boxSizing: 'border-box'
      }}>
        <div style={{ maxWidth: 560 }}>
          <span className="eyebrow-accent">
            INTENTIONAL RIGOR & EMPATHY
          </span>

          <h2 className="heading-lg" style={{ marginBottom: 28 }}>
            Build a culture of genuine originality
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <p className="body-light">
              Our mission is to restore trust in human authorship and student inquiry — reframing integrity from punitive surveillance to authentic mastery.
            </p>
            <p className="body-light">
              Educators and students do their best work when submissions are evaluated with objective rigor, transparent explainability, and pedagogical empathy.
            </p>
            <p className="body-light">
              Every scan generates actionable forensic insight, proving where thought originated and how ideas evolved.
            </p>
          </div>
        </div>
      </section>

      {/* ==================== 6. THE ENGINES BEHIND VERITAS ==================== */}
      <section style={{
        minHeight: '80vh',
        padding: '100px 32px',
        maxWidth: 'var(--page-max-width)',
        margin: '0 auto',
        boxSizing: 'border-box'
      }}>
        <div style={{ marginBottom: 48 }}>
          <span className="eyebrow-accent">THE TRIAD ARCHITECTURE</span>
          <h2 className="heading-md">The engines behind Veritas</h2>
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
                  transition: 'transform 0.2s ease, border-color 0.2s ease, background-color 0.2s ease'
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

      {/* ==================== 7. INSTITUTIONAL ACCREDITATION (Frames 35-39) ==================== */}
      <section style={{
        minHeight: '80vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'flex-end',
        padding: '100px 32px',
        maxWidth: 'var(--page-max-width)',
        margin: '0 auto',
        boxSizing: 'border-box'
      }}>
        <div style={{ maxWidth: 540 }}>
          {/* Arrow navigation buttons in purple circles */}
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
            Validated across academia
          </h2>

          <p className="body-light" style={{ lineHeight: 1.6, marginBottom: 32 }}>
            We collaborate with leading academic consortia, computer science departments, and AI safety labs to continually benchmark detection fidelity.
          </p>

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

      {/* ==================== 8. FINAL CTA & LOGO CONVERGENCE (Frames 40-42) ==================== */}
      <section style={{
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
      }}>
        <h2 style={{
          fontSize: 'clamp(36px, 5.5vw, 68px)',
          fontWeight: 400,
          letterSpacing: '-2.4px',
          color: 'var(--color-bone-white)',
          lineHeight: 1.15,
          marginBottom: 36
        }}>
          Your institution has the standard.<br />
          Veritas delivers the proof.
        </h2>

        <button
          onClick={onOpenStudio}
          className="btn-pill-primary"
          style={{ padding: '16px 36px', fontSize: 14 }}
        >
          Launch Originality Studio
        </button>
      </section>

      {/* ==================== 9. FOOTER ==================== */}
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
