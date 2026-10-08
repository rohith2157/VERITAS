import React from 'react';

export default function Navbar({ activeTab, setActiveTab, serverStatus }) {
  const navLinks = [
    { id: 'manifesto', label: 'Manifesto' },
    { id: 'studio', label: 'Originality Studio' },
    { id: 'classroom', label: 'Classroom' },
    { id: 'demobench', label: 'Demo Bench' },
  ];

  return (
    <header style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      zIndex: 100,
      background: 'rgba(0, 0, 0, 0.75)',
      backdropFilter: 'blur(16px)',
      borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
      padding: '16px 32px'
    }}>
      <div style={{
        maxWidth: 'var(--page-max-width)',
        margin: '0 auto',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        
        {/* Brand Lockup: Stylized Dala Geometric Mark + Wordmark */}
        <div
          onClick={() => setActiveTab('manifesto')}
          style={{ display: 'flex', alignItems: 'center', gap: 14, cursor: 'pointer' }}
        >
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
            <defs>
              <linearGradient id="dala-poly-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#8052ff" />
                <stop offset="100%" stopColor="#15846e" />
              </linearGradient>
            </defs>
            <polygon points="12,2 22,20 2,20" fill="url(#dala-poly-grad)" />
          </svg>

          <span style={{
            fontSize: 18,
            fontWeight: 400,
            letterSpacing: '-0.4px',
            color: 'var(--color-bone-white)',
            textTransform: 'uppercase'
          }}>
            Dala
          </span>

          <span style={{
            fontSize: 11,
            color: 'var(--color-ash-gray)',
            letterSpacing: '0.04em',
            textTransform: 'uppercase',
            borderLeft: '1px solid rgba(255,255,255,0.15)',
            paddingLeft: 12
          }}>
            Veritas Edition
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
                className="btn-ghost"
                style={{
                  color: isActive ? 'var(--color-bone-white)' : 'var(--color-ash-gray)',
                  fontSize: 13,
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

        {/* Right Section: Telemetry Pulse + Request Access Violet Pill */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          
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
            <span>{serverStatus?.online ? 'Ready' : 'Connecting'}</span>
          </div>

          <button
            onClick={() => setActiveTab('studio')}
            className="btn-pill-primary"
            style={{
              padding: '10px 22px',
              fontSize: 13,
              borderRadius: 24
            }}
          >
            Request Access
          </button>

        </div>

      </div>
    </header>
  );
}
