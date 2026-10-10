import React, { useState } from 'react';
import { 
  ShieldCheck, AlertTriangle, Cpu, Database, CheckCircle, Search, 
  ArrowRight, FileText, Lock, Activity, BarChart2, RefreshCw, Filter, Layers, Download
} from 'lucide-react';

export default function OperationsDashboard({ onOpenStudio, onOpenClassroom, onOpenDemoBench, onOpenDev }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all'); // 'all', 'verified', 'flagged'

  // Domain-accurate static telemetry & submission queue
  const recentSubmissions = [
    {
      id: 'sub-9041',
      studentName: 'Arjun Patel',
      studentEmail: 'arjun.p@cs.university.edu',
      assignment: 'Assignment 3: Raft Consensus & Byzantine Fault Tolerance',
      course: 'CS 401',
      timestamp: '12 mins ago',
      originalityScore: 94,
      status: 'verified',
      statusLabel: 'VERIFIED ORIGINAL',
      flags: ['Clean AST Profile', 'Zero Evasion'],
      ledgerHash: '0x4a8f9b2d...c301'
    },
    {
      id: 'sub-9042',
      studentName: 'Rohan Gupta',
      studentEmail: 'rohan.g@cs.university.edu',
      assignment: 'Assignment 3: Raft Consensus & Byzantine Fault Tolerance',
      course: 'CS 401',
      timestamp: '28 mins ago',
      originalityScore: 41,
      status: 'flagged_collusion',
      statusLabel: 'COLLUSION DETECTED',
      flags: ['82% Shared Fingerprints with Arjun Patel', 'Section 2 Cloned'],
      ledgerHash: '0x7e120d91...a418'
    },
    {
      id: 'sub-9043',
      studentName: 'Elena Rostova',
      studentEmail: 'elena.r@cs.university.edu',
      assignment: 'Assignment 3: Raft Consensus & Byzantine Fault Tolerance',
      course: 'CS 401',
      timestamp: '1 hour ago',
      originalityScore: 88,
      status: 'flagged_evasion',
      statusLabel: 'EVASION NEUTRALIZED',
      flags: ['14 Cyrillic Homoglyphs Neutralized', '6 Zero-Width Spaces Removed'],
      ledgerHash: '0x9b33fe14...f882'
    },
    {
      id: 'sub-9044',
      studentName: 'David Chen',
      studentEmail: 'david.c@cs.university.edu',
      assignment: 'Assignment 3: Raft Consensus & Byzantine Fault Tolerance',
      course: 'CS 401',
      timestamp: '2 hours ago',
      originalityScore: 22,
      status: 'flagged_ai',
      statusLabel: 'SYNTHETIC AI DETECTED',
      flags: ['Perplexity: 14.2 (Extreme Low Variance)', 'Burstiness: 0.12 Uniform'],
      ledgerHash: '0x22c4ab99...11de'
    },
    {
      id: 'sub-9045',
      studentName: 'Sarah Jenkins',
      studentEmail: 'sarah.j@cs.university.edu',
      assignment: 'Assignment 3: Raft Consensus & Byzantine Fault Tolerance',
      course: 'CS 401',
      timestamp: '3 hours ago',
      originalityScore: 98,
      status: 'verified',
      statusLabel: 'VERIFIED ORIGINAL',
      flags: ['450/450 AST Nodes Canonical', 'Rigorous Proof Notation'],
      ledgerHash: '0x55df982a...9834'
    },
    {
      id: 'sub-9046',
      studentName: 'Marcus Vance',
      studentEmail: 'm.vance@cs.university.edu',
      assignment: 'Term Paper: Neuromorphic Memory Architectures',
      course: 'ENG 202',
      timestamp: '4 hours ago',
      originalityScore: 96,
      status: 'verified',
      statusLabel: 'VERIFIED ORIGINAL',
      flags: ['Verified Peer Citations', 'Zero Textual Overlap'],
      ledgerHash: '0x88ea3091...bc40'
    }
  ];

  const cryptographicBlocks = [
    { height: 3142, hash: '0x4a8f9b2d8819c301', txCount: 14, timestamp: '12 mins ago', validator: 'Node-US-East (Veritas Enterprise)' },
    { height: 3141, hash: '0x7e120d91ff02a418', txCount: 8, timestamp: '28 mins ago', validator: 'Node-EU-Central (Veritas Enterprise)' },
    { height: 3140, hash: '0x9b33fe14582ef882', txCount: 22, timestamp: '1 hour ago', validator: 'Node-AP-South (Veritas Enterprise)' },
    { height: 3139, hash: '0x22c4ab99018411de', txCount: 19, timestamp: '2 hours ago', validator: 'Node-US-West (Veritas Enterprise)' },
  ];

  const filtered = recentSubmissions.filter(sub => {
    const matchesSearch = sub.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          sub.assignment.toLowerCase().includes(searchQuery.toLowerCase());
    if (filterStatus === 'all') return matchesSearch;
    if (filterStatus === 'verified') return matchesSearch && sub.status === 'verified';
    if (filterStatus === 'flagged') return matchesSearch && sub.status !== 'verified';
    return matchesSearch;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 36 }}>
      <style>{`
        .ops-dashboard-grid {
          display: grid;
          grid-template-columns: minmax(0, 1.85fr) minmax(0, 1fr);
          gap: 28px;
        }
        .ops-sub-card {
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid rgba(255, 255, 255, 0.07);
          border-radius: 16px;
          padding: 16px 20px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
          transition: border-color 0.2s ease, background 0.2s ease;
        }
        .ops-sub-student-col {
          display: flex;
          align-items: center;
          gap: 16px;
          min-width: 240px;
        }
        .ops-sub-flags-col {
          flex: 1;
          padding: 0 16px;
        }
        .ops-sub-actions-col {
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .ops-kpi-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
          gap: 20px;
        }
        @media (max-width: 1024px) {
          .ops-dashboard-grid {
            grid-template-columns: 1fr !important;
            gap: 24px !important;
          }
        }
        @media (max-width: 768px) {
          .ops-sub-card {
            flex-direction: column !important;
            align-items: flex-start !important;
            gap: 14px !important;
            padding: 16px !important;
          }
          .ops-sub-student-col {
            min-width: 0 !important;
            width: 100% !important;
          }
          .ops-sub-flags-col {
            padding: 0 !important;
            width: 100% !important;
          }
          .ops-sub-actions-col {
            width: 100% !important;
            justify-content: flex-end !important;
          }
        }
        @media (max-width: 580px) {
          .ops-kpi-grid {
            grid-template-columns: 1fr !important;
          }
          .ops-header-controls {
            flex-direction: column !important;
            align-items: stretch !important;
            width: 100% !important;
          }
          .ops-search-input-wrap {
            width: 100% !important;
          }
        }
      `}</style>

      {/* 1. Header & Summary Banner */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 20 }}>
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontSize: 12, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--color-electric-iris)', marginBottom: 10 }}>
            <Activity size={14} />
            <span>INSTITUTIONAL INTEGRITY CONTROL DECK</span>
          </div>
          <h1 style={{ fontSize: 32, fontWeight: 400, letterSpacing: '-0.03em', margin: 0, color: 'var(--color-bone-white)' }}>
            Operations &amp; Forensic Ledger
          </h1>
          <p style={{ fontSize: 16, fontWeight: 200, color: 'var(--color-ash-gray)', marginTop: 8, maxWidth: 640 }}>
            Real-time correlation across multi-engine winnowing hashes, AST syntactic code clones, and adversarial evasion vectors.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button 
            onClick={onOpenDemoBench}
            className="btn-ghost"
            style={{ 
              display: 'inline-flex', alignItems: 'center', gap: 8, padding: '10px 18px', borderRadius: 9999, 
              border: '1px solid rgba(255,255,255,0.12)', background: 'rgba(255,255,255,0.03)', color: 'var(--color-bone-white)',
              fontSize: 13, fontWeight: 600, cursor: 'pointer', textTransform: 'uppercase', letterSpacing: '0.025em'
            }}
          >
            <ShieldCheck size={16} color="var(--color-saffron-spark)" />
            <span>Adversarial Bench</span>
          </button>

          <button 
            onClick={onOpenDev}
            className="btn-ghost"
            style={{ 
              display: 'inline-flex', alignItems: 'center', gap: 8, padding: '10px 18px', borderRadius: 9999, 
              border: '1px solid var(--color-electric-iris)', background: 'rgba(128, 82, 255, 0.1)', color: 'var(--color-bone-white)',
              fontSize: 13, fontWeight: 600, cursor: 'pointer', textTransform: 'uppercase', letterSpacing: '0.025em'
            }}
          >
            <Cpu size={16} color="var(--color-electric-iris)" />
            <span>Developer Workstation</span>
          </button>
        </div>
      </div>

      {/* 2. Key Performance Indicators (KPIs) */}
      <div className="ops-kpi-grid">
        <div className="veritas-surface" style={{ padding: '24px 28px' }}>
          <div style={{ fontSize: 12, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em', color: 'var(--color-ash-gray)', marginBottom: 8 }}>
            Total Submissions
          </div>
          <div style={{ fontSize: 36, fontWeight: 400, letterSpacing: '-0.04em', color: 'var(--color-bone-white)' }}>
            14,892
          </div>
          <div style={{ fontSize: 12, fontWeight: 400, color: 'var(--color-deep-verdant)', marginTop: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
            <span>↑ 12.4%</span>
            <span style={{ color: 'var(--color-ash-gray)' }}>across 4 academic terms</span>
          </div>
        </div>

        <div className="veritas-surface" style={{ padding: '24px 28px' }}>
          <div style={{ fontSize: 12, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em', color: 'var(--color-ash-gray)', marginBottom: 8 }}>
            Mean Originality Index
          </div>
          <div style={{ fontSize: 36, fontWeight: 400, letterSpacing: '-0.04em', color: 'var(--color-electric-iris)' }}>
            91.6%
          </div>
          <div style={{ fontSize: 12, fontWeight: 400, color: 'var(--color-ash-gray)', marginTop: 8 }}>
            Algorithmic 95% Confidence Interval
          </div>
        </div>

        <div className="veritas-surface" style={{ padding: '24px 28px' }}>
          <div style={{ fontSize: 12, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em', color: 'var(--color-ash-gray)', marginBottom: 8 }}>
            Flagged for Faculty Review
          </div>
          <div style={{ fontSize: 36, fontWeight: 400, letterSpacing: '-0.04em', color: 'var(--color-saffron-spark)' }}>
            47
          </div>
          <div style={{ fontSize: 12, fontWeight: 400, color: 'var(--color-saffron-spark)', marginTop: 8 }}>
            3.2% of cohort (Collusion &amp; Clones)
          </div>
        </div>

        <div className="veritas-surface" style={{ padding: '24px 28px' }}>
          <div style={{ fontSize: 12, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em', color: 'var(--color-ash-gray)', marginBottom: 8 }}>
            Evasion Attacks Neutralized
          </div>
          <div style={{ fontSize: 36, fontWeight: 400, letterSpacing: '-0.04em', color: 'var(--color-electric-iris)' }}>
            128
          </div>
          <div style={{ fontSize: 12, fontWeight: 400, color: 'var(--color-ash-gray)', marginTop: 8 }}>
            Cyrillic homoglyphs &amp; zero-width spaces
          </div>
        </div>
      </div>

      {/* 3. Main Operational Sections: Submissions Queue + Cryptographic Ledger */}
      <div className="ops-dashboard-grid">
        {/* Left Column: Recent Submissions Queue */}
        <div className="veritas-surface" style={{ padding: 28, display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 14 }}>
            <div>
              <h2 style={{ fontSize: 18, fontWeight: 400, color: 'var(--color-bone-white)', margin: 0, letterSpacing: '-0.02em' }}>
                Recent Evaluation Queue
              </h2>
              <div style={{ fontSize: 13, fontWeight: 200, color: 'var(--color-ash-gray)', marginTop: 4 }}>
                Instant attribution and similarity analysis across incoming student submissions
              </div>
            </div>

            <div className="ops-header-controls" style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div className="ops-search-input-wrap" style={{ position: 'relative', width: 220 }}>
                <Search size={14} style={{ position: 'absolute', left: 12, top: 11, color: 'var(--color-ash-gray)' }} />
                <input 
                  type="text"
                  placeholder="Filter student or course..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{
                    width: '100%',
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: 9999,
                    padding: '8px 12px 8px 34px',
                    color: 'var(--color-bone-white)',
                    fontSize: 13,
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              {/* Status Filters */}
              <div style={{ display: 'flex', background: 'rgba(255, 255, 255, 0.05)', borderRadius: 9999, padding: 3 }}>
                <button
                  onClick={() => setFilterStatus('all')}
                  style={{
                    background: filterStatus === 'all' ? 'var(--color-electric-iris)' : 'none',
                    border: 'none',
                    color: filterStatus === 'all' ? '#fff' : 'var(--color-ash-gray)',
                    fontSize: 11,
                    fontWeight: 600,
                    textTransform: 'uppercase',
                    padding: '5px 12px',
                    borderRadius: 9999,
                    cursor: 'pointer'
                  }}
                >
                  All
                </button>
                <button
                  onClick={() => setFilterStatus('verified')}
                  style={{
                    background: filterStatus === 'verified' ? 'var(--color-deep-verdant)' : 'none',
                    border: 'none',
                    color: filterStatus === 'verified' ? '#fff' : 'var(--color-ash-gray)',
                    fontSize: 11,
                    fontWeight: 600,
                    textTransform: 'uppercase',
                    padding: '5px 12px',
                    borderRadius: 9999,
                    cursor: 'pointer'
                  }}
                >
                  Clean
                </button>
                <button
                  onClick={() => setFilterStatus('flagged')}
                  style={{
                    background: filterStatus === 'flagged' ? 'var(--color-saffron-spark)' : 'none',
                    border: 'none',
                    color: filterStatus === 'flagged' ? '#000' : 'var(--color-ash-gray)',
                    fontSize: 11,
                    fontWeight: 600,
                    textTransform: 'uppercase',
                    padding: '5px 12px',
                    borderRadius: 9999,
                    cursor: 'pointer'
                  }}
                >
                  Flagged
                </button>
              </div>
            </div>
          </div>

          {/* Submissions List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {filtered.map(sub => {
              const isFlagged = sub.status !== 'verified';
              const badgeColor = sub.status === 'verified' 
                ? 'var(--color-deep-verdant)' 
                : sub.status === 'flagged_collusion' 
                  ? 'var(--color-saffron-spark)' 
                  : sub.status === 'flagged_evasion' 
                    ? 'var(--color-electric-iris)' 
                    : 'var(--color-saffron-spark)';

              return (
                <div 
                  key={sub.id}
                  className="ops-sub-card"
                >
                  <div className="ops-sub-student-col">
                    <div 
                      style={{ 
                        width: 44, 
                        height: 44, 
                        borderRadius: 12, 
                        background: 'rgba(255, 255, 255, 0.05)', 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center',
                        fontSize: 14,
                        fontWeight: 600,
                        color: isFlagged ? badgeColor : 'var(--color-bone-white)',
                        border: `1px solid ${isFlagged ? badgeColor : 'rgba(255,255,255,0.1)'}`,
                        flexShrink: 0
                      }}
                    >
                      {sub.originalityScore}%
                    </div>
                    <div>
                      <div style={{ fontSize: 15, fontWeight: 400, color: 'var(--color-bone-white)' }}>
                        {sub.studentName}
                      </div>
                      <div style={{ fontSize: 12, fontWeight: 200, color: 'var(--color-ash-gray)', marginTop: 2 }}>
                        {sub.course} • {sub.timestamp}
                      </div>
                    </div>
                  </div>

                  {/* Status & Flags */}
                  <div className="ops-sub-flags-col">
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em', color: badgeColor, marginBottom: 4 }}>
                      {isFlagged ? <AlertTriangle size={12} /> : <CheckCircle size={12} />}
                      <span>{sub.statusLabel}</span>
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--color-ash-gray)', display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                      {sub.flags.map((f, i) => (
                        <span key={i} style={{ background: 'rgba(255,255,255,0.04)', padding: '3px 8px', borderRadius: 9999, border: '1px solid rgba(255,255,255,0.06)' }}>
                          {f}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="ops-sub-actions-col">
                    <button
                      onClick={onOpenStudio}
                      className="btn-ghost"
                      style={{
                        padding: '6px 14px',
                        borderRadius: 20,
                        fontSize: 12,
                        fontWeight: 600,
                        textTransform: 'uppercase',
                        letterSpacing: '0.025em',
                        color: 'var(--color-bone-white)',
                        border: '1px solid rgba(255, 255, 255, 0.15)',
                        background: 'transparent',
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 6
                      }}
                    >
                      <span>Inspect Diff</span>
                      <ArrowRight size={13} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Cryptographic Ledger & System Signals */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
          {/* Cryptographic Ledger Block View */}
          <div className="veritas-surface" style={{ padding: 24 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Lock size={16} color="var(--color-electric-iris)" />
                <h3 style={{ fontSize: 16, fontWeight: 400, color: 'var(--color-bone-white)', margin: 0 }}>
                  Cryptographic Ledger
                </h3>
              </div>
              <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--color-deep-verdant)', background: 'rgba(21, 132, 110, 0.15)', padding: '3px 8px', borderRadius: 12 }}>
                ANCHORED
              </span>
            </div>

            <p style={{ fontSize: 13, fontWeight: 200, color: 'var(--color-ash-gray)', margin: '0 0 16px 0' }}>
              Submissions are cryptographically hashed using SHA-256 and committed to a tamper-proof distributed institutional ledger.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {cryptographicBlocks.map(b => (
                <div 
                  key={b.height}
                  style={{
                    padding: '12px 14px',
                    borderRadius: 10,
                    background: 'rgba(255, 255, 255, 0.03)',
                    border: '1px solid rgba(255, 255, 255, 0.06)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 4
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-bone-white)', fontFamily: 'monospace' }}>
                      Block #{b.height}
                    </span>
                    <span style={{ fontSize: 11, color: 'var(--color-ash-gray)' }}>
                      {b.timestamp}
                    </span>
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--color-electric-iris)', fontFamily: 'monospace' }}>
                    {b.hash}
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--color-ash-gray)', display: 'flex', justifyContent: 'space-between', marginTop: 2 }}>
                    <span>{b.txCount} submissions verified</span>
                    <span>{b.validator}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Academic Actions */}
          <div className="veritas-surface" style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 14 }}>
            <h3 style={{ fontSize: 16, fontWeight: 400, color: 'var(--color-bone-white)', margin: 0 }}>
              Faculty Shortcuts
            </h3>
            
            <button
              onClick={onOpenClassroom}
              style={{
                background: 'rgba(255, 255, 255, 0.04)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: 12,
                padding: '12px 16px',
                color: 'var(--color-bone-white)',
                textAlign: 'left',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                cursor: 'pointer'
              }}
            >
              <div>
                <div style={{ fontSize: 14, fontWeight: 500 }}>Open CS 401 Classroom Matrix</div>
                <div style={{ fontSize: 12, color: 'var(--color-ash-gray)', marginTop: 2 }}>Inspect peer collusion &amp; rubric deductions</div>
              </div>
              <ArrowRight size={16} color="var(--color-ash-gray)" />
            </button>

            <button
              onClick={onOpenDemoBench}
              style={{
                background: 'rgba(255, 255, 255, 0.04)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: 12,
                padding: '12px 16px',
                color: 'var(--color-bone-white)',
                textAlign: 'left',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                cursor: 'pointer'
              }}
            >
              <div>
                <div style={{ fontSize: 14, fontWeight: 500 }}>Test Cyrillic Evasion Vectors</div>
                <div style={{ fontSize: 12, color: 'var(--color-ash-gray)', marginTop: 2 }}>Simulate Unicode homoglyph attacks</div>
              </div>
              <ArrowRight size={16} color="var(--color-ash-gray)" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

