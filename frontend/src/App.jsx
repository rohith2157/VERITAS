import React, { useState, useEffect, Suspense, lazy } from 'react';
import Navbar from './components/Navbar';
import DalaInteractiveCanvas from './components/DalaInteractiveCanvas';
import DalaManifestoPage from './components/DalaManifestoPage';

const UniversalStudio = lazy(() => import('./components/studio/UniversalStudio'));
const ClassroomPortal = lazy(() => import('./components/classroom/ClassroomPortal'));
const DemoBench = lazy(() => import('./components/DemoBench'));

export default function App() {
  const [activeTab, setActiveTab] = useState('manifesto'); // 'manifesto', 'studio', 'classroom', 'demobench'
  const [serverStatus, setServerStatus] = useState({ online: false, spring: false, python: false });
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

  const checkHealth = async () => {
    let pythonUp = false;
    let springUp = false;

    try {
      const pRes = await fetch('http://localhost:8000/health', { method: 'GET' });
      if (pRes.ok) pythonUp = true;
    } catch (e) {}

    try {
      const sRes = await fetch('http://localhost:8080/api/studio/health', { method: 'GET' });
      if (sRes.ok) springUp = true;
    } catch (e) {}

    setServerStatus({
      online: pythonUp || springUp,
      spring: springUp,
      python: pythonUp
    });
  };

  useEffect(() => {
    checkHealth();
    const interval = setInterval(checkHealth, 6000);
    return () => clearInterval(interval);
  }, []);

  // --- ASScroll Virtual Smooth Scroll Engine (Matching Dala) ---
  const [smoothProgress, setSmoothProgress] = useState(0);
  const [contentHeight, setContentHeight] = useState(0);
  const mainRef = useRef(null);
  const smoothYRef = useRef(0);

  useEffect(() => {
    if (activeTab !== 'manifesto') {
      window.scrollTo(0, 0);
      return;
    }

    let animId;
    let targetY = window.scrollY || window.pageYOffset;

    const handleScroll = () => {
      targetY = window.scrollY || window.pageYOffset;
    };
    window.addEventListener('scroll', handleScroll, { passive: true });

    // Auto-measure content height via ResizeObserver
    let ro;
    if (mainRef.current && typeof ResizeObserver !== 'undefined') {
      ro = new ResizeObserver((entries) => {
        if (entries[0]) {
          const h = entries[0].target.getBoundingClientRect().height;
          if (h > 0) setContentHeight(Math.ceil(h));
        }
      });
      ro.observe(mainRef.current);
    }

    const smoothScrollLoop = () => {
      const prefersReduced = typeof window !== 'undefined' &&
        window.matchMedia &&
        window.matchMedia('(prefers-reduced-motion: reduce)').matches;

      if (prefersReduced) {
        smoothYRef.current = targetY;
      } else {
        smoothYRef.current += (targetY - smoothYRef.current) * 0.085;
      }

      if (mainRef.current) {
        mainRef.current.style.transform = `translate3d(0px, -${smoothYRef.current.toFixed(1)}px, 0px)`;
      }

      const scrollMax = Math.max(1, (contentHeight || document.documentElement.scrollHeight) - window.innerHeight);
      const progress = Math.min(Math.max(smoothYRef.current / scrollMax, 0), 1);
      setSmoothProgress(progress);

      animId = requestAnimationFrame(smoothScrollLoop);
    };

    animId = requestAnimationFrame(smoothScrollLoop);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('scroll', handleScroll);
      if (ro) ro.disconnect();
    };
  }, [activeTab, contentHeight]);

  return (
    <div style={{ position: 'relative', minHeight: '100vh', background: 'var(--color-void)', overflowX: 'hidden', transition: 'background-color 0.25s ease' }}>
      
      {/* 1. Global 3D Scroll-Morphing Particle Canvas */}
      <DalaInteractiveCanvas theme={theme} scrollProgress={activeTab === 'manifesto' ? smoothProgress : undefined} />

      {/* 2. Top-Aligned Sticky Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        serverStatus={serverStatus}
        theme={theme}
        toggleTheme={toggleTheme}
      />

      {/* 3. Main View Router */}
      {activeTab === 'manifesto' ? (
        <>
          {/* ASScroll Virtual Viewport Container */}
          <div
            asscroll-container=""
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              overflow: 'hidden',
              contain: 'content',
              zIndex: 1
            }}
          >
            <main
              ref={mainRef}
              asscroll=""
              style={{
                willChange: 'transform',
                minHeight: '100vh'
              }}
            >
              <DalaManifestoPage
                onOpenStudio={() => {
                  setActiveTab('studio');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                onOpenClassroom={() => {
                  setActiveTab('classroom');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                onOpenDemoBench={() => {
                  setActiveTab('demobench');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
              />
            </main>
          </div>
          {/* Native Scroll Spacer driving browser scrollbar */}
          <div style={{ height: Math.max(contentHeight, 5200), pointerEvents: 'none' }} />
        </>
      ) : (
        <main style={{ position: 'relative', zIndex: 1, minHeight: '100vh' }}>
          <Suspense fallback={
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh', color: 'var(--color-ash-gray)', fontSize: 13, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              <span style={{ display: 'inline-block', width: 8, height: 8, borderRadius: '50%', background: 'var(--color-electric-iris)', marginRight: 10, animation: 'pulse 1.2s infinite' }} />
              Initializing Node Telemetry...
            </div>
          }>
            {activeTab === 'studio' && (
              <div style={{ paddingTop: 80 }}>
                <UniversalStudio />
              </div>
            )}

            {activeTab === 'classroom' && (
              <div style={{ paddingTop: 80 }}>
                <ClassroomPortal />
              </div>
            )}

            {activeTab === 'demobench' && (
              <div style={{ paddingTop: 80 }}>
                <DemoBench />
              </div>
            )}
          </Suspense>
        </main>
      )}

    </div>
  );
}
