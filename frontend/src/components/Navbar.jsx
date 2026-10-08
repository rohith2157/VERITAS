import React from 'react';
import { Sun, Moon } from 'lucide-react';

export default function Navbar({ activeTab, setActiveTab, serverStatus, theme = 'dark', toggleTheme }) {
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
      background: 'var(--bg-nav)',
      backdropFilter: 'blur(16px)',
      borderBottom: '1px solid var(--border-subtle)',
      padding: '16px 32px',
      transition: 'background-color 0.25s ease, border-color 0.25s ease'
    }}>
      <div style={{
        maxWidth: 'var(--page-max-width)',
        margin: '0 auto',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        
        {/* Brand Lockup: Stylized Veritas Geometric Mark + Wordmark */}
        <div
          onClick={() => setActiveTab('manifesto')}
          style={{ display: 'flex', alignItems: 'center', gap: 14, cursor: 'pointer' }}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') setActiveTab('manifesto'); }}
          aria-label="Veritas Home"
        >
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" aria-hidden="true">
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
            Veritas
          </span>

          <span style={{
            fontSize: 11,
            color: 'var(--color-ash-gray)',
            letterSpacing: '0.04em',
            textTransform: 'uppercase',
            borderLeft: '1px solid var(--border-subtle)',
            paddingLeft: 12
          }}>
            Triad Integrity
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

        {/* Right Section: Theme Toggle + Telemetry Pulse + Launch Studio Violet Pill */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          
          {/* Light/Dark Mode Switcher */}
          <button
            onClick={toggleTheme}
            className="btn-ghost"
            style={{
              padding: '8px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '1px solid var(--border-subtle)',
              background: 'var(--bg-card)'
            }}
            title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {theme === 'dark' ? (
              <Sun size={15} color="var(--color-saffron-spark)" />
            ) : (
              <Moon size={15} color="var(--color-electric-iris)" />
            )}
          </button>

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
            className="btn t-16 t-14@xs t-16@sm t-ls-0.025 t-600 t-uppercase"
            style={{
              padding: '10px 22px',
              fontSize: 13,
              borderRadius: 24
            }}
            aria-label="Launch Originality Studio"
          >
            <span className="btn__text pointer-events-none">Launch Studio</span>
            <div className="btn__hover pointer-events-none" aria-hidden="true" />
          </button>

        </div>

      </div>
    </header>
  );
}
