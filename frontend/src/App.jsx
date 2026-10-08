import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import TriadNetwork from './components/TriadNetwork';
import UniversalStudio from './components/studio/UniversalStudio';
import ClassroomPortal from './components/classroom/ClassroomPortal';
import DemoBench from './components/DemoBench';

export default function App() {
  const [activeTab, setActiveTab] = useState('hero'); // 'hero', 'studio', 'classroom', 'demobench'
  const [activeTier, setActiveTier] = useState('pro');
  const [serverStatus, setServerStatus] = useState({ online: false, spring: false, python: false });

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
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', background: 'var(--color-void)' }}>
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        activeTier={activeTier}
        setActiveTier={setActiveTier}
        serverStatus={serverStatus}
      />

      <main style={{ flex: 1, paddingBottom: 60 }}>
        {activeTab === 'hero' && (
          <>
            <Hero
              onExploreStudio={() => setActiveTab('studio')}
              onOpenDemoBench={() => setActiveTab('demobench')}
            />
            <TriadNetwork serverStatus={serverStatus} />
          </>
        )}

        {activeTab === 'studio' && <UniversalStudio />}
        {activeTab === 'classroom' && <ClassroomPortal />}
        {activeTab === 'demobench' && <DemoBench />}
      </main>

      {/* Dala Style Minimal Void Footer */}
      <footer style={{
        borderTop: '1px solid rgba(255, 255, 255, 0.08)',
        padding: '32px 24px',
        background: 'var(--color-void)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: 16,
        maxWidth: 'var(--page-max-width)',
        margin: '0 auto',
        width: '100%'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <polygon points="12,2 22,20 2,20" fill="#8052ff" />
          </svg>
          <span style={{ fontSize: 13, color: 'var(--color-silver-mist)', fontWeight: 200 }}>
            Veritas Collective Integrity • Dala Dark Velvet Edition
          </span>
        </div>

        <div style={{ display: 'flex', gap: 24, fontSize: 12, color: 'var(--color-ash-gray)' }}>
          <span>React 19</span>
          <span>•</span>
          <span>Spring Boot 3</span>
          <span>•</span>
          <span>Python FastAPI</span>
        </div>
      </footer>
    </div>
  );
}
