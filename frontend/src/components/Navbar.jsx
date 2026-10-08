import React from 'react';

export default function Navbar({ activeTab, setActiveTab, activeTier, setActiveTier, serverStatus }) {
  const navLinks = [
    { id: 'studio', label: 'Studio' },
    { id: 'classroom', label: 'Classroom' },
    { id: 'demobench', label: 'Demo Bench' },
  ];

  return (
    <header style={{
      position: 'sticky',
      top: 0,
      zIndex: 100,
      background: 'rgba(0, 0, 0, 0.85)',
      backdropFilter: 'blur(12px)',
      borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
      padding: '18px 32px'
    }}>
      <div style={{
        maxWidth: 'var(--page-max-width)',
        margin: '0 auto',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        
        {/* Brand Lockup: Sharp Triangular Icon + Monolithic Wordmark */}
        <div
          onClick={() => setActiveTab('hero')}
          style={{ display: 'flex', alignItems: 'center', gap: 14, cursor: 'pointer' }}
        >
          {/* Triangular Brand Glyph with Violet-Teal Gradient */}
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
            <defs>
              <linearGradient id="dala-logo-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#8052ff" />
                <stop offset="100%" stopColor="#15846e" />
              </linearGradient>
            </defs>
            <polygon points="12,2 22,20 2,20" fill="url(#dala-logo-grad)" />
          </svg>

          <span style={{
            fontSize: 16,
            fontWeight: 400,
            letterSpacing: '-0.3px',
            color: 'var(--color-bone-white)',
            textTransform: 'uppercase'
          }}>
            Veritas
          </span>

          <span style={{
            fontSize: 11,
            color: 'var(--color-ash-gray)',
            letterSpacing: '0.04em',
            textTransform: 'uppercase',
            borderLeft: '1px solid rgba(255,255,255,0.12)',
            paddingLeft: 12
          }}>
            Dala Edition
          </span>
        </div>

        {/* Center Nav Links: PPNeueMontreal 14px Weight 600 Uppercase */}
        <nav style={{ display: 'flex', alignItems: 'center', gap: 32 }}>
          {navLinks.map(link => {
            const isActive = activeTab === link.id;
            return (
              <button
                key={link.id}
                onClick={() => setActiveTab(link.id)}
                className={`btn-ghost ${isActive ? 'active' : ''}`}
                style={{
                  color: isActive ? 'var(--color-bone-white)' : 'var(--color-ash-gray)',
                  fontSize: 14,
                  fontWeight: 600,
                  textTransform: 'uppercase',
                  letterSpacing: '0.35px',
                  background: 'none',
                  border: 'none',
                  padding: '4px 0',
                  position: 'relative',
                  cursor: 'pointer'
                }}
              >
                {link.label}
                {isActive && (
                  <span style={{
                    position: 'absolute',
                    bottom: -4,
                    left: 0,
                    right: 0,
                    height: 2,
                    background: 'var(--color-electric-iris)',
                    borderRadius: 2
                  }} />
                )}
              </button>
            );
          })}
        </nav>

        {/* Right Section: Service Pulse + Primary Action Pill */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          
          {/* Micro Telemetry Indicator */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            fontSize: 11,
            fontWeight: 600,
            textTransform: 'uppercase',
            letterSpacing: '0.04em',
            color: serverStatus?.online ? '#34d399' : 'var(--color-ash-gray)'
          }}>
            <span style={{
              width: 6,
              height: 6,
              borderRadius: '50%',
              backgroundColor: serverStatus?.online ? '#34d399' : '#f87171',
              boxShadow: serverStatus?.online ? '0 0 8px #34d399' : 'none'
            }} />
            <span>{serverStatus?.online ? 'Connected' : 'Engines Offline'}</span>
          </div>

          {/* Singular Dala Primary Violet Pill Button */}
          <button
            onClick={() => setActiveTab('studio')}
            className="btn-pill-primary"
            style={{
              padding: '10px 20px',
              fontSize: 12,
              borderRadius: 24
            }}
          >
            Launch Studio
          </button>

        </div>

      </div>
    </header>
  );
}
