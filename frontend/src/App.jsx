import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import UniversalStudio from './components/studio/UniversalStudio';
import ClassroomPortal from './components/classroom/ClassroomPortal';
import DemoBench from './components/DemoBench';

export default function App() {
  const [activeTab, setActiveTab] = useState('studio'); // 'studio', 'classroom', 'demobench'
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
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', background: 'var(--bg-main)' }}>
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        activeTier={activeTier}
        setActiveTier={setActiveTier}
        serverStatus={serverStatus}
      />

      <main style={{ flex: 1, paddingBottom: 40 }}>
        {activeTab === 'studio' && <UniversalStudio />}
        {activeTab === 'classroom' && <ClassroomPortal />}
        {activeTab === 'demobench' && <DemoBench />}
      </main>

      <footer style={{
        borderTop: '1px solid var(--border-subtle)',
        padding: '16px 24px',
        textAlign: 'center',
        fontSize: 12,
        color: 'var(--text-muted)',
        background: '#0B0F17'
      }}>
        Veritas Plagiarism & Document Integrity Engine • React 19 + Spring Boot 3 + Python FastAPI Microservice
      </footer>
    </div>
  );
}
