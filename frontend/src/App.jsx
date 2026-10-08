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

  return (
    <div style={{ position: 'relative', minHeight: '100vh', background: 'var(--color-void)', overflowX: 'hidden', transition: 'background-color 0.25s ease' }}>
      
      {/* 1. Global 3D Scroll-Morphing Particle Canvas */}
      <DalaInteractiveCanvas theme={theme} />

      {/* 2. Top-Aligned Sticky Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        serverStatus={serverStatus}
        theme={theme}
        toggleTheme={toggleTheme}
      />

      {/* 3. Main View Router */}
      <main style={{ position: 'relative', zIndex: 1, minHeight: '100vh' }}>
        {activeTab === 'manifesto' && (
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
        )}

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

    </div>
  );
}
