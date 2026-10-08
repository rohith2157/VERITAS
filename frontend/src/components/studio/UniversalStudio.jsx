import React, { useState } from 'react';
import { FileText, Cpu, AlertTriangle, ShieldCheck, Zap, RefreshCw, Eye, Code, Search } from 'lucide-react';

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
      // Direct call to Spring Boot gateway or Python engine
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
      // Fallback directly to Python port 8000 if Spring Boot is temporarily offline
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

  return (
    <div style={{ maxWidth: 1400, margin: '24px auto', padding: '0 24px' }}>
      
      {/* Studio Header & Sub-Tabs */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 700, margin: 0 }}>Universal Originality Studio</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>
            Direct algorithmic testing across all four operational tiers.
          </p>
        </div>

        <div style={{ display: 'flex', gap: 8, background: '#131A26', padding: 4, borderRadius: 10, border: '1px solid var(--border-subtle)' }}>
          <button
            onClick={() => setSubTab('1to1')}
            className="btn"
            style={{
              padding: '6px 12px',
              fontSize: 13,
              background: subTab === '1to1' ? '#2563EB' : 'transparent',
              color: subTab === '1to1' ? '#fff' : 'var(--text-secondary)'
            }}
          >
            ⚡ 1-to-1 Split Diff (Flash)
          </button>

          <button
            onClick={() => setSubTab('matrix')}
            className="btn"
            style={{
              padding: '6px 12px',
              fontSize: 13,
              background: subTab === 'matrix' ? '#10B981' : 'transparent',
              color: subTab === 'matrix' ? '#fff' : 'var(--text-secondary)'
            }}
          >
            🏆 Cohort NxN Matrix (Pro)
          </button>

          <button
            onClick={() => setSubTab('ai')}
            className="btn"
            style={{
              padding: '6px 12px',
              fontSize: 13,
              background: subTab === 'ai' ? '#F59E0B' : 'transparent',
              color: subTab === 'ai' ? '#fff' : 'var(--text-secondary)'
            }}
          >
            👑 AI Writing Forensics (Ultra)
          </button>

          <button
            onClick={() => setSubTab('code')}
            className="btn"
            style={{
              padding: '6px 12px',
              fontSize: 13,
              background: subTab === 'code' ? '#8B5CF6' : 'transparent',
              color: subTab === 'code' ? '#fff' : 'var(--text-secondary)'
            }}
          >
            🚀 Code AST Clone (Max)
          </button>
        </div>
      </div>

      {/* ==================== SUB-TAB 1: 1-TO-1 SPLIT DIFF ==================== */}
      {subTab === '1to1' && (
        <div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 16 }}>
            <div className="card">
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <span style={{ fontWeight: 600, fontSize: 14 }}>📄 Document A (Student Submission)</span>
                <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{textA.length} chars</span>
              </div>
              <textarea
                className="form-textarea"
                rows={8}
                value={textA}
                onChange={e => setTextA(e.target.value)}
                placeholder="Paste primary document here..."
              />
            </div>

            <div className="card">
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <span style={{ fontWeight: 600, fontSize: 14 }}>📑 Document B (Comparison Source)</span>
                <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{textB.length} chars</span>
              </div>
              <textarea
                className="form-textarea"
                rows={8}
                value={textB}
                onChange={e => setTextB(e.target.value)}
                placeholder="Paste reference or peer document here..."
              />
            </div>
          </div>

          {/* Options & Action */}
          <div className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, padding: 16 }}>
            <div style={{ display: 'flex', gap: 20 }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={excludeQuotes}
                  onChange={e => setExcludeQuotes(e.target.checked)}
                />
                Exclude Direct Quotations ("...")
              </label>

              <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={excludeBiblio}
                  onChange={e => setExcludeBiblio(e.target.checked)}
                />
                Exclude References / Bibliography
              </label>
            </div>

            <button onClick={run1to1Diff} disabled={loading} className="btn btn-primary">
              <Zap size={16} />
              {loading ? 'Analyzing...' : 'Execute 1-to-1 Comparison'}
            </button>
          </div>

          {/* 1-to-1 Results Card */}
          {diffResult && (
            <div className="card" style={{ marginBottom: 24 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-subtle)', paddingBottom: 16, marginBottom: 16 }}>
                <div>
                  <h3 style={{ fontSize: 18, fontWeight: 700 }}>Comparison Dossier</h3>
                  <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
                    Fingerprinting generated via Winnowing Algorithm (w=4, k=5)
                  </p>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: 28, fontWeight: 800, color: diffResult.color_tier.hex }}>
                      {diffResult.similarity_score}%
                    </div>
                    <div style={{ fontSize: 12, color: diffResult.color_tier.hex, fontWeight: 600 }}>
                      {diffResult.color_tier.label}
                    </div>
                  </div>
                </div>
              </div>

              {/* Integrity Evasion Audit */}
              {diffResult.document_stats.doc_a.integrity.is_suspicious && (
                <div style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid #EF4444', borderRadius: 8, padding: 12, marginBottom: 16 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#F87171', fontWeight: 600, fontSize: 14 }}>
                    <AlertTriangle size={18} />
                    Integrity Evasion Attack Detected in Document A!
                  </div>
                  <ul style={{ margin: '8px 0 0 24px', fontSize: 13, color: '#FCA5A5' }}>
                    {diffResult.document_stats.doc_a.integrity.flags.map((f, i) => (
                      <li key={i}>{f.description}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Highlighted Matched Snippets */}
              <h4 style={{ fontSize: 14, fontWeight: 600, marginBottom: 10, color: 'var(--text-secondary)' }}>
                Matched Passages ({diffResult.total_matches_found} segments identified):
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {diffResult.matched_segments.map((seg, idx) => (
                  <div key={idx} style={{ background: '#0F172A', border: '1px solid var(--border-subtle)', borderRadius: 8, padding: 12 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'var(--text-muted)', marginBottom: 6 }}>
                      <span>Match #{idx + 1} (Characters {seg.start_a} to {seg.end_a})</span>
                      <span className="badge badge-flash">Exact Shingle Match</span>
                    </div>
                    <div style={{ fontSize: 14, color: '#F87171', background: 'rgba(239, 68, 68, 0.08)', padding: 8, borderRadius: 4 }}>
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
          <div className="card" style={{ marginBottom: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <div>
                <h3 style={{ fontSize: 16, fontWeight: 700 }}>Classroom Cohort Batch ({cohortDocs.length} submissions)</h3>
                <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
                  Cross-checks all students against each other to discover peer collusion rings and patient zero.
                </p>
              </div>
              <button onClick={runCohortMatrix} disabled={loading} className="btn btn-primary" style={{ background: '#10B981' }}>
                <Zap size={16} />
                {loading ? 'Computing Matrix...' : 'Run NxN Collusion Analysis'}
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 12 }}>
              {cohortDocs.map(d => (
                <div key={d.id} style={{ background: '#0F172A', border: '1px solid var(--border-subtle)', borderRadius: 8, padding: 12 }}>
                  <div style={{ fontWeight: 600, fontSize: 13, color: '#38BDF8', marginBottom: 4 }}>{d.name}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 6 }}>Submitted: {d.timestamp}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-secondary)', maxLines: 2, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {d.text.substring(0, 100)}...
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Matrix Results */}
          {matrixResult && (
            <div className="card">
              <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 12 }}>Interactive NxN Collusion Matrix Heatmap</h3>

              {/* Collusion Rings */}
              {matrixResult.collusion_clusters && matrixResult.collusion_clusters.length > 0 && (
                <div style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid #EF4444', borderRadius: 8, padding: 14, marginBottom: 20 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#F87171', fontWeight: 700 }}>
                    <AlertTriangle size={18} />
                    {matrixResult.collusion_clusters.length} Collusion Ring(s) Detected!
                  </div>
                  {matrixResult.collusion_clusters.map((c, i) => (
                    <div key={i} style={{ marginTop: 8, fontSize: 13, color: '#FCA5A5' }}>
                      <strong>Ring {i + 1}:</strong> {c.members.map(m => m.name).join(' ↔ ')}
                      <span style={{ marginLeft: 12, background: '#1E293B', padding: '2px 8px', borderRadius: 4, color: '#38BDF8' }}>
                        Patient Zero (Original Submitter): <strong>{c.patient_zero}</strong>
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {/* Visual Heatmap Table */}
              <div style={{ overflowX: 'auto', marginBottom: 20 }}>
                <table className="matrix-table">
                  <thead>
                    <tr>
                      <th style={{ background: '#0F172A' }}>Submissions</th>
                      {matrixResult.document_headers.map(h => (
                        <th key={h.id} style={{ background: '#0F172A', color: '#94A3B8' }}>{h.name}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {matrixResult.similarity_matrix.map((row, rIdx) => (
                      <tr key={rIdx}>
                        <td style={{ fontWeight: 600, color: '#F8FAFC', textAlign: 'left', background: '#0F172A' }}>
                          {matrixResult.document_headers[rIdx].name}
                        </td>
                        {row.map((val, cIdx) => {
                          const isSelf = rIdx === cIdx;
                          let bg = '#131A26';
                          let textColor = '#64748B';
                          if (!isSelf) {
                            if (val >= 50) { bg = 'rgba(239, 68, 68, 0.35)'; textColor = '#FCA5A5'; }
                            else if (val >= 25) { bg = 'rgba(245, 158, 11, 0.25)'; textColor = '#FCD34D'; }
                            else if (val > 0) { bg = 'rgba(16, 185, 129, 0.15)'; textColor = '#6EE7B7'; }
                          }
                          return (
                            <td key={cIdx} style={{ background: bg, color: textColor, fontWeight: val > 20 ? 700 : 400 }}>
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
          <div className="card" style={{ marginBottom: 20 }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 8 }}>AI Writing Predictability & Burstiness Analyzer</h3>
            <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 12 }}>
              Measures perplexity (statistical predictability) and burstiness (sentence rhythm variation) to detect LLM generation.
            </p>
            <textarea
              className="form-textarea"
              rows={6}
              value={aiText}
              onChange={e => setAiText(e.target.value)}
              placeholder="Paste text to analyze for AI writing..."
            />
            <div style={{ marginTop: 12, textAlign: 'right' }}>
              <button onClick={runAiForensics} disabled={loading} className="btn btn-primary" style={{ background: '#F59E0B' }}>
                <Cpu size={16} />
                {loading ? 'Evaluating...' : 'Analyze AI Forensics'}
              </button>
            </div>
          </div>

          {aiResult && (
            <div className="card">
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 20 }}>
                <div style={{ background: '#0F172A', padding: 16, borderRadius: 8, border: '1px solid var(--border-subtle)', textAlign: 'center' }}>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>AI Probability Score</div>
                  <div style={{ fontSize: 32, fontWeight: 800, color: aiResult.ai_probability > 60 ? '#EF4444' : '#10B981' }}>
                    {aiResult.ai_probability}%
                  </div>
                  <div style={{ fontSize: 12, fontWeight: 600 }}>{aiResult.verdict}</div>
                </div>

                <div style={{ background: '#0F172A', padding: 16, borderRadius: 8, border: '1px solid var(--border-subtle)', textAlign: 'center' }}>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Burstiness (Std Dev)</div>
                  <div style={{ fontSize: 28, fontWeight: 700, color: '#38BDF8' }}>
                    {aiResult.metrics.burstiness_std_dev}
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Higher = More Human Variation</div>
                </div>

                <div style={{ background: '#0F172A', padding: 16, borderRadius: 8, border: '1px solid var(--border-subtle)', textAlign: 'center' }}>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Perplexity Index</div>
                  <div style={{ fontSize: 28, fontWeight: 700, color: '#C084FC' }}>
                    {aiResult.metrics.perplexity_index}
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Higher = More Unpredictable</div>
                </div>
              </div>

              {/* Sentence Heatmap */}
              <h4 style={{ fontSize: 14, fontWeight: 600, marginBottom: 10 }}>Sentence-Level Predictability Map:</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {aiResult.sentence_analysis.map((s, idx) => (
                  <div
                    key={idx}
                    style={{
                      padding: 10,
                      borderRadius: 6,
                      background: s.classification === 'AI' ? 'rgba(239, 68, 68, 0.15)' : 'rgba(16, 185, 129, 0.1)',
                      borderLeft: `4px solid ${s.classification === 'AI' ? '#EF4444' : '#10B981'}`,
                      fontSize: 13
                    }}
                  >
                    <span style={{ fontWeight: 600, marginRight: 8, color: s.classification === 'AI' ? '#FCA5A5' : '#6EE7B7' }}>
                      [{s.classification} - {s.ai_probability}%]:
                    </span>
                    {s.sentence}
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
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 16 }}>
            <div className="card">
              <h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 8 }}>Source Code A (Original)</h3>
              <textarea
                className="form-textarea"
                rows={8}
                style={{ fontFamily: 'var(--font-mono)', fontSize: 13 }}
                value={codeA}
                onChange={e => setCodeA(e.target.value)}
              />
            </div>

            <div className="card">
              <h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 8 }}>Source Code B (Renamed / Modified)</h3>
              <textarea
                className="form-textarea"
                rows={8}
                style={{ fontFamily: 'var(--font-mono)', fontSize: 13 }}
                value={codeB}
                onChange={e => setCodeB(e.target.value)}
              />
            </div>
          </div>

          <div style={{ textAlign: 'right', marginBottom: 20 }}>
            <button onClick={runCodeAst} disabled={loading} className="btn btn-primary" style={{ background: '#8B5CF6' }}>
              <Code size={16} />
              {loading ? 'Parsing AST...' : 'Run AST Code Comparison'}
            </button>
          </div>

          {codeResult && (
            <div className="card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <div>
                  <h3 style={{ fontSize: 18, fontWeight: 700 }}>Abstract Syntax Tree (AST) Clone Analysis</h3>
                  <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
                    Normalized variables, functions, and control flow before tokenization.
                  </p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 32, fontWeight: 800, color: codeResult.is_code_clone ? '#EF4444' : '#10B981' }}>
                    {codeResult.structural_similarity}%
                  </div>
                  <div style={{ fontSize: 12, fontWeight: 600, color: codeResult.is_code_clone ? '#EF4444' : '#10B981' }}>
                    {codeResult.is_code_clone ? '⚠️ Structural Code Clone Detected' : 'Unique Logic'}
                  </div>
                </div>
              </div>

              <div style={{ background: '#0F172A', padding: 12, borderRadius: 8, fontSize: 12, fontFamily: 'var(--font-mono)', color: '#38BDF8' }}>
                <div>// AST Normalized Structure (Identifiers mapped to VAR_X tokens):</div>
                <pre style={{ margin: '8px 0 0' }}>{codeResult.normalized_code_b}</pre>
              </div>
            </div>
          )}
        </div>
      )}

    </div>
  );
}

