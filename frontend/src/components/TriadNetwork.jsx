import React, { useState } from 'react';
import { Layers, Cpu, Server, Database, ArrowRight, ShieldCheck, Zap } from 'lucide-react';

export default function TriadNetwork({ serverStatus }) {
  const [activeNode, setActiveNode] = useState('spring');

  const nodes = [
    {
      id: 'react',
      name: 'Client Presentation Layer',
      tech: 'React 19 + HTML5 Canvas',
      port: ':5173',
      color: '#38bdf8',
      role: 'Dala Dark-Stage Interface',
      desc: 'Renders the void canvas, interactive chromatic particle constellation, side-by-side diffing, and submission telemetry without page reload.',
      tags: ['HTML5 Canvas', 'Inter Typography', 'Vite Dev', 'Async Streaming']
    },
    {
      id: 'spring',
      name: 'Classroom & Rubric Gateway',
      tech: 'Spring Boot 3 + H2 JPA',
      port: ':8080',
      color: 'var(--color-electric-iris)',
      role: 'Academic Orchestrator',
      desc: 'Controls cohort assignments, classroom databases, rule-based rubric deductions, and acts as the secure microservice proxy.',
      tags: ['REST Controller', 'Rubric Deduction Engine', 'Spring Data JPA', 'H2 In-Memory DB']
    },
    {
      id: 'python',
      name: 'Distributed AI Forensics Brain',
      tech: 'FastAPI + Python 3.12',
      port: ':8000',
      color: 'var(--color-saffron-spark)',
      role: 'Algorithmic Compute Core',
      desc: 'High-throughput Winnowing n-gram fingerprinting, Cyrillic evasion cleaning, AST tree normalization, and perplexity/burstiness calculation.',
      tags: ['Winnowing', 'Cyrillic Sanitizer', 'AST Clone Engine', 'N-gram Hash']
    }
  ];

  const current = nodes.find(n => n.id === activeNode);

  return (
    <section style={{
      padding: '80px 24px',
      background: 'var(--color-void)',
      borderTop: '1px solid rgba(255, 255, 255, 0.08)',
      position: 'relative'
    }}>
      <div style={{ maxWidth: 'var(--page-max-width)', margin: '0 auto' }}>
        
        {/* Section Header */}
        <div style={{ marginBottom: 48, maxWidth: 640 }}>
          <span className="eyebrow-accent">
            Triad Micro-Architecture
          </span>
          <h2 className="heading-md" style={{ marginBottom: 16 }}>
            Three engines. One coherent loop.
          </h2>
          <p className="body-light">
            Knowledge is verified through continuous inter-service exchange. The React interface orchestrates the classroom ledger, whilst Spring Boot delegates intensive vector and syntactic passes to Python.
          </p>
        </div>

        {/* Visual Architecture Layout */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: 24,
          alignItems: 'stretch'
        }}>
          {nodes.map(node => {
            const isSelected = activeNode === node.id;
            return (
              <div
                key={node.id}
                onClick={() => setActiveNode(node.id)}
                style={{
                  background: isSelected ? 'rgba(255, 255, 255, 0.04)' : 'transparent',
                  border: isSelected ? `1px solid ${node.color}` : '1px solid rgba(255, 255, 255, 0.08)',
                  borderRadius: 24,
                  padding: 32,
                  cursor: 'pointer',
                  transition: 'all 0.25s ease',
                  position: 'relative',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between'
                }}
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                    <span style={{
                      fontSize: 12,
                      fontWeight: 600,
                      textTransform: 'uppercase',
                      letterSpacing: '0.025em',
                      color: node.color
                    }}>
                      {node.role}
                    </span>
                    <span style={{
                      fontSize: 12,
                      fontFamily: 'var(--font-mono)',
                      color: 'var(--color-ash-gray)',
                      background: 'rgba(255, 255, 255, 0.05)',
                      padding: '2px 8px',
                      borderRadius: 12
                    }}>
                      {node.port}
                    </span>
                  </div>

                  <h3 style={{ fontSize: 20, fontWeight: 400, color: '#ffffff', marginBottom: 6 }}>
                    {node.name}
                  </h3>
                  <div style={{ fontSize: 13, color: 'var(--color-silver-mist)', marginBottom: 16 }}>
                    {node.tech}
                  </div>

                  <p style={{ fontSize: 14, fontWeight: 200, color: 'var(--color-silver-mist)', lineHeight: 1.6, marginBottom: 20 }}>
                    {node.desc}
                  </p>
                </div>

                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, paddingTop: 16, borderTop: '1px solid rgba(255, 255, 255, 0.05)' }}>
                  {node.tags.map((t, idx) => (
                    <span key={idx} style={{
                      fontSize: 11,
                      padding: '3px 9px',
                      borderRadius: 12,
                      background: 'rgba(255, 255, 255, 0.04)',
                      color: 'var(--color-silver-mist)',
                      border: '1px solid rgba(255, 255, 255, 0.06)'
                    }}>
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* Live Active Protocol Bar */}
        {current && (
          <div style={{
            marginTop: 32,
            padding: '20px 28px',
            background: 'rgba(255, 255, 255, 0.02)',
            borderRadius: 20,
            border: '1px solid rgba(255, 255, 255, 0.06)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 16
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                background: current.color,
                boxShadow: `0 0 10px ${current.color}`
              }} />
              <span style={{ fontSize: 13, color: '#ffffff', fontWeight: 400 }}>
                Protocol Focus: <strong style={{ fontWeight: 600 }}>{current.name}</strong> ({current.tech})
              </span>
            </div>

            <div style={{ fontSize: 12, color: 'var(--color-ash-gray)', fontFamily: 'var(--font-mono)' }}>
              HEALTH: {serverStatus?.online ? 'UP & RESPONDING' : 'READY TO CONNECT'}
            </div>
          </div>
        )}

      </div>
    </section>
  );
}
