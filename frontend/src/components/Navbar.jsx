import React from 'react';
import { Shield, Sparkles, School, Layers, CheckCircle, AlertCircle } from 'lucide-react';

export default function Navbar({ activeTab, setActiveTab, activeTier, setActiveTier, serverStatus }) {
  const tiers = [
    { id: 'flash', label: '⚡ FLASH', desc: '1:1 Diff & Winnowing' },
    { id: 'pro', label: '🏆 PRO', desc: 'Classroom NxN & Rubrics' },
    { id: 'max', label: '🚀 MAX', desc: 'Code AST & Vault' },
    { id: 'ultra', label: '👑 ULTRA', desc: 'AI Writing Forensics' },
  ];

  return (
    <header style={{
      borderBottom: '1px solid var(--border-subtle)',
      background: 'rgba(11, 15, 23, 0.95)',
      backdropFilter: 'blur(12px)',
      position: 'sticky',
      top: 0,
      zIndex: 50,
      padding: '12px 24px'
    }}>
      <div style={{ maxWidth: 1400, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
        
        {/* Brand */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            background: 'linear-gradient(135deg, #2563EB, #7C3AED)',
            padding: 8,
            borderRadius: 10,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 0 16px rgba(37, 99, 235, 0.4)'
          }}>
            <Shield size={22} color="#fff" />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 18, fontWeight: 700, letterSpacing: -0.5, color: '#F8FAFC' }}>VERITAS</span>
              <span style={{ fontSize: 11, background: '#1E293B', color: '#94A3B8', padding: '2px 6px', borderRadius: 4, fontWeight: 600 }}>v1.0 LTS</span>
            </div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Universal Integrity & Classroom Plagiarism Engine</div>
          </div>
        </div>

        {/* Main View Tabs */}
        <div style={{ display: 'flex', gap: 6, background: '#131A26', padding: 4, borderRadius: 10, border: '1px solid var(--border-subtle)' }}>
          <button
            onClick={() => setActiveTab('studio')}
            className="btn"
            style={{
              padding: '7px 14px',
              fontSize: 13,
              background: activeTab === 'studio' ? '#2563EB' : 'transparent',
              color: activeTab === 'studio' ? '#fff' : 'var(--text-secondary)'
            }}
          >
            <Sparkles size={16} /> Universal Studio
          </button>
          
          <button
            onClick={() => setActiveTab('classroom')}
            className="btn"
            style={{
              padding: '7px 14px',
              fontSize: 13,
              background: activeTab === 'classroom' ? '#2563EB' : 'transparent',
              color: activeTab === 'classroom' ? '#fff' : 'var(--text-secondary)'
            }}
          >
            <School size={16} /> Classroom & Rubrics
          </button>

          <button
            onClick={() => setActiveTab('demobench')}
            className="btn"
            style={{
              padding: '7px 14px',
              fontSize: 13,
              background: activeTab === 'demobench' ? '#2563EB' : 'transparent',
              color: activeTab === 'demobench' ? '#fff' : 'var(--text-secondary)'
            }}
          >
            <Layers size={16} /> 1-Click Demo Bench
          </button>
        </div>

        {/* Tier Badges & Server Status */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ display: 'flex', gap: 6 }}>
            {tiers.map(t => (
              <span
                key={t.id}
                className={`badge badge-${t.id}`}
                title={t.desc}
                style={{ cursor: 'help' }}
              >
                {t.label}
              </span>
            ))}
          </div>

          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            fontSize: 12,
            background: '#131A26',
            padding: '4px 10px',
            borderRadius: 20,
            border: '1px solid var(--border-subtle)',
            color: serverStatus.online ? '#34D399' : '#F87171'
          }}>
            {serverStatus.online ? <CheckCircle size={13} /> : <AlertCircle size={13} />}
            <span>{serverStatus.online ? 'Services Ready' : 'Connecting...'}</span>
          </div>
        </div>

      </div>
    </header>
  );
}

