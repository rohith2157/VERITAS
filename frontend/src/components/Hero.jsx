import React from 'react';
import ConstellationCanvas from './ConstellationCanvas';
import { ArrowRight, Sparkles } from 'lucide-react';

export default function Hero({ onExploreStudio, onOpenDemoBench }) {
  return (
    <section style={{
      position: 'relative',
      minHeight: '85vh',
      display: 'flex',
      alignItems: 'center',
      background: 'var(--color-void)',
      overflow: 'hidden',
      padding: '40px 0'
    }}>
      <div style={{
        maxWidth: 'var(--page-max-width)',
        margin: '0 auto',
        padding: '0 24px',
        width: '100%',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
        alignItems: 'center',
        gap: '48px'
      }}>
        {/* Left Column: Monolithic Monospaced Typography */}
        <div style={{ zIndex: 10, maxWidth: 580 }}>
          <span className="eyebrow-accent">
            Knowledge as Distributed Intelligence
          </span>

          <h1 className="display-title" style={{ marginBottom: 24 }}>
            Unlock collective integrity.
          </h1>

          <p className="body-light" style={{ marginBottom: 36, maxWidth: 480 }}>
            Veritas unifies forensic document analysis, cohort collusion tracking, and code cloning across the black void — designed with distributed intelligence at its core.
          </p>

          <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
            <button
              onClick={onExploreStudio}
              className="btn-pill-primary"
            >
              <span>Launch Studio</span>
              <ArrowRight size={16} />
            </button>

            <button
              onClick={onOpenDemoBench}
              className="btn-ghost"
            >
              <span>1-Click Bench</span>
              <Sparkles size={15} color="var(--color-saffron-spark)" />
            </button>
          </div>

          {/* Quick Metrics / Signals */}
          <div style={{
            display: 'flex',
            gap: 32,
            marginTop: 48,
            paddingTop: 32,
            borderTop: '1px solid rgba(255, 255, 255, 0.08)'
          }}>
            <div>
              <div style={{ fontSize: 24, fontWeight: 400, color: 'var(--color-bone-white)', letterSpacing: -0.5 }}>
                100%
              </div>
              <div style={{ fontSize: 12, fontWeight: 400, color: 'var(--color-ash-gray)', marginTop: 4, textTransform: 'uppercase', letterSpacing: '0.025em' }}>
                Homoglyph Immunity
              </div>
            </div>

            <div>
              <div style={{ fontSize: 24, fontWeight: 400, color: 'var(--color-saffron-spark)', letterSpacing: -0.5 }}>
                O(N²)
              </div>
              <div style={{ fontSize: 12, fontWeight: 400, color: 'var(--color-ash-gray)', marginTop: 4, textTransform: 'uppercase', letterSpacing: '0.025em' }}>
                Cohort Graph
              </div>
            </div>

            <div>
              <div style={{ fontSize: 24, fontWeight: 400, color: 'var(--color-electric-iris)', letterSpacing: -0.5 }}>
                AST
              </div>
              <div style={{ fontSize: 12, fontWeight: 400, color: 'var(--color-ash-gray)', marginTop: 4, textTransform: 'uppercase', letterSpacing: '0.025em' }}>
                Syntactic Normalization
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Signature Dala Particle Brain */}
        <div style={{
          position: 'relative',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: 520
        }}>
          <ConstellationCanvas height={560} interactive={true} />
        </div>
      </div>
    </section>
  );
}
