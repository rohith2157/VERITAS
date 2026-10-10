import React, { useState, useEffect, Suspense, lazy } from 'react';
import { ArrowLeft, Sun, Moon } from 'lucide-react';

const OperationsDashboard = lazy(() => import('./components/dashboard/OperationsDashboard'));
const UniversalStudio = lazy(() => import('./components/studio/UniversalStudio'));
const ClassroomPortal = lazy(() => import('./components/classroom/ClassroomPortal'));
const DemoBench = lazy(() => import('./components/DemoBench'));
const DeveloperWorkstation = lazy(() => import('./components/dev/DeveloperWorkstation'));

export default function App() {
  const [activeTab, setActiveTab] = useState('manifesto'); // 'manifesto', 'dashboard', 'studio', 'classroom', 'demobench', 'dev'
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('veritas_theme') || 'dark';
  });

  const toggleTheme = () => {
    const next = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    localStorage.setItem('veritas_theme', next);
  };

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  // Synchronize hash and clicks from real Veritas DOM
  useEffect(() => {
    const handleHash = () => {
      const hash = window.location.hash.replace('#', '');
      if (['dashboard', 'studio', 'classroom', 'demobench', 'dev'].includes(hash)) {
        setActiveTab(hash);
      } else if (hash === 'landing' || hash === 'manifesto' || hash === '') {
        setActiveTab('manifesto');
      }
    };

    window.addEventListener('hashchange', handleHash);
    handleHash();

    // Intercept clicks on links or buttons with data-tab or href targeting portal views
    const handleGlobalClicks = (e) => {
      const target = e.target.closest('[data-tab], [href^="#"]');
      if (target) {
        const tab = target.getAttribute('data-tab');
        const href = target.getAttribute('href');

        if (tab === 'dashboard' || href === '#dashboard') {
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

    document.addEventListener('click', handleGlobalClicks);

    return () => {
      window.removeEventListener('hashchange', handleHash);
      document.removeEventListener('click', handleGlobalClicks);
    };
  }, []);

  // When on manifesto, the real Veritas engine and DOM run unobstructed
  if (activeTab === 'manifesto') {
    return null;
  }

  // When user opens Dashboard, Studio, Classroom, DemoBench, or Developer Workstation
  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 99999,
        background: 'var(--bg-main, #000000)',
        color: 'var(--color-bone-white, #ffffff)',
        overflowY: 'auto',
        display: 'flex',
        flexDirection: 'column'
      }}
    >
      {/* Top Portal Navigation Bar */}
      <header
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 100,
          background: 'var(--bg-nav, rgba(0,0,0,0.85))',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          borderBottom: '1px solid var(--border-subtle, rgba(255,255,255,0.08))',
          padding: '14px 32px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 16
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
          <button
            id="veritas-back-to-manifesto"
            onClick={() => {
              setActiveTab('manifesto');
              window.location.hash = 'landing';
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

          <span style={{ fontSize: 16, fontWeight: 400, letterSpacing: '-0.3px', color: 'var(--color-bone-white)' }}>
            VERITAS INTEGRITY PORTAL
          </span>
        </div>

        {/* View Switcher Tabs */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 20, flexWrap: 'wrap' }}>
          <button
            onClick={() => { setActiveTab('dashboard'); window.location.hash = 'dashboard'; }}
            className="btn-ghost"
            style={{
              fontSize: 13,
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: '0.35px',
              color: activeTab === 'dashboard' ? 'var(--color-bone-white)' : 'var(--color-ash-gray)',
              borderBottom: activeTab === 'dashboard' ? '2px solid var(--color-electric-iris)' : '2px solid transparent',
              padding: '4px 0',
              background: 'none',
              cursor: 'pointer'
            }}
          >
            Dashboard
          </button>

          <button
            onClick={() => { setActiveTab('studio'); window.location.hash = 'studio'; }}
            className="btn-ghost"
            style={{
              fontSize: 13,
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: '0.35px',
              color: activeTab === 'studio' ? 'var(--color-bone-white)' : 'var(--color-ash-gray)',
              borderBottom: activeTab === 'studio' ? '2px solid var(--color-electric-iris)' : '2px solid transparent',
              padding: '4px 0',
              background: 'none',
              cursor: 'pointer'
            }}
          >
            Studio
          </button>

          <button
            onClick={() => { setActiveTab('classroom'); window.location.hash = 'classroom'; }}
            className="btn-ghost"
            style={{
              fontSize: 13,
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: '0.35px',
              color: activeTab === 'classroom' ? 'var(--color-bone-white)' : 'var(--color-ash-gray)',
              borderBottom: activeTab === 'classroom' ? '2px solid var(--color-electric-iris)' : '2px solid transparent',
              padding: '4px 0',
              background: 'none',
              cursor: 'pointer'
            }}
          >
            Classroom
          </button>

          <button
            onClick={() => { setActiveTab('demobench'); window.location.hash = 'demobench'; }}
            className="btn-ghost"
            style={{
              fontSize: 13,
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: '0.35px',
              color: activeTab === 'demobench' ? 'var(--color-bone-white)' : 'var(--color-ash-gray)',
              borderBottom: activeTab === 'demobench' ? '2px solid var(--color-electric-iris)' : '2px solid transparent',
              padding: '4px 0',
              background: 'none',
              cursor: 'pointer'
            }}
          >
            Demo Bench
          </button>

          <button
            onClick={() => { setActiveTab('dev'); window.location.hash = 'dev'; }}
            className="btn-ghost"
            style={{
              fontSize: 13,
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: '0.35px',
              color: activeTab === 'dev' ? 'var(--color-bone-white)' : 'var(--color-ash-gray)',
              borderBottom: activeTab === 'dev' ? '2px solid var(--color-electric-iris)' : '2px solid transparent',
              padding: '4px 0',
              background: 'none',
              cursor: 'pointer'
            }}
          >
            Developer
          </button>

          <button
            onClick={toggleTheme}
            className="btn-ghost"
            style={{
              padding: '8px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              background: 'none',
              border: 'none',
              color: 'var(--color-ash-gray)'
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
      <main style={{ flex: 1, padding: '32px', maxWidth: 'var(--page-max-width, 1440px)', margin: '0 auto', width: '100%', boxSizing: 'border-box' }}>
        <Suspense fallback={
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh', color: 'var(--color-ash-gray)', fontSize: 13, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            <span style={{ display: 'inline-block', width: 8, height: 8, borderRadius: '50%', background: 'var(--color-electric-iris)', marginRight: 10, animation: 'pulse 1.2s infinite' }} />
            Loading Veritas Node...
          </div>
        }>
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
    </div>
  );
}
