import React, { useState } from 'react';
import { FileText, Cpu, AlertTriangle, ShieldCheck, Zap, RefreshCw, Eye, Code, Search, Sparkles } from 'lucide-react';

export default function UniversalStudio() {
  const [subTab, setSubTab] = useState('1to1'); // '1to1', 'matrix', 'ai', 'code'
  const [loading, setLoading] = useState(false);

  // --- 1-to-1 State ---
  const [textA, setTextA] = useState(
    "Distributed consensus algorithms ensure that a cluster of nodes can agree on values despite network partitions. " +
    "Raft simplifies consensus by decomposing it into leader election, log replication, and safety guarantees. " +
    "A leader is elected via randomized heartbeat timers to prevent split-vote scenarios. " +
    "Once established, all client state transitions flow strictly through the leader before being committed to follower logs."
  );
  const [textB, setTextB] = useState(
    "Distributed consensus algorithms ensure that a cluster of nodes can agree on values despite network partitions. " +
    "Raft simplifies consensus by decomposing it into leader election, log replication, and safety guarantees. " +
    "A leader is elected via randomized heartbeat timers to prevent split-vote scenarios. " +
    "Client state transitions flow strictly through the leader before being committed."
  );
  const [excludeQuotes, setExcludeQuotes] = useState(true);
  const [excludeBiblio, setExcludeBiblio] = useState(true);
  const [diffResult, setDiffResult] = useState(null);

  // --- Cohort Matrix State ---
  const [cohortDocs, setCohortDocs] = useState([
    {
      id: "s1",
      name: "Arjun Patel (Essay 1)",
      timestamp: "2026-10-01T09:15:00",
      text: "Distributed consensus algorithms ensure that a cluster of nodes can agree on values despite network partitions. Raft decomposes leader election and log replication."
    },
    {
      id: "s2",
      name: "Rohan Gupta (Essay 2)",
      timestamp: "2026-10-01T11:45:00",
      text: "Distributed consensus algorithms ensure that a cluster of nodes can agree on values despite network partitions. Raft decomposes leader election and log replication carefully."
    },
    {
      id: "s3",
      name: "Neha Deshmukh (Essay 3)",
      timestamp: "2026-10-01T10:00:00",
      text: "Photosynthesis in green plants converts sunlight into glucose and oxygen through chlorophyll pigments within the thylakoid membranes."
    }
  ]);
  const [matrixResult, setMatrixResult] = useState(null);

  // --- AI Forensics State ---
  const [aiText, setAiText] = useState(
    "Artificial intelligence continues to evolve across modern sectors. " +
    "Machine learning algorithms optimize supply chains and increase operational efficiency. " +
    "Predictive analytics tools assist organizations in making informed business decisions. " +
    "Automation reduces repetitive workflows while maximizing overall productivity."
  );
  const [aiResult, setAiResult] = useState(null);

  // --- Code AST State ---
  const [codeA, setCodeA] = useState(
`def calculate_factorial(n):
    total = 1
    for i in range(1, n + 1):
        total = total * i
    return total`
  );
  const [codeB, setCodeB] = useState(
`# Renamed variables and added comments
def compute_fact(num):
    # initialize accumulator
    res = 1
    for count in range(1, num + 1):
        res = res * count
    return res`
  );
  const [codeResult, setCodeResult] = useState(null);

  // --- API Handlers ---
  const run1to1Diff = async () => {
    setLoading(true);
    try {
      const res = await fetch('http://localhost:8080/api/studio/compare-1to1', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text_a: textA,
          text_b: textB,
          title_a: "Student Submission",
          title_b: "Reference / Peer Source",
          exclude_quotes: excludeQuotes,
          exclude_bibliography: excludeBiblio
        })
      });
      const data = await res.json();
      setDiffResult(data);
    } catch (e) {
      try {
        const fallback = await fetch('http://localhost:8000/api/v1/compare/one-to-one', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            text_a: textA,
            text_b: textB,
            exclude_quotes: excludeQuotes,
            exclude_bibliography: excludeBiblio
          })
        });
        setDiffResult(await fallback.json());
      } catch (err) {
        alert("Please ensure Spring Boot (:8080) or Python AI Engine (:8000) is running!");
      }
    } finally {
      setLoading(false);
    }
  };

  const runCohortMatrix = async () => {
    setLoading(true);
    try {
      const res = await fetch('http://localhost:8080/api/studio/cohort-matrix', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          documents: cohortDocs,
          collusion_threshold: 20.0
        })
      });
      const data = await res.json();
      setMatrixResult(data);
    } catch (e) {
      try {
        const fallback = await fetch('http://localhost:8000/api/v1/compare/many-to-many', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            documents: cohortDocs,
            collusion_threshold: 20.0
          })
        });
        setMatrixResult(await fallback.json());
      } catch (err) {
        alert("Please ensure backend servers are running!");
      }
    } finally {
      setLoading(false);
    }
  };

  const runAiForensics = async () => {
    setLoading(true);
    try {
      const res = await fetch('http://localhost:8080/api/studio/ai-forensics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: aiText })
      });
      const data = await res.json();
      setAiResult(data);
    } catch (e) {
      try {
        const fallback = await fetch('http://localhost:8000/api/v1/detect/ai-forensics', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text: aiText })
        });
        setAiResult(await fallback.json());
      } catch (err) {
        alert("Please ensure backend servers are running!");
      }
    } finally {
      setLoading(false);
    }
  };

  const runCodeAst = async () => {
    setLoading(true);
    try {
      const res = await fetch('http://localhost:8080/api/studio/code-ast', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code_a: codeA, code_b: codeB, language: "python" })
      });
      const data = await res.json();
      setCodeResult(data);
    } catch (e) {
      try {
        const fallback = await fetch('http://localhost:8000/api/v1/detect/code-ast', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ code_a: codeA, code_b: codeB, language: "python" })
        });
        setCodeResult(await fallback.json());
      } catch (err) {
        alert("Please ensure backend servers are running!");
      }
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: '1to1', label: '1-to-1 Split Diff', tier: 'FLASH', icon: '⚡' },
    { id: 'matrix', label: 'Cohort N×N Matrix', tier: 'PRO', icon: '👥' },
    { id: 'ai', label: 'AI Forensics', tier: 'ULTRA', icon: '🤖' },
    { id: 'code', label: 'Code AST Clone', tier: 'MAX', icon: '💻' },
  ];

  return (
    <div style={{ maxWidth: 'var(--page-max-width)', margin: '40px auto', padding: '0 24px' }}>
      
      {/* Studio Header & Sub-Tabs in Dala Monolithic Rhythm */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
        marginBottom: 36,
        flexWrap: 'wrap',
        gap: 24,
        borderBottom: '1px solid var(--border-subtle)',
        paddingBottom: 24
      }}>
        <div>
          <span className="eyebrow-accent">
            Originality Architecture
          </span>
          <h1 className="heading-md" style={{ marginBottom: 8 }}>
            Universal Originality Studio
          </h1>
          <p className="body-light" style={{ maxWidth: 540 }}>
            Algorithmic document integrity and peer collusion discovery across the Veritas Triad.
          </p>
        </div>

        {/* Tab Controls: Floating Ghost Pills */}
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {tabs.map(t => {
            const isActive = subTab === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setSubTab(t.id)}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '10px 18px',
                  borderRadius: 24,
                  fontSize: 13,
                  fontWeight: 600,
                  textTransform: 'uppercase',
                  letterSpacing: '0.025em',
                  background: isActive ? 'var(--color-electric-iris)' : 'var(--bg-card)',
                  color: isActive ? '#ffffff' : 'var(--color-ash-gray)',
                  border: isActive ? '1px solid var(--color-electric-iris)' : '1px solid var(--border-subtle)',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
              >
                <span>{t.icon}</span>
                <span>{t.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ==================== SUB-TAB 1: 1-TO-1 SPLIT DIFF ==================== */}
      {subTab === '1to1' && (
        <div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: 24, marginBottom: 24 }}>
            <div className="dala-surface">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <span style={{ fontWeight: 400, fontSize: 16, color: 'var(--color-bone-white)' }}>Primary Submission (Document A)</span>
                <span style={{ fontSize: 12, color: 'var(--color-ash-gray)' }}>{textA.length} characters</span>
              </div>
              <textarea
                className="form-textarea"
                rows={9}
                value={textA}
                onChange={e => setTextA(e.target.value)}
                placeholder="Paste primary document here..."
                style={{ fontSize: 14, lineHeight: 1.6 }}
              />
            </div>

            <div className="dala-surface">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <span style={{ fontWeight: 400, fontSize: 16, color: 'var(--color-bone-white)' }}>Comparison Source (Document B)</span>
                <span style={{ fontSize: 12, color: 'var(--color-ash-gray)' }}>{textB.length} characters</span>
              </div>
              <textarea
                className="form-textarea"
                rows={9}
                value={textB}
                onChange={e => setTextB(e.target.value)}
                placeholder="Paste reference or peer document here..."
                style={{ fontSize: 14, lineHeight: 1.6 }}
              />
            </div>
          </div>

          {/* Options & Action Bar */}
          <div className="dala-surface" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32, padding: '20px 28px', flexWrap: 'wrap', gap: 16 }}>
            <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: 'var(--color-silver-mist)', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={excludeQuotes}
                  onChange={e => setExcludeQuotes(e.target.checked)}
                  style={{ accentColor: 'var(--color-electric-iris)' }}
                />
                Exclude Direct Quotations ("...")
              </label>

              <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: 'var(--color-silver-mist)', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={excludeBiblio}
                  onChange={e => setExcludeBiblio(e.target.checked)}
                  style={{ accentColor: 'var(--color-electric-iris)' }}
                />
                Exclude References / Bibliography
              </label>
            </div>

            <button
              onClick={run1to1Diff}
              disabled={loading}
              className="btn-pill-primary"
            >
              <Zap size={15} />
              <span>{loading ? 'Fingerprinting...' : 'Execute Comparison'}</span>
            </button>
          </div>

          {/* 1-to-1 Results Dossier */}
          {diffResult && (
            <div className="dala-surface" style={{ marginBottom: 40 }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
                paddingBottom: 24,
                marginBottom: 24,
                flexWrap: 'wrap',
                gap: 16
              }}>
                <div>
                  <span className="eyebrow-accent" style={{ marginBottom: 4 }}>
                    Winnowing N-Gram Analysis
                  </span>
                  <h3 className="heading-sm" style={{ margin: 0 }}>
                    Comparison Dossier
                  </h3>
                  <p style={{ fontSize: 13, color: 'var(--color-silver-mist)', marginTop: 4 }}>
                    Fingerprinting generated via Winnowing Algorithm (w=4, k=5)
                  </p>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <div style={{
                    fontSize: 48,
                    fontWeight: 400,
                    letterSpacing: -1.68,
                    color: diffResult.color_tier?.hex || 'var(--color-bone-white)'
                  }}>
                    {diffResult.similarity_score}%
                  </div>
                  <div style={{
                    fontSize: 12,
                    fontWeight: 600,
                    textTransform: 'uppercase',
                    letterSpacing: '0.025em',
                    color: diffResult.color_tier?.hex || 'var(--color-saffron-spark)'
                  }}>
                    {diffResult.color_tier?.label || 'Match Evaluation'}
                  </div>
                </div>
              </div>

              {/* Integrity Evasion Audit */}
              {diffResult.document_stats?.doc_a?.integrity?.is_suspicious && (
                <div style={{
                  background: 'rgba(239, 68, 68, 0.08)',
                  border: '1px solid rgba(239, 68, 68, 0.4)',
                  borderRadius: 16,
                  padding: 16,
                  marginBottom: 24
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#f87171', fontWeight: 600, fontSize: 14 }}>
                    <AlertTriangle size={18} />
                    Integrity Evasion Attack Detected in Document A!
                  </div>
                  <ul style={{ margin: '8px 0 0 24px', fontSize: 13, color: '#fca5a5' }}>
                    {diffResult.document_stats.doc_a.integrity.flags.map((f, i) => (
                      <li key={i}>{f.description}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Matched Snippets */}
              <h4 style={{ fontSize: 14, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.025em', color: 'var(--color-silver-mist)', marginBottom: 16 }}>
                Matched Passages ({diffResult.total_matches_found} segments identified):
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {diffResult.matched_segments?.map((seg, idx) => (
                  <div key={idx} style={{
                    background: 'rgba(255, 255, 255, 0.03)',
                    border: '1px solid rgba(255, 255, 255, 0.06)',
                    borderRadius: 16,
                    padding: 18
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'var(--color-ash-gray)', marginBottom: 8 }}>
                      <span>Fragment #{idx + 1} (Characters {seg.start_a} to {seg.end_a})</span>
                      <span className="badge-tag badge-flash">Exact Shingle Match</span>
                    </div>
                    <div style={{
                      fontSize: 14,
                      color: 'var(--color-saffron-spark)',
                      background: 'rgba(255, 184, 41, 0.06)',
                      padding: 12,
                      borderRadius: 8,
                      lineHeight: 1.6
                    }}>
                      "{seg.snippet_a}"
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ==================== SUB-TAB 2: COHORT MATRIX ==================== */}
      {subTab === 'matrix' && (
        <div>
          <div className="dala-surface" style={{ marginBottom: 32 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: 16 }}>
              <div>
                <span className="eyebrow-accent">Peer Collusion Matrix</span>
                <h3 className="heading-sm" style={{ margin: 0 }}>Classroom Cohort Batch ({cohortDocs.length} submissions)</h3>
                <p style={{ fontSize: 13, color: 'var(--color-silver-mist)', marginTop: 4 }}>
                  Cross-checks all submissions in O(N²) to identify collusion rings and original submitter (Patient Zero).
                </p>
              </div>
              <button
                onClick={runCohortMatrix}
                disabled={loading}
                className="btn-pill-primary"
              >
                <Zap size={15} />
                <span>{loading ? 'Cross-Matching...' : 'Run N×N Collusion Scan'}</span>
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
              {cohortDocs.map(d => (
                <div key={d.id} style={{
                  background: 'rgba(255, 255, 255, 0.03)',
                  border: '1px solid rgba(255, 255, 255, 0.06)',
                  borderRadius: 16,
                  padding: 16
                }}>
                  <div style={{ fontWeight: 400, fontSize: 15, color: '#ffffff', marginBottom: 4 }}>{d.name}</div>
                  <div style={{ fontSize: 11, color: 'var(--color-ash-gray)', marginBottom: 8, fontFamily: 'var(--font-mono)' }}>
                    Timestamp: {d.timestamp}
                  </div>
                  <div style={{ fontSize: 13, color: 'var(--color-silver-mist)', fontWeight: 200, lineHeight: 1.5 }}>
                    {d.text.substring(0, 110)}...
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Matrix Results */}
          {matrixResult && (
            <div className="dala-surface" style={{ marginBottom: 40 }}>
              <div style={{ marginBottom: 20 }}>
                <span className="eyebrow-accent">Calculated Graph</span>
                <h3 className="heading-sm" style={{ margin: 0 }}>N×N Pairwise Collusion Heatmap</h3>
              </div>

              {/* Collusion Rings */}
              {matrixResult.collusion_clusters && matrixResult.collusion_clusters.length > 0 && (
                <div style={{
                  background: 'rgba(239, 68, 68, 0.08)',
                  border: '1px solid rgba(239, 68, 68, 0.35)',
                  borderRadius: 16,
                  padding: 18,
                  marginBottom: 24
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#f87171', fontWeight: 600 }}>
                    <AlertTriangle size={18} />
                    {matrixResult.collusion_clusters.length} Collusion Ring(s) Detected!
                  </div>
                  {matrixResult.collusion_clusters.map((c, i) => (
                    <div key={i} style={{ marginTop: 10, fontSize: 13, color: '#fca5a5' }}>
                      <strong>Cluster #{i + 1}:</strong> {c.members?.map(m => m.name).join(' ↔ ')}
                      <span style={{
                        marginLeft: 14,
                        background: 'rgba(128, 82, 255, 0.2)',
                        border: '1px solid var(--color-electric-iris)',
                        padding: '3px 10px',
                        borderRadius: 12,
                        color: '#ffffff'
                      }}>
                        Patient Zero: <strong>{c.patient_zero}</strong>
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {/* Visual Heatmap Table */}
              <div style={{ overflowX: 'auto', marginBottom: 12 }}>
                <table className="matrix-table">
                  <thead>
                    <tr>
                      <th style={{ background: '#0a0a0c', color: '#ffffff' }}>Submissions</th>
                      {matrixResult.document_headers?.map(h => (
                        <th key={h.id} style={{ background: '#0a0a0c', color: 'var(--color-silver-mist)' }}>{h.name}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {matrixResult.similarity_matrix?.map((row, rIdx) => (
                      <tr key={rIdx}>
                        <td style={{ fontWeight: 400, color: '#ffffff', textAlign: 'left', background: '#0a0a0c' }}>
                          {matrixResult.document_headers[rIdx]?.name}
                        </td>
                        {row.map((val, cIdx) => {
                          const isSelf = rIdx === cIdx;
                          let bg = 'rgba(255, 255, 255, 0.02)';
                          let textColor = 'var(--color-ash-gray)';
                          if (!isSelf) {
                            if (val >= 50) { bg = 'rgba(239, 68, 68, 0.25)'; textColor = '#fca5a5'; }
                            else if (val >= 25) { bg = 'rgba(255, 184, 41, 0.2)'; textColor = '#fde68a'; }
                            else if (val > 0) { bg = 'rgba(21, 132, 110, 0.2)'; textColor = '#6ee7b7'; }
                          }
                          return (
                            <td key={cIdx} style={{ background: bg, color: textColor, fontWeight: val > 20 ? 600 : 400 }}>
                              {isSelf ? '—' : `${val}%`}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ==================== SUB-TAB 3: AI FORENSICS ==================== */}
      {subTab === 'ai' && (
        <div>
          <div className="dala-surface" style={{ marginBottom: 32 }}>
            <span className="eyebrow-accent">Language Predictability</span>
            <h3 className="heading-sm" style={{ marginBottom: 8 }}>AI Writing Forensics (Perplexity & Burstiness)</h3>
            <p style={{ fontSize: 13, color: 'var(--color-silver-mist)', marginBottom: 16 }}>
              Measures n-gram perplexity (statistical predictability) and sentence burstiness (syntactic variation) to separate generative models from human writing.
            </p>
            <textarea
              className="form-textarea"
              rows={7}
              value={aiText}
              onChange={e => setAiText(e.target.value)}
              placeholder="Paste text to analyze for AI writing..."
              style={{ fontSize: 14, lineHeight: 1.6 }}
            />
            <div style={{ marginTop: 18, textAlign: 'right' }}>
              <button
                onClick={runAiForensics}
                disabled={loading}
                className="btn-pill-primary"
              >
                <Cpu size={15} />
                <span>{loading ? 'Evaluating Model Forensics...' : 'Analyze AI Forensics'}</span>
              </button>
            </div>
          </div>

          {aiResult && (
            <div className="dala-surface" style={{ marginBottom: 40 }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 20, marginBottom: 28 }}>
                <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: 24, borderRadius: 16, border: '1px solid rgba(255, 255, 255, 0.06)', textAlign: 'center' }}>
                  <div style={{ fontSize: 12, color: 'var(--color-ash-gray)', textTransform: 'uppercase', letterSpacing: '0.025em' }}>AI Probability Score</div>
                  <div style={{ fontSize: 42, fontWeight: 400, color: aiResult.ai_probability > 60 ? '#ef4444' : '#10b981', margin: '8px 0' }}>
                    {aiResult.ai_probability}%
                  </div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: '#ffffff' }}>{aiResult.verdict}</div>
                </div>

                <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: 24, borderRadius: 16, border: '1px solid rgba(255, 255, 255, 0.06)', textAlign: 'center' }}>
                  <div style={{ fontSize: 12, color: 'var(--color-ash-gray)', textTransform: 'uppercase', letterSpacing: '0.025em' }}>Burstiness (Std Dev)</div>
                  <div style={{ fontSize: 42, fontWeight: 400, color: 'var(--color-saffron-spark)', margin: '8px 0' }}>
                    {aiResult.metrics?.burstiness_std_dev}
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--color-silver-mist)' }}>Higher = Human Sentence Rhythm</div>
                </div>

                <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: 24, borderRadius: 16, border: '1px solid rgba(255, 255, 255, 0.06)', textAlign: 'center' }}>
                  <div style={{ fontSize: 12, color: 'var(--color-ash-gray)', textTransform: 'uppercase', letterSpacing: '0.025em' }}>Perplexity Index</div>
                  <div style={{ fontSize: 42, fontWeight: 400, color: 'var(--color-electric-iris)', margin: '8px 0' }}>
                    {aiResult.metrics?.perplexity_index}
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--color-silver-mist)' }}>Higher = More Unpredictable</div>
                </div>
              </div>

              {/* Sentence Heatmap */}
              <h4 style={{ fontSize: 13, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.025em', color: 'var(--color-silver-mist)', marginBottom: 12 }}>
                Sentence-Level Predictability Distribution:
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {aiResult.sentence_analysis?.map((s, idx) => (
                  <div
                    key={idx}
                    style={{
                      padding: 14,
                      borderRadius: 12,
                      background: s.classification === 'AI' ? 'rgba(239, 68, 68, 0.08)' : 'rgba(21, 132, 110, 0.08)',
                      borderLeft: `4px solid ${s.classification === 'AI' ? '#ef4444' : '#10b981'}`,
                      fontSize: 13,
                      lineHeight: 1.5
                    }}
                  >
                    <span style={{ fontWeight: 600, marginRight: 8, color: s.classification === 'AI' ? '#fca5a5' : '#6ee7b7' }}>
                      [{s.classification} • {s.ai_probability}%]:
                    </span>
                    <span style={{ color: 'var(--color-bone-white)' }}>{s.sentence}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ==================== SUB-TAB 4: CODE AST ==================== */}
      {subTab === 'code' && (
        <div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: 24, marginBottom: 24 }}>
            <div className="dala-surface">
              <span className="eyebrow-accent" style={{ marginBottom: 4 }}>Original Script</span>
              <h3 style={{ fontSize: 16, fontWeight: 400, marginBottom: 12 }}>Source Code A</h3>
              <textarea
                className="form-textarea"
                rows={9}
                style={{ fontFamily: 'var(--font-mono)', fontSize: 13, lineHeight: 1.5 }}
                value={codeA}
                onChange={e => setCodeA(e.target.value)}
              />
            </div>

            <div className="dala-surface">
              <span className="eyebrow-accent" style={{ marginBottom: 4 }}>Modified / Renamed Identifiers</span>
              <h3 style={{ fontSize: 16, fontWeight: 400, marginBottom: 12 }}>Source Code B</h3>
              <textarea
                className="form-textarea"
                rows={9}
                style={{ fontFamily: 'var(--font-mono)', fontSize: 13, lineHeight: 1.5 }}
                value={codeB}
                onChange={e => setCodeB(e.target.value)}
              />
            </div>
          </div>

          <div style={{ textAlign: 'right', marginBottom: 32 }}>
            <button
              onClick={runCodeAst}
              disabled={loading}
              className="btn-pill-primary"
            >
              <Code size={15} />
              <span>{loading ? 'Normalizing Abstract Syntax Tree...' : 'Execute AST Comparison'}</span>
            </button>
          </div>

          {codeResult && (
            <div className="dala-surface" style={{ marginBottom: 40 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 16 }}>
                <div>
                  <span className="eyebrow-accent">Syntactic Equivalence</span>
                  <h3 className="heading-sm" style={{ margin: 0 }}>AST Structural Clone Dossier</h3>
                  <p style={{ fontSize: 13, color: 'var(--color-silver-mist)', marginTop: 4 }}>
                    Normalized variables, functions, and control flow before tokenization.
                  </p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 48, fontWeight: 400, color: codeResult.is_code_clone ? '#ef4444' : '#10b981' }}>
                    {codeResult.structural_similarity}%
                  </div>
                  <div style={{ fontSize: 12, fontWeight: 600, color: codeResult.is_code_clone ? '#ef4444' : '#10b981', textTransform: 'uppercase' }}>
                    {codeResult.is_code_clone ? '⚠️ Structural Code Clone Detected' : 'Unique Logic Structure'}
                  </div>
                </div>
              </div>

              <div style={{ background: '#0a0a0c', border: '1px solid rgba(255, 255, 255, 0.08)', padding: 18, borderRadius: 16, fontSize: 12, fontFamily: 'var(--font-mono)', color: 'var(--color-saffron-spark)' }}>
                <div style={{ color: 'var(--color-ash-gray)', marginBottom: 8 }}>// Normalized AST Representation:</div>
                <pre style={{ margin: 0, whiteSpace: 'pre-wrap', lineHeight: 1.6 }}>{codeResult.normalized_code_b}</pre>
              </div>
            </div>
          )}
        </div>
      )}

    </div>
  );
}
