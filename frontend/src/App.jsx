import React, { useState, useEffect, Suspense, lazy } from 'react';
import { 
  ArrowLeft, 
  Sun, 
  Moon, 
  Search, 
  GitCompare, 
  Users, 
  Lock, 
  Terminal, 
  LogIn, 
  LogOut, 
  ChevronDown, 
  UserCheck 
} from 'lucide-react';
import { ToastProvider } from './context/ToastContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import CommandPalette from './components/CommandPalette';
import AuthModal from './components/auth/AuthModal';

const UniversalStudio = lazy(() => import('./components/studio/UniversalStudio'));
const ClassroomPortal = lazy(() => import('./components/classroom/ClassroomPortal'));
const CryptographicLedger = lazy(() => import('./components/ledger/CryptographicLedger'));
const DeveloperWorkstation = lazy(() => import('./components/dev/DeveloperWorkstation'));

function VeritasPortalShell() {
  const { user, isAuthenticated, openAuthModal, logout } = useAuth();
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
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
    document.documentElement.setAttribute('data-theme', next);
    window.dispatchEvent(new CustomEvent('veritas-theme-change', { detail: { theme: next } }));
  };

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  // Synchronize theme with external window events and storage
  useEffect(() => {
    const handleExternalTheme = (e) => {
      if (e.detail && e.detail.theme && e.detail.theme !== theme) {
        setTheme(e.detail.theme);
      }
    };
    const handleStorage = (e) => {
      if (e.key === 'veritas_theme' && e.newValue && e.newValue !== theme) {
        setTheme(e.newValue);
      }
    };
    window.addEventListener('veritas-theme-change', handleExternalTheme);
    window.addEventListener('storage', handleStorage);
    return () => {
      window.removeEventListener('veritas-theme-change', handleExternalTheme);
      window.removeEventListener('storage', handleStorage);
    };
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

  // Close user profile dropdown on outside click
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (!e.target.closest('#btn-portal-user-profile') && !e.target.closest('.portal-user-dropdown')) {
        setIsUserMenuOpen(false);
      }
    };
    document.addEventListener('click', handleOutsideClick);
    return () => document.removeEventListener('click', handleOutsideClick);
  }, []);

  // Listen for open auth requests from Landing Page or other triggers
  useEffect(() => {
    const handleOpenAuth = (e) => {
      openAuthModal(e.detail?.mode || 'login');
    };
    window.addEventListener('veritas-open-auth', handleOpenAuth);
    return () => window.removeEventListener('veritas-open-auth', handleOpenAuth);
  }, [openAuthModal]);

  // When on manifesto, the real Veritas engine and DOM run unobstructed
  if (activeTab === 'manifesto') {
    return (
      <>
        <AuthModal />
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
      </>
    );
  }

  // When user opens the Veritas Portal Shell
  return (
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
            z-index: 1000;
            background: var(--bg-nav, rgba(0,0,0,0.85));
            backdrop-filter: blur(20px);
            -webkit-backdrop-filter: blur(20px);
            border-bottom: 1px solid var(--border-subtle);
            padding: 10px 32px;
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 16px;
            transition: background-color 0.25s ease, border-color 0.25s ease;
          }
          .portal-header-brand {
            display: flex;
            align-items: center;
            gap: 14px;
            flex-shrink: 0;
          }
          .portal-back-btn {
            display: inline-flex;
            align-items: center;
            gap: 8px;
            padding: 7px 14px;
            border-radius: 9999px;
            border: 1px solid var(--border-subtle);
            background: rgba(255, 255, 255, 0.04);
            color: var(--color-bone-white);
            font-size: 12px;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.03em;
            cursor: pointer;
            transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
          }
          .portal-back-btn:hover {
            border-color: var(--color-electric-iris);
            color: var(--color-bone-white);
            transform: translateX(-2px);
          }
          [data-theme="light"] .portal-back-btn {
            background: rgba(0, 0, 0, 0.04);
            border-color: rgba(0, 0, 0, 0.1);
          }
          .portal-brand-block {
            display: flex;
            align-items: center;
            gap: 10px;
          }
          .portal-brand-title {
            font-family: var(--font-ppneuemontreal, sans-serif);
            font-size: 16px;
            font-weight: 700;
            letter-spacing: -0.02em;
            color: var(--color-bone-white);
          }
          .portal-brand-tag {
            font-size: 10px;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 0.06em;
            padding: 2px 7px;
            border-radius: 6px;
            background: rgba(128, 82, 255, 0.15);
            color: var(--color-electric-iris);
            border: 1px solid rgba(128, 82, 255, 0.3);
          }
          .veritas-cluster-pill {
            display: inline-flex;
            align-items: center;
            gap: 6px;
            padding: 4px 10px;
            border-radius: 9999px;
            background: rgba(21, 132, 110, 0.12);
            border: 1px solid rgba(21, 132, 110, 0.3);
            font-size: 11px;
            font-weight: 600;
            letter-spacing: 0.04em;
            color: var(--color-deep-verdant);
            text-transform: uppercase;
          }
          .veritas-cluster-dot {
            width: 6px;
            height: 6px;
            border-radius: 50%;
            background-color: var(--color-deep-verdant);
            box-shadow: 0 0 8px var(--color-deep-verdant);
            animation: veritas-nav-pulse 2s infinite;
          }
          @keyframes veritas-nav-pulse {
            0%, 100% { opacity: 1; transform: scale(1); }
            50% { opacity: 0.45; transform: scale(0.8); }
          }
          .portal-nav-segmented {
            display: flex;
            align-items: center;
            gap: 4px;
            background: var(--bg-card);
            border: 1px solid var(--border-subtle);
            padding: 4px;
            border-radius: 9999px;
            box-shadow: 0 4px 16px rgba(0,0,0,0.06);
          }
          .portal-tab-pill {
            display: inline-flex;
            align-items: center;
            gap: 7px;
            padding: 7px 16px;
            border-radius: 9999px;
            font-family: var(--font-ppneuemontreal, sans-serif);
            font-size: 13px;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.025em;
            border: none;
            cursor: pointer;
            background: transparent;
            color: var(--color-ash-gray);
            transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
            white-space: nowrap;
          }
          .portal-tab-pill:hover {
            color: var(--color-bone-white);
            background: rgba(128, 82, 255, 0.08);
          }
          .portal-tab-pill.active {
            background: var(--color-electric-iris) !important;
            color: #ffffff !important;
            box-shadow: 0 2px 12px rgba(128, 82, 255, 0.35);
          }
          .portal-header-actions {
            display: flex;
            align-items: center;
            gap: 10px;
            flex-shrink: 0;
          }
          .portal-action-btn {
            display: inline-flex;
            align-items: center;
            gap: 6px;
            padding: 7px 12px;
            border-radius: 9999px;
            border: 1px solid var(--border-subtle);
            background: rgba(255, 255, 255, 0.04);
            color: var(--color-silver-mist);
            font-size: 12px;
            cursor: pointer;
            transition: all 0.2s ease;
          }
          .portal-action-btn:hover {
            border-color: var(--color-electric-iris);
            color: var(--color-bone-white);
          }
          [data-theme="light"] .portal-action-btn {
            background: rgba(0, 0, 0, 0.04);
            border-color: rgba(0, 0, 0, 0.1);
          }
          .portal-theme-btn {
            width: 36px;
            height: 36px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            background: var(--bg-card);
            border: 1px solid var(--border-subtle);
            color: var(--color-ash-gray);
            transition: all 0.22s cubic-bezier(0.16, 1, 0.3, 1);
            flex-shrink: 0;
          }
          .portal-theme-btn:hover {
            transform: rotate(18deg) scale(1.08);
            border-color: var(--color-electric-iris);
          }
          [data-theme="light"] .portal-theme-btn {
            border-color: rgba(0, 0, 0, 0.12);
          }
          .portal-auth-btn {
            display: inline-flex;
            align-items: center;
            gap: 6px;
            padding: 7px 14px;
            border-radius: 9999px;
            background: var(--color-electric-iris);
            color: #ffffff;
            border: 1px solid var(--color-electric-iris);
            font-size: 12px;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.03em;
            cursor: pointer;
            box-shadow: 0 2px 10px rgba(128, 82, 255, 0.35);
            transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
          }
          .portal-auth-btn:hover {
            transform: translateY(-1px);
            box-shadow: 0 4px 14px rgba(128, 82, 255, 0.5);
          }
          .portal-user-pill {
            display: inline-flex;
            align-items: center;
            gap: 8px;
            padding: 4px 12px 4px 5px;
            border-radius: 9999px;
            background: var(--bg-card);
            border: 1px solid var(--border-subtle);
            cursor: pointer;
            transition: all 0.2s ease;
          }
          .portal-user-pill:hover {
            border-color: var(--color-electric-iris);
          }
          .portal-user-avatar {
            width: 24px;
            height: 24px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 10px;
            font-weight: 700;
            color: #ffffff;
          }
          .portal-user-dropdown {
            position: absolute;
            top: calc(100% + 8px);
            right: 0;
            min-width: 230px;
            background: var(--bg-card);
            border: 1px solid var(--border-subtle);
            border-radius: 14px;
            padding: 12px;
            box-shadow: 0 16px 40px rgba(0, 0, 0, 0.6);
            z-index: 1001;
            display: flex;
            flex-direction: column;
            gap: 8px;
            animation: fadeIn 120ms ease;
          }
          @media (max-width: 1100px) {
            .veritas-cluster-pill {
              display: none !important;
            }
          }
          @media (max-width: 900px) {
            .portal-header {
              padding: 10px 16px;
              flex-wrap: wrap;
            }
            .portal-nav-segmented {
              order: 3;
              width: 100%;
              justify-content: center;
              margin-top: 6px;
              overflow-x: auto;
            }
          }
          @media (max-width: 480px) {
            .portal-tab-pill {
              padding: 6px 10px;
              font-size: 11px;
            }
            .portal-brand-title {
              font-size: 14px;
            }
          }
        `}</style>

        {/* Top Elevated Portal Navigation Bar */}
        <header className="portal-header">
          <div className="portal-header-brand">
            <button
              id="veritas-back-to-manifesto"
              onClick={() => {
                setActiveTab('manifesto');
                window.location.hash = 'manifesto';
              }}
              className="portal-back-btn"
              title="Return to Veritas Manifesto"
            >
              <ArrowLeft size={14} />
              <span>Manifesto</span>
            </button>

            <div style={{ width: 1, height: 22, background: 'var(--border-subtle)' }} />

            <div className="portal-brand-block">
              <span className="portal-brand-title">VERITAS</span>
              <span className="portal-brand-tag">INTEGRITY PLATFORM</span>
            </div>

            <div className="veritas-cluster-pill" title="Spring Boot :8080 | FastAPI :8000 operational">
              <span className="veritas-cluster-dot"></span>
              <span>Cluster Live</span>
            </div>
          </div>

          {/* 3-Pillar Segmented Navigation Capsule */}
          <nav className="portal-nav-segmented" role="tablist">
            <button
              id="tab-btn-studio"
              role="tab"
              aria-selected={activeTab === 'studio'}
              onClick={() => { setActiveTab('studio'); window.location.hash = 'studio'; }}
              className={`portal-tab-pill ${activeTab === 'studio' ? 'active' : ''}`}
            >
              <GitCompare size={14} />
              <span>Studio Inspector</span>
            </button>

            <button
              id="tab-btn-queue"
              role="tab"
              aria-selected={activeTab === 'queue'}
              onClick={() => { setActiveTab('queue'); window.location.hash = 'queue'; }}
              className={`portal-tab-pill ${activeTab === 'queue' ? 'active' : ''}`}
            >
              <Users size={14} />
              <span>Evaluation Queue</span>
            </button>

            <button
              id="tab-btn-ledger"
              role="tab"
              aria-selected={activeTab === 'ledger'}
              onClick={() => { setActiveTab('ledger'); window.location.hash = 'ledger'; }}
              className={`portal-tab-pill ${activeTab === 'ledger' ? 'active' : ''}`}
            >
              <Lock size={14} />
              <span>Cryptographic Ledger</span>
            </button>
          </nav>

          {/* Action Tools & Theme Controls */}
          <div className="portal-header-actions">
            {/* User Account / Auth Trigger */}
            {!isAuthenticated || !user ? (
              <button
                id="btn-portal-signin"
                onClick={() => openAuthModal('login')}
                className="portal-auth-btn"
                title="Sign In or Create Account"
              >
                <LogIn size={13} />
                <span>Sign In</span>
              </button>
            ) : (
              <div style={{ position: 'relative' }}>
                <button
                  id="btn-portal-user-profile"
                  onClick={() => setIsUserMenuOpen((prev) => !prev)}
                  className="portal-user-pill"
                  title={`${user.name} (${user.roleLabel})`}
                >
                  <div 
                    className="portal-user-avatar"
                    style={{
                      background: user.role === 'STUDENT' ? 'var(--color-saffron-spark)' : (user.role === 'AUDITOR' ? 'var(--color-deep-verdant)' : 'var(--color-electric-iris)')
                    }}
                  >
                    {user.initials || 'U'}
                  </div>
                  <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-bone-white)', maxWidth: 110, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {user.name.split(' ')[0]}
                  </span>
                  <ChevronDown size={12} color="var(--color-ash-gray)" />
                </button>

                {isUserMenuOpen && (
                  <div
                    className="portal-user-dropdown"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div style={{ borderBottom: '1px solid var(--border-subtle)', paddingBottom: 8 }}>
                      <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--color-bone-white)' }}>
                        {user.name}
                      </div>
                      <div style={{ fontSize: 11, color: 'var(--color-ash-gray)', marginTop: 2 }}>
                        {user.email}
                      </div>
                      <div style={{ marginTop: 6, display: 'inline-flex', alignItems: 'center', gap: 4, padding: '2px 7px', borderRadius: 4, background: 'rgba(128, 82, 255, 0.15)', color: 'var(--color-electric-iris)', fontSize: 10, fontWeight: 700, textTransform: 'uppercase' }}>
                        <UserCheck size={10} />
                        <span>{user.roleLabel}</span>
                      </div>
                    </div>

                    <div style={{ fontSize: 11, color: 'var(--color-silver-mist)', padding: '2px 0' }}>
                      {user.institution}
                    </div>

                    <button
                      onClick={() => {
                        setIsUserMenuOpen(false);
                        openAuthModal('login');
                      }}
                      style={{
                        background: 'rgba(255, 255, 255, 0.04)',
                        border: '1px solid var(--border-subtle)',
                        borderRadius: 8,
                        padding: '7px 10px',
                        color: 'var(--color-bone-white)',
                        fontSize: 12,
                        fontWeight: 500,
                        cursor: 'pointer',
                        textAlign: 'left',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 6
                      }}
                    >
                      <LogIn size={12} />
                      <span>Switch Account</span>
                    </button>

                    <button
                      onClick={() => {
                        setIsUserMenuOpen(false);
                        logout();
                      }}
                      style={{
                        background: 'rgba(239, 68, 68, 0.08)',
                        border: '1px solid rgba(239, 68, 68, 0.25)',
                        borderRadius: 8,
                        padding: '7px 10px',
                        color: '#f87171',
                        fontSize: 12,
                        fontWeight: 600,
                        cursor: 'pointer',
                        textAlign: 'left',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 6
                      }}
                    >
                      <LogOut size={12} />
                      <span>Sign Out</span>
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Developer Tools Modal Pill */}
            <button
              id="btn-dev-workstation-pill"
              onClick={() => setIsDevModalOpen(true)}
              className="portal-action-btn"
              style={{
                color: 'var(--color-electric-iris)',
                borderColor: 'rgba(128, 82, 255, 0.3)',
                background: 'rgba(128, 82, 255, 0.1)'
              }}
              title="Open Developer Telemetry & API Playground (Ctrl+Shift+D)"
            >
              <Terminal size={13} />
              <span style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase' }}>Dev Tools</span>
            </button>

            {/* Command Palette Trigger Pill */}
            <button
              id="btn-command-palette-pill"
              onClick={() => setIsCommandPaletteOpen(true)}
              className="portal-action-btn"
              title="Open Universal Command Palette (Ctrl+K)"
            >
              <Search size={13} />
              <span style={{ fontSize: 11, fontFamily: 'monospace', opacity: 0.85 }}>Ctrl+K</span>
            </button>

            {/* Interactive Theme Toggle Button */}
            <button
              id="btn-portal-theme-toggle"
              onClick={toggleTheme}
              className="portal-theme-btn"
              title={theme === 'dark' ? 'Switch to daylight theme' : 'Switch to void dark theme'}
              aria-label="Toggle Theme"
            >
              {theme === 'dark' ? (
                <Sun size={17} color="var(--color-saffron-spark)" />
              ) : (
                <Moon size={17} color="var(--color-electric-iris)" />
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

        {/* Authentication Modal Dialog */}
        <AuthModal />

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
  );
}

export default function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <VeritasPortalShell />
      </ToastProvider>
    </AuthProvider>
  );
}
