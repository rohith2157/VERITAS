import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import DalaInteractiveCanvas from './components/DalaInteractiveCanvas';
import DalaManifestoPage from './components/DalaManifestoPage';
import UniversalStudio from './components/studio/UniversalStudio';
import ClassroomPortal from './components/classroom/ClassroomPortal';
import DemoBench from './components/DemoBench';

export default function App() {
  const [activeTab, setActiveTab] = useState('manifesto'); // 'manifesto', 'studio', 'classroom', 'demobench'
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
    <div style={{ position: 'relative', minHeight: '100vh', background: '#000000', overflowX: 'hidden' }}>
      
      {/* 1. Global 3D Scroll-Morphing Particle Canvas */}
      <DalaInteractiveCanvas />

      {/* 2. Top-Aligned Sticky Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        serverStatus={serverStatus}
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
      </main>

    </div>
  );
}
