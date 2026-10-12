import React, { useState, useEffect, Suspense, lazy } from 'react';
import { ArrowLeft, Sun, Moon, Search, GitCompare, Users, Lock, Terminal } from 'lucide-react';
import { ToastProvider } from './context/ToastContext';
import CommandPalette from './components/CommandPalette';

const UniversalStudio = lazy(() => import('./components/studio/UniversalStudio'));
const ClassroomPortal = lazy(() => import('./components/classroom/ClassroomPortal'));
const CryptographicLedger = lazy(() => import('./components/ledger/CryptographicLedger'));
const DeveloperWorkstation = lazy(() => import('./components/dev/DeveloperWorkstation'));

export default function App() {
  const [activeTab, setActiveTab] = useState(() => {
    if (typeof window !== 'undefined') {
      const hash = window.location.hash.replace('#', '');
      if (['studio', 'queue', 'ledger'].includes(hash)) {
        return hash;
      }
      if (['hub', 'demobench'].includes(hash)) return 'studio';
      if (['dashboard', 'classroom'].includes(hash)) return 'queue';
    }
    return 'manifesto';
  });
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('veritas_theme') || 'dark';
  });
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [isDevModalOpen, setIsDevModalOpen] = useState(false);
  const [activeSubmission, setActiveSubmission] = useState(null);

  const toggleTheme = () => {
    const next = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    localStorage.setItem('veritas_theme', next);
  };

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  // Global Keyboard Shortcuts (Ctrl+K for Search, Ctrl+Shift+D for Dev Tools, Escape to dismiss)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsCommandPaletteOpen((prev) => !prev);
      } else if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === 'd') {
        e.preventDefault();
        setIsDevModalOpen((prev) => !prev);
      } else if (e.key === 'Escape') {
        if (isDevModalOpen) setIsDevModalOpen(false);
        if (isCommandPaletteOpen) setIsCommandPaletteOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isDevModalOpen, isCommandPaletteOpen]);

  // Synchronize hash and clicks from real Veritas DOM
  useEffect(() => {
    const handleHash = () => {
      const hash = window.location.hash.replace('#', '');
      if (['studio', 'queue', 'ledger'].includes(hash)) {
        setActiveTab(hash);
      } else if (['portal', 'hub', 'demobench'].includes(hash)) {
        setActiveTab('studio');
      } else if (['dashboard', 'classroom'].includes(hash)) {
        setActiveTab('queue');
      } else if (hash === 'dev') {
        setActiveTab('studio');
        setIsDevModalOpen(true);
      } else if (hash === 'landing' || hash === 'manifesto' || hash === '') {
        setActiveTab('manifesto');
      }
    };

    window.addEventListener('hashchange', handleHash);
    handleHash();

    // Intercept clicks on links or buttons targeting portal views
    const handleGlobalClicks = (e) => {
      const target = e.target.closest('[data-tab], [href^="#"], [aria-label="Launch Portal"], [aria-label="Request access"]');
      if (target) {
        const tab = target.getAttribute('data-tab');
        const href = target.getAttribute('href');
        const ariaLabel = target.getAttribute('aria-label');

        if (ariaLabel === 'Launch Portal' || ariaLabel === 'Request access' || href === '#portal' || tab === 'portal') {
          e.preventDefault();
          setActiveTab('studio');
          window.location.hash = 'studio';
        } else if (tab === 'studio' || href === '#studio' || target.id === 'veritas-request-access' || tab === 'hub' || href === '#hub' || tab === 'demobench' || href === '#demobench') {
          e.preventDefault();
          setActiveTab('studio');
          window.location.hash = 'studio';
        } else if (tab === 'queue' || href === '#queue' || tab === 'classroom' || href === '#classroom' || tab === 'dashboard' || href === '#dashboard') {
          e.preventDefault();
          setActiveTab('queue');
          window.location.hash = 'queue';
        } else if (tab === 'ledger' || href === '#ledger') {
          e.preventDefault();
          setActiveTab('ledger');
          window.location.hash = 'ledger';
        } else if (tab === 'dev' || href === '#dev') {
          e.preventDefault();
          setIsDevModalOpen(true);
        } else if (href === '#landing' || href === '#manifesto') {
          setActiveTab('manifesto');
        }
      }
    };

    const handleGlobalKeyDown = (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        const target = e.target.closest('[data-tab], [href^="#"]');
        if (target) {
          handleGlobalClicks(e);
        }
      }
    };

    document.addEventListener('click', handleGlobalClicks);
    document.addEventListener('keydown', handleGlobalKeyDown);

    return () => {
      window.removeEventListener('hashchange', handleHash);
      document.removeEventListener('click', handleGlobalClicks);
      document.removeEventListener('keydown', handleGlobalKeyDown);
    };
  }, []);

  // When on manifesto, the real Veritas engine and DOM run unobstructed
  if (activeTab === 'manifesto') {
    return (
      <ToastProvider>
        <CommandPalette
          isOpen={isCommandPaletteOpen}
          onClose={() => setIsCommandPaletteOpen(false)}
          onNavigate={(view) => {
            setActiveTab(view);
            window.location.hash = view;
            setIsCommandPaletteOpen(false);
          }}
          onToggleTheme={toggleTheme}
          isDark={theme === 'dark'}
        />
      </ToastProvider>
    );
  }

  // When user opens the Veritas Portal Shell
  return (
    <ToastProvider>
      <div
        id="veritas-portal-shell"
        className="veritas-portal-shell"
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 99999,
          background: 'var(--bg-main, #000000)',
          color: 'var(--color-bone-white, #ffffff)',
          fontFamily: "var(--font-ppneuemontreal, 'PPNeueMontreal', -apple-system, BlinkMacSystemFont, sans-serif)",
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        <style>{`
          .portal-header {
            position: sticky;
            top: 0;
            z-index: 100;
            background: var(--bg-nav, rgba(0,0,0,0.85));
            backdrop-filter: blur(16px);
            -webkit-backdrop-filter: blur(16px);
            border-bottom: 1px solid var(--border-subtle, rgba(255,255,255,0.08));
            padding: 12px 32px;
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 16px;
          }
          .portal-header-brand {
            display: flex;
            align-items: center;
            gap: 16px;
            flex-shrink: 0;
          }
          .portal-nav-tabs {
            display: flex;
            align-items: center;
            gap: 20px;
            overflow-x: auto;
            scrollbar-width: none;
            -webkit-overflow-scrolling: touch;
          }
          .portal-nav-tabs::-webkit-scrollbar {
            display: none;
          }
          .portal-tab-btn {
            font-family: var(--font-ppneuemontreal, 'PPNeueMontreal', -apple-system, sans-serif);
            font-size: 13px;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.35px;
            padding: 8px 0;
            background: none;
            border: none;
            outline: none;
            cursor: pointer;
            white-space: nowrap;
            transition: color 0.2s ease, border-color 0.2s ease;
          }
          @media (max-width: 960px) {
            .portal-header {
              padding: 12px 20px;
              flex-direction: column;
              align-items: stretch;
              gap: 12px;
            }
            .portal-header-brand {
              justify-content: space-between;
              width: 100%;
            }
            .portal-nav-tabs {
              gap: 16px;
              width: 100%;
              padding-bottom: 2px;
            }
          }
          @media (max-width: 480px) {
            .portal-header {
              padding: 10px 14px;
            }
            .portal-brand-title {
              font-size: 13px !important;
            }
            .portal-tab-btn {
              font-size: 12px;
              letter-spacing: 0.2px;
            }
            .portal-main-container {
              padding: 16px !important;
            }
          }
        `}</style>

        {/* Top Portal Navigation Bar */}
        <header className="portal-header">
          <div className="portal-header-brand">
            <button
              id="veritas-back-to-manifesto"
              onClick={() => {
                setActiveTab('manifesto');
                window.location.hash = 'manifesto';
              }}
              className="btn-ghost"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                fontSize: 13,
                fontWeight: 600,
                textTransform: 'uppercase',
                letterSpacing: '0.025em',
                color: 'var(--color-bone-white)',
                cursor: 'pointer',
                background: 'none',
                border: 'none',
                padding: '6px 12px',
                borderRadius: 20
              }}
            >
              <ArrowLeft size={16} />
              <span>Back to Manifesto</span>
            </button>

            <div style={{ width: 1, height: 20, background: 'var(--border-subtle)' }} />

            <span className="portal-brand-title" style={{ fontSize: 15, fontWeight: 500, letterSpacing: '-0.3px', color: 'var(--color-bone-white)' }}>
              VERITAS INTEGRITY PLATFORM
            </span>
          </div>

          {/* 3-Pillar View Switcher Tabs & Command Palette Trigger */}
          <div className="portal-nav-tabs">
            <button
              id="tab-btn-studio"
              onClick={() => { setActiveTab('studio'); window.location.hash = 'studio'; }}
              className="portal-tab-btn"
              style={{
                color: activeTab === 'studio' ? 'var(--color-bone-white)' : 'var(--color-ash-gray)',
                borderBottom: activeTab === 'studio' ? '2px solid var(--color-electric-iris)' : '2px solid transparent',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6
              }}
            >
              <GitCompare size={14} color={activeTab === 'studio' ? 'var(--color-electric-iris)' : 'currentColor'} />
              <span>Studio Inspector</span>
            </button>

            <button
              id="tab-btn-queue"
              onClick={() => { setActiveTab('queue'); window.location.hash = 'queue'; }}
              className="portal-tab-btn"
              style={{
                color: activeTab === 'queue' ? 'var(--color-bone-white)' : 'var(--color-ash-gray)',
                borderBottom: activeTab === 'queue' ? '2px solid var(--color-electric-iris)' : '2px solid transparent',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6
              }}
            >
              <Users size={14} color={activeTab === 'queue' ? 'var(--color-electric-iris)' : 'currentColor'} />
              <span>Evaluation Queue</span>
            </button>

            <button
              id="tab-btn-ledger"
              onClick={() => { setActiveTab('ledger'); window.location.hash = 'ledger'; }}
              className="portal-tab-btn"
              style={{
                color: activeTab === 'ledger' ? 'var(--color-bone-white)' : 'var(--color-ash-gray)',
                borderBottom: activeTab === 'ledger' ? '2px solid var(--color-electric-iris)' : '2px solid transparent',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6
              }}
            >
              <Lock size={14} color={activeTab === 'ledger' ? 'var(--color-electric-iris)' : 'currentColor'} />
              <span>Cryptographic Ledger</span>
            </button>

            {/* Quick Developer Tools Modal Trigger */}
            <button
              id="btn-dev-workstation-pill"
              onClick={() => setIsDevModalOpen(true)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                padding: '6px 12px',
                borderRadius: 16,
                background: 'rgba(128, 82, 255, 0.1)',
                border: '1px solid rgba(128, 82, 255, 0.3)',
                color: 'var(--color-electric-iris)',
                fontSize: 11,
                fontWeight: 600,
                textTransform: 'uppercase',
                cursor: 'pointer',
                marginLeft: 8
              }}
              title="Open Developer Telemetry & API Playground (Ctrl+Shift+D)"
            >
              <Terminal size={12} />
              <span>Dev Tools</span>
            </button>

            {/* Quick Command Palette Button */}
            <button
              id="btn-command-palette-pill"
              onClick={() => setIsCommandPaletteOpen(true)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                padding: '6px 12px',
                borderRadius: 16,
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid var(--border-subtle)',
                color: 'var(--color-silver-mist)',
                fontSize: 12,
                cursor: 'pointer',
                marginLeft: 4
              }}
              title="Open Command Palette (Ctrl+K)"
            >
              <Search size={13} />
              <span style={{ fontSize: 11, fontFamily: 'monospace', opacity: 0.8 }}>Ctrl+K</span>
            </button>

            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="btn-ghost"
              style={{
                padding: '6px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                background: 'none',
                border: 'none',
                color: 'var(--color-ash-gray)',
                flexShrink: 0
              }}
              title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
              aria-label="Toggle Theme"
            >
              {theme === 'dark' ? (
                <Sun size={16} color="var(--color-saffron-spark)" />
              ) : (
                <Moon size={16} color="var(--color-electric-iris)" />
              )}
            </button>
          </div>
        </header>

        {/* Main Portal View */}
        <main className="portal-main-container" style={{ flex: 1, padding: '32px', maxWidth: 'var(--page-max-width, 1440px)', margin: '0 auto', width: '100%', boxSizing: 'border-box' }}>
          <Suspense fallback={
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh', color: 'var(--color-ash-gray)', fontSize: 13, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              <span style={{ display: 'inline-block', width: 8, height: 8, borderRadius: '50%', background: 'var(--color-electric-iris)', marginRight: 10, animation: 'pulse 1.2s infinite' }} />
              Loading Veritas Node...
            </div>
          }>
            {activeTab === 'studio' && <UniversalStudio activeSubmission={activeSubmission} />}
            {activeTab === 'queue' && (
              <ClassroomPortal
                onInspectDiff={(sub) => {
                  setActiveSubmission(sub);
                  setActiveTab('studio');
                  window.location.hash = 'studio';
                }}
              />
            )}
            {activeTab === 'ledger' && <CryptographicLedger />}
          </Suspense>
        </main>

        {/* Developer Workstation Modal Dialog */}
        {isDevModalOpen && (
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Developer Telemetry Workstation"
            onClick={() => setIsDevModalOpen(false)}
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 100000,
              background: 'rgba(0, 0, 0, 0.85)',
              backdropFilter: 'blur(16px)',
              WebkitBackdropFilter: 'blur(16px)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '24px'
            }}
          >
            <div
              onClick={(e) => e.stopPropagation()}
              style={{
                width: '100%',
                maxWidth: 1320,
                maxHeight: '90vh',
                overflowY: 'auto',
                background: 'var(--bg-main, #000000)',
                border: '1px solid rgba(128, 82, 255, 0.3)',
                borderRadius: 24,
                padding: '32px',
                boxShadow: '0 32px 80px rgba(0, 0, 0, 0.9)'
              }}
            >
              <Suspense fallback={
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '40vh', color: 'var(--color-ash-gray)' }}>
                  Loading Developer Node...
                </div>
              }>
                <DeveloperWorkstation onClose={() => setIsDevModalOpen(false)} />
              </Suspense>
            </div>
          </div>
        )}

        {/* Global Command Palette */}
        <CommandPalette
          isOpen={isCommandPaletteOpen}
          onClose={() => setIsCommandPaletteOpen(false)}
          onNavigate={(view) => {
            setActiveTab(view);
            window.location.hash = view;
            setIsCommandPaletteOpen(false);
          }}
          onToggleTheme={toggleTheme}
          isDark={theme === 'dark'}
        />
      </div>
    </ToastProvider>
  );
}
