import React, { useState } from 'react';
import { Layers, ShieldAlert, Cpu, Code, ArrowRight, Zap, CheckCircle } from 'lucide-react';

export default function DemoBench({ onSelectScenario }) {
  const [activeScenario, setActiveScenario] = useState(null);
  const [demoOutput, setDemoOutput] = useState(null);
  const [loading, setLoading] = useState(false);

  const scenarios = [
    {
      id: 'homoglyph',
      title: '🚨 Scenario 1: Adversarial Evasion Attack (Cyrillic Homoglyph)',
      badge: 'PRO TIER EVASION',
      badgeColor: '#EF4444',
      description: 'A student deliberately swapped English Latin letters (a, e, o) with Cyrillic lookalikes to fool naive plagiarism checkers.',
      execute: async () => {
        setLoading(true);
        setActiveScenario('homoglyph');
        try {
          const res = await fetch('http://localhost:8000/api/v1/compare/one-to-one', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              text_a: "This is a comp\u0430ny document with s\u0435cr\u0435t information and inv\u200Bisible spaces.",
              text_b: "This is a company document with secret information and invisible spaces."
            })
          });
          const data = await res.json();
          setDemoOutput({
            scenario: 'Homoglyph & Zero-Width Evasion Attack',
            data
          });
        } catch (e) {
          alert("Please start Python AI engine on port 8000!");
        } finally {
          setLoading(false);
        }
      }
    },
    {
      id: 'collusion',
      title: '👥 Scenario 2: Classroom Peer Collusion ($N \\times N$ Matrix)',
      badge: 'PRO CLASSROOM',
      badgeColor: '#10B981',
      description: 'Cross-checks 3 student submissions, identifies who copied from whom, and catches the original author (Patient Zero).',
      execute: async () => {
        setLoading(true);
        setActiveScenario('collusion');
        try {
          const res = await fetch('http://localhost:8000/api/v1/compare/many-to-many', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              documents: [
                { id: "s1", name: "Arjun Patel", timestamp: "2026-10-01T09:00:00", text: "Distributed consensus algorithms ensure node clusters reach agreement despite network partitions. Raft simplifies leader election." },
                { id: "s2", name: "Rohan Gupta", timestamp: "2026-10-01T11:30:00", text: "Distributed consensus algorithms ensure node clusters reach agreement despite network partitions. Raft simplifies leader election and logs." },
                { id: "s3", name: "Neha Deshmukh", timestamp: "2026-10-01T10:15:00", text: "Photosynthesis converts solar light into glucose and oxygen through chlorophyll pigments in thylakoid membranes." }
              ],
              collusion_threshold: 25.0
            })
          });
          const data = await res.json();
          setDemoOutput({
            scenario: 'Classroom Collusion Matrix',
            data
          });
        } catch (e) {
          alert("Please start Python AI engine on port 8000!");
        } finally {
          setLoading(false);
        }
      }
    },
    {
      id: 'code_ast',
      title: '💻 Scenario 3: Code Plagiarism with Renamed Variables (AST)',
      badge: 'MAX TIER CODE',
      badgeColor: '#8B5CF6',
      description: 'A student renamed every single variable, rearranged functions, and added comments in a Python script.',
      execute: async () => {
        setLoading(true);
        setActiveScenario('code_ast');
        try {
          const res = await fetch('http://localhost:8000/api/v1/detect/code-ast', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              code_a: `def compute_sum(arr):\n    res = 0\n    for x in arr:\n        res += x\n    return res`,
              code_b: `# Renamed identifiers\ndef calculate_total(elements):\n    total_accumulator = 0\n    for item in elements:\n        total_accumulator += item\n    return total_accumulator`,
              language: 'python'
            })
          });
          const data = await res.json();
          setDemoOutput({
            scenario: 'AST Code Plagiarism Clone Analysis',
            data
          });
        } catch (e) {
          alert("Please start Python AI engine on port 8000!");
        } finally {
          setLoading(false);
        }
      }
    },
    {
      id: 'ai_forensics',
      title: '🤖 Scenario 4: AI Writing Forensics (Perplexity & Burstiness)',
      badge: 'ULTRA TIER AI',
      badgeColor: '#F59E0B',
      description: 'Evaluates the uniform predictability and flat sentence rhythm of synthetic AI text vs human writing.',
      execute: async () => {
        setLoading(true);
        setActiveScenario('ai_forensics');
        try {
          const res = await fetch('http://localhost:8000/api/v1/detect/ai-forensics', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              text: "Artificial intelligence continues to evolve across modern sectors. Machine learning algorithms optimize supply chains and increase operational efficiency. Predictive analytics tools assist organizations in making informed business decisions. Automation reduces repetitive workflows while maximizing overall productivity."
            })
          });
          const data = await res.json();
          setDemoOutput({
            scenario: 'AI Writing Forensics',
            data
          });
        } catch (e) {
          alert("Please start Python AI engine on port 8000!");
        } finally {
          setLoading(false);
        }
      }
    }
  ];

  return (
    <div style={{ maxWidth: 1400, margin: '24px auto', padding: '0 24px' }}>
      <div style={{ marginBottom: 20 }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, margin: 0 }}>Presentation Demo Bench</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>
          Pre-configured live scenarios ready for testing in front of your professor or reviewers.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 16, marginBottom: 24 }}>
        {scenarios.map(s => (
          <div
            key={s.id}
            className="card"
            style={{
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              border: activeScenario === s.id ? '2px solid #3B82F6' : '1px solid var(--border-subtle)'
            }}
          >
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                <span className="badge" style={{ background: `${s.badgeColor}22`, color: s.badgeColor, border: `1px solid ${s.badgeColor}55` }}>
                  {s.badge}
                </span>
              </div>
              <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 8 }}>{s.title}</h3>
              <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 16 }}>{s.description}</p>
            </div>

            <button
              onClick={s.execute}
              disabled={loading}
              className="btn btn-primary"
              style={{ width: '100%', justifyContent: 'center' }}
            >
              <Zap size={15} />
              {loading && activeScenario === s.id ? 'Running...' : 'Execute Live Demo'}
            </button>
          </div>
        ))}
      </div>

      {/* Live Demo Output Card */}
      {demoOutput && (
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14, borderBottom: '1px solid var(--border-subtle)', paddingBottom: 10 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <CheckCircle size={18} color="#10B981" />
              <h3 style={{ fontSize: 16, fontWeight: 700 }}>Live Output: {demoOutput.scenario}</h3>
            </div>
          </div>

          <pre style={{
            background: '#0F172A',
            padding: 16,
            borderRadius: 8,
            overflowX: 'auto',
            fontSize: 13,
            color: '#38BDF8',
            fontFamily: 'var(--font-mono)'
          }}>
            {JSON.stringify(demoOutput.data, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}

