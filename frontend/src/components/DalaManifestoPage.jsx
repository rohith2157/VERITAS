import React, { useState } from 'react';
import { ArrowLeft, ArrowRight, Sparkles, CheckCircle, ExternalLink } from 'lucide-react';

export default function DalaManifestoPage({ onOpenStudio, onOpenClassroom, onOpenDemoBench }) {
  const [activeTeamSlide, setActiveTeamSlide] = useState(0);
  const [activeInvestorSlide, setActiveInvestorSlide] = useState(0);

  const teamMembers = [
    {
      name: 'Haroun Hickman',
      role: 'FOUNDER & CEO',
      bio: 'Leading vision and product architecture at the intersection of collective intelligence and human workflow.',
      image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80'
    },
    {
      name: 'Poppy Reid',
      role: 'HEAD OF PRODUCT',
      bio: 'Designing effortless interfaces that transform organizational knowledge fragments into shared understanding.',
      image: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=600&q=80'
    },
    {
      name: 'Joel Kang',
      role: 'CO-FOUNDER & CTO',
      bio: 'Building bleeding-edge distributed vector indices, algorithmic collusion networks, and real-time inference pipelines.',
      image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=600&q=80'
    },
    {
      name: 'Build with us.',
      role: 'JOIN THE MISSION',
      bio: 'We are actively hiring intentional, empathetic and curious people. Email careers@dala.ai with your portfolio.',
      isHiring: true
    }
  ];

  const investors = [
    { name: 'Progressive Operator Fund', tier: 'LEAD OPERATOR', note: 'Backing next-generation knowledge infrastructure' },
    { name: 'Autonomous Capital', tier: 'EARLY STAGE', note: 'Distributed intelligence and enterprise scale' },
    { name: 'Velocity Ventures', tier: 'SEED PARTNER', note: 'Human-centric AI workflows' },
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
            STOP MANAGING KNOWLEDGE. START USING IT.
          </div>

          <h1 className="display-title" style={{ marginBottom: 32, lineHeight: 1.05 }}>
            <span style={{ display: 'block' }}>Unlock</span>
            <span style={{ display: 'block' }}>collective</span>
            <span style={{ display: 'block' }}>wisdom.</span>
          </h1>

          <p className="body-light" style={{ marginBottom: 40, maxWidth: 520, lineHeight: 1.6 }}>
            Plug into your team's shared brainpower. Ask Dala to instantly find anything or anyone from any workplace system. Focus on doing your best work with context, conviction and clarity.
          </p>

          <div style={{ display: 'flex', alignItems: 'center', gap: 18, flexWrap: 'wrap' }}>
            <button
              onClick={onOpenStudio}
              className="btn-pill-primary"
            >
              Request Access
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
            CONTEXT & CONVICTION
          </span>

          <h2 className="heading-lg" style={{ marginBottom: 28 }}>
            Make decisions with confidence
          </h2>

          <p className="body-light" style={{ lineHeight: 1.6 }}>
            Dala's bleeding-edge AI search tool automates extracting knowledge from across your organisation so that you can take the guesswork out of your work.
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
          color: '#ffffff',
          marginBottom: 48,
          letterSpacing: '-0.8px'
        }}>
          This is your workplace today. Countless fragments of critical knowledge scattered across hundreds of disparate systems.
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
            30% of your time is spent trying to organise and find the information and expertise you need to do your job.
          </p>
          <p>
            The impossible battle to make sense of this chaos leaves your team feeling overwhelmed and unproductive.
          </p>
          <p style={{ color: 'var(--color-saffron-spark)', fontWeight: 400 }}>
            aimlessly trying to connect the dots with incomplete context.
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
            A CLEAR SOURCE OF TRUTH
          </span>

          <h2 className="heading-lg" style={{ marginBottom: 28 }}>
            Spark lightbulb moments
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <p className="body-light">
              Dala is your intelligent, real-time source of truth that eliminates the cultural, financial and operational struggles of splintered tools.
            </p>
            <p className="body-light">
              We connect your systems behind the scenes and pull together exactly the knowledge you require into an elegant contextual view.
            </p>
            <p className="body-light">
              Just ask Dala for the answer that advances your work, and helps you make better decisions with more confidence.
            </p>
          </div>
        </div>
      </section>

      {/* ==================== 5. BUILD A BETTER WORLD OF WORK (Frames 30-34) ==================== */}
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
            INTENTIONAL PRODUCTIVITY
          </span>

          <h2 className="heading-lg" style={{ marginBottom: 28 }}>
            Build a better world of work
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <p className="body-light">
              Our mission is to make work more coherent and delightful — reframing productivity from <em>doing more</em> to <em>being better</em>.
            </p>
            <p className="body-light">
              Your happiest and most purposeful moments at work are when you're in flow, intellectually stimulated, and creating value for customers.
            </p>
            <p className="body-light">
              We want to recreate that every time you experience Dala. A tool that is completely integrated with how you think, feel and work.
            </p>
          </div>
        </div>
      </section>

      {/* ==================== 6. OUR TEAM ==================== */}
      <section style={{
        minHeight: '80vh',
        padding: '100px 32px',
        maxWidth: 'var(--page-max-width)',
        margin: '0 auto',
        boxSizing: 'border-box'
      }}>
        <div style={{ marginBottom: 48 }}>
          <span className="eyebrow-accent">PEOPLE BEHIND DALA</span>
          <h2 className="heading-md">Our team</h2>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
          gap: 28
        }}>
          {teamMembers.map((m, idx) => (
            <div
              key={idx}
              style={{
                background: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: 24,
                padding: 28,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                transition: 'transform 0.2s ease, border-color 0.2s ease'
              }}
            >
              <div>
                {m.image ? (
                  <div style={{
                    width: '100%',
                    height: 220,
                    borderRadius: 16,
                    overflow: 'hidden',
                    marginBottom: 20,
                    background: '#0a0a0c'
                  }}>
                    <img
                      src={m.image}
                      alt={m.name}
                      style={{ width: '100%', height: '100%', objectFit: 'cover', filter: 'grayscale(100%)' }}
                    />
                  </div>
                ) : (
                  <div style={{
                    width: '100%',
                    height: 220,
                    borderRadius: 16,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: 'rgba(128, 82, 255, 0.08)',
                    border: '1px dashed var(--color-electric-iris)',
                    marginBottom: 20
                  }}>
                    <span style={{ fontSize: 48 }}>🚀</span>
                  </div>
                )}

                <div style={{
                  fontSize: 12,
                  fontWeight: 600,
                  textTransform: 'uppercase',
                  letterSpacing: '0.025em',
                  color: 'var(--color-electric-iris)',
                  marginBottom: 6
                }}>
                  {m.role}
                </div>

                <h3 style={{ fontSize: 22, fontWeight: 400, color: '#ffffff', marginBottom: 12 }}>
                  {m.name}
                </h3>

                <p style={{ fontSize: 13, color: 'var(--color-silver-mist)', fontWeight: 200, lineHeight: 1.6 }}>
                  {m.bio}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ==================== 7. OUR INVESTORS (Frames 35-39) ==================== */}
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
              onClick={() => setActiveInvestorSlide(prev => (prev - 1 + investors.length) % investors.length)}
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
            >
              <ArrowLeft size={18} />
            </button>
            <button
              onClick={() => setActiveInvestorSlide(prev => (prev + 1) % investors.length)}
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
            >
              <ArrowRight size={18} />
            </button>
          </div>

          <h2 className="heading-lg" style={{ marginBottom: 24 }}>
            Our investors
          </h2>

          <p className="body-light" style={{ lineHeight: 1.6, marginBottom: 32 }}>
            We are supported by some of the world's most pioneering operators and progressive funds to fuel our growth.
          </p>

          <div style={{
            background: 'rgba(255, 255, 255, 0.04)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: 20,
            padding: 24
          }}>
            <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--color-saffron-spark)', textTransform: 'uppercase' }}>
              {investors[activeInvestorSlide].tier}
            </span>
            <h4 style={{ fontSize: 20, fontWeight: 400, color: '#ffffff', margin: '6px 0 8px' }}>
              {investors[activeInvestorSlide].name}
            </h4>
            <p style={{ fontSize: 13, color: 'var(--color-silver-mist)', fontWeight: 200 }}>
              {investors[activeInvestorSlide].note}
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
          color: '#ffffff',
          lineHeight: 1.15,
          marginBottom: 36
        }}>
          Your workplace has the answer.<br />
          Ask Dala to find it.
        </h2>

        <button
          onClick={onOpenStudio}
          className="btn-pill-primary"
          style={{ padding: '16px 36px', fontSize: 14 }}
        >
          Request Access
        </button>
      </section>

      {/* ==================== 9. EXACT FOOTER (Frame 42) ==================== */}
      <footer style={{
        borderTop: '1px solid rgba(255, 255, 255, 0.08)',
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
          <span>© 2021 Dala Technologies Limited.</span>{' '}
          <span style={{ color: 'var(--color-silver-mist)' }}>All rights reserved.</span>
        </div>

        <div style={{ display: 'flex', gap: 28, textTransform: 'uppercase', letterSpacing: '0.025em', fontSize: 12, fontWeight: 600 }}>
          <span style={{ color: '#ffffff', cursor: 'pointer' }}>Manifesto</span>
          <span style={{ cursor: 'pointer' }}>Team</span>
          <span style={{ cursor: 'pointer' }}>Blog</span>
          <span style={{ cursor: 'pointer' }}>Privacy</span>
          <span style={{ cursor: 'pointer' }}>Terms</span>
        </div>

        <div style={{ display: 'flex', gap: 20 }}>
          <span style={{ cursor: 'pointer' }}>LinkedIn</span>
          <span style={{ cursor: 'pointer' }}>Twitter</span>
          <span style={{ cursor: 'pointer' }}>Email</span>
        </div>
      </footer>

    </div>
  );
}

