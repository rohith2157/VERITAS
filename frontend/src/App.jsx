import React, { useState, useEffect, Suspense, lazy } from 'react';
import { ArrowLeft, Sun, Moon, Search, Command, Zap } from 'lucide-react';
import { ToastProvider } from './context/ToastContext';
import CommandPalette from './components/CommandPalette';
import PortalWorkflowHub from './components/dashboard/PortalWorkflowHub';

const OperationsDashboard = lazy(() => import('./components/dashboard/OperationsDashboard'));
import UniversalStudio from './components/studio/UniversalStudio';
const ClassroomPortal = lazy(() => import('./components/classroom/ClassroomPortal'));
const DemoBench = lazy(() => import('./components/DemoBench'));
import DeveloperWorkstation from './components/dev/DeveloperWorkstation';

export default function App() {
  const [activeTab, setActiveTab] = useState(() => {
    if (typeof window !== 'undefined') {
      const hash = window.location.hash.replace('#', '');
      if (['hub', 'dashboard', 'studio', 'classroom', 'demobench', 'dev'].includes(hash)) {
        return hash;
      }
    }
    return 'manifesto';
  });
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('veritas_theme') || 'dark';
  });
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);

  const toggleTheme = () => {
    const next = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    localStorage.setItem('veritas_theme', next);
  };

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  // Global Ctrl+K / Cmd+K Command Palette listener
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsCommandPaletteOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Synchronize hash and clicks from real Veritas DOM
  useEffect(() => {
    const handleHash = () => {
      const hash = window.location.hash.replace('#', '');
      if (['hub', 'dashboard', 'studio', 'classroom', 'demobench', 'dev'].includes(hash)) {
        setActiveTab(hash);
      } else if (hash === 'portal') {
        setActiveTab('hub');
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
          setActiveTab('hub');
          window.location.hash = 'hub';
        } else if (tab === 'hub' || href === '#hub') {
          e.preventDefault();
          setActiveTab('hub');
          window.location.hash = 'hub';
        } else if (tab === 'dashboard' || href === '#dashboard') {
          e.preventDefault();
          setActiveTab('dashboard');
          window.location.hash = 'dashboard';
        } else if (tab === 'studio' || href === '#studio' || target.id === 'veritas-request-access') {
          e.preventDefault();
          setActiveTab('studio');
          window.location.hash = 'studio';
        } else if (tab === 'classroom' || href === '#classroom') {
          e.preventDefault();
          setActiveTab('classroom');
          window.location.hash = 'classroom';
        } else if (tab === 'demobench' || href === '#demobench') {
          e.preventDefault();
          setActiveTab('demobench');
          window.location.hash = 'demobench';
        } else if (tab === 'dev' || href === '#dev') {
          e.preventDefault();
          setActiveTab('dev');
          window.location.hash = 'dev';
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

          {/* View Switcher Tabs & Command Palette Trigger */}
          <div className="portal-nav-tabs">
            <button
              onClick={() => { setActiveTab('hub'); window.location.hash = 'hub'; }}
              className="portal-tab-btn"
              style={{
                color: activeTab === 'hub' ? 'var(--color-bone-white)' : 'var(--color-ash-gray)',
                borderBottom: activeTab === 'hub' ? '2px solid var(--color-electric-iris)' : '2px solid transparent',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6
              }}
            >
              <Zap size={14} color={activeTab === 'hub' ? 'var(--color-electric-iris)' : 'currentColor'} />
              <span>Investigation Hub</span>
            </button>

            <button
              onClick={() => { setActiveTab('dashboard'); window.location.hash = 'dashboard'; }}
              className="portal-tab-btn"
              style={{
                color: activeTab === 'dashboard' ? 'var(--color-bone-white)' : 'var(--color-ash-gray)',
                borderBottom: activeTab === 'dashboard' ? '2px solid var(--color-electric-iris)' : '2px solid transparent'
              }}
            >
              Dashboard
            </button>

            <button
              onClick={() => { setActiveTab('studio'); window.location.hash = 'studio'; }}
              className="portal-tab-btn"
              style={{
                color: activeTab === 'studio' ? 'var(--color-bone-white)' : 'var(--color-ash-gray)',
                borderBottom: activeTab === 'studio' ? '2px solid var(--color-electric-iris)' : '2px solid transparent'
              }}
            >
              Studio
            </button>

            <button
              onClick={() => { setActiveTab('classroom'); window.location.hash = 'classroom'; }}
              className="portal-tab-btn"
              style={{
                color: activeTab === 'classroom' ? 'var(--color-bone-white)' : 'var(--color-ash-gray)',
                borderBottom: activeTab === 'classroom' ? '2px solid var(--color-electric-iris)' : '2px solid transparent'
              }}
            >
              Classroom
            </button>

            <button
              onClick={() => { setActiveTab('demobench'); window.location.hash = 'demobench'; }}
              className="portal-tab-btn"
              style={{
                color: activeTab === 'demobench' ? 'var(--color-bone-white)' : 'var(--color-ash-gray)',
                borderBottom: activeTab === 'demobench' ? '2px solid var(--color-electric-iris)' : '2px solid transparent'
              }}
            >
              Demo Bench
            </button>

            <button
              onClick={() => { setActiveTab('dev'); window.location.hash = 'dev'; }}
              className="portal-tab-btn"
              style={{
                color: activeTab === 'dev' ? 'var(--color-bone-white)' : 'var(--color-ash-gray)',
                borderBottom: activeTab === 'dev' ? '2px solid var(--color-electric-iris)' : '2px solid transparent'
              }}
            >
              Developer
            </button>

            {/* Quick Command Palette Button */}
            <button
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
            {activeTab === 'hub' && (
              <PortalWorkflowHub
                onNavigateToStudio={() => { setActiveTab('studio'); window.location.hash = 'studio'; }}
                onNavigateToClassroom={() => { setActiveTab('classroom'); window.location.hash = 'classroom'; }}
                onNavigateToDev={() => { setActiveTab('dev'); window.location.hash = 'dev'; }}
              />
            )}
            {activeTab === 'dashboard' && (
              <OperationsDashboard 
                onOpenStudio={() => { setActiveTab('studio'); window.location.hash = 'studio'; }}
                onOpenClassroom={() => { setActiveTab('classroom'); window.location.hash = 'classroom'; }}
                onOpenDemoBench={() => { setActiveTab('demobench'); window.location.hash = 'demobench'; }}
                onOpenDev={() => { setActiveTab('dev'); window.location.hash = 'dev'; }}
              />
            )}
            {activeTab === 'studio' && <UniversalStudio />}
            {activeTab === 'classroom' && <ClassroomPortal />}
            {activeTab === 'demobench' && <DemoBench />}
            {activeTab === 'dev' && <DeveloperWorkstation />}
          </Suspense>
        </main>

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
