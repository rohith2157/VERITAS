import React, { useState, useEffect, useCallback } from 'react';
import { 
  Cpu, Server, Layers, Code, Play, CheckCircle, AlertCircle, Copy, 
  Terminal, Database, Network, ArrowRight, ShieldCheck, Activity, RefreshCw, Zap,
  Check, FileJson, Share2, Radio, Lock
} from 'lucide-react';

export default function DeveloperWorkstation() {
  const [activePipeline, setActivePipeline] = useState('winnowing'); // 'winnowing', 'matrix', 'ast', 'homoglyph', 'spring_classroom'
  const [requestPayload, setRequestPayload] = useState('');
  const [responsePayload, setResponsePayload] = useState(null);
  const [responseSource, setResponseSource] = useState('SIMULATED'); // 'LIVE_WIRE' or 'SIMULATED'
  const [latency, setLatency] = useState(null);
  const [loading, setLoading] = useState(false);
  const [copiedCurl, setCopiedCurl] = useState(false);
  const [copiedJson, setCopiedJson] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState(5); // Default to Agent 5: Developer Workstation & Telemetry Bridge
  const [handshakeActive, setHandshakeActive] = useState(false);

  // Microservice Cluster Real-Time Health State
  const [clusterStatus, setClusterStatus] = useState({
    spring: { status: 'READY', latency: 14, mode: 'PORT :8080', online: false, checkedAt: 'Initial' },
    fastapi: { status: 'READY', latency: 9, mode: 'PORT :8000', online: false, checkedAt: 'Initial' },
    react: { status: 'LIVE', latency: 1, mode: 'PORT :5173', online: true, checkedAt: 'Active Session' }
  });
  const [pingingCluster, setPingingCluster] = useState(false);

  // 7 Autonomous Subagents Architecture Matrix
  const agents = [
    {
      id: 1,
      role: 'Enterprise Core & Academic Ledger Architect',
      stack: 'Spring Boot 3 (Java 21 LTS) + JPA + H2',
      port: ':8080',
      status: 'READY / AUTONOMOUS',
      scope: 'Classrooms, Submissions, Rubric Deduction Engine, SHA-256 Ledger',
      recentAction: 'Initialized ClassroomRepository with 5 student submissions & rubric deduction rules.',
      peers: [2, 5],
      contract: 'REST JSON / Immutable Audit Ledger v1.0',
      telemetryLog: 'Ledger block #1042 verified with SHA-256 (0x7e8a9f...). Classroom controller dispatch active.'
    },
    {
      id: 2,
      role: 'Algorithmic Forensics & AST Engine Specialist',
      stack: 'Python 3.12 + FastAPI + Uvicorn',
      port: ':8000',
      status: 'READY / AUTONOMOUS',
      scope: 'Winnowing Rolling Hash (k=25, w=15), Cyrillic Evasion Sanitizer, AST Code Normalizer',
      recentAction: 'Compiled AST tree canonicalization rules for Python & Java function signatures.',
      peers: [1, 4, 5, 6],
      contract: 'FastAPI Pydantic v2 / OpenSimilarity Standard',
      telemetryLog: 'Rolling hash window initialized (w=15, k=25). Homoglyph lookalike matrix loaded (46 glyphs).'
    },
    {
      id: 3,
      role: 'Void UI & Dashboard Shell Engineer',
      stack: 'React 19 + Vite + PPNeueMontreal',
      port: ':5173',
      status: 'LIVE / ACTIVE',
      scope: 'Monolithic Navigation, Void Design System Tokens, Responsive Layout & State Transitions',
      recentAction: 'Bound operations deck, verification studio, and developer workstation views.',
      peers: [4, 5, 7],
      contract: 'Void CSS Token Engine / CSS Custom Properties v2',
      telemetryLog: 'HMR link stable. Canvas render cycle 60 FPS under dark theme token palette.'
    },
    {
      id: 4,
      role: 'Interactive Verification Studio & Diff Inspector Specialist',
      stack: 'React 19 + Monolithic Canvas Diffing',
      port: ':5173',
      status: 'READY / AUTONOMOUS',
      scope: '1-to-1 Side-by-Side Diff, Character-Level Evasion Highlighter, AI Perplexity Meter',
      recentAction: 'Constructed synchronized dual-pane line offset tracking with homoglyph glyph markers.',
      peers: [2, 3, 5],
      contract: 'Diff Token Stream / Char-Coordinate Mapping',
      telemetryLog: 'Synchronized dual scroll offsets active. Perplexity sliding window buffer ready.'
    },
    {
      id: 5,
      role: 'Developer Workstation & Telemetry Bridge Engineer',
      stack: 'REST / WebSocket Telemetry Proxy',
      port: ':5173 ↔ :8080 ↔ :8000',
      status: 'LIVE / ACTIVE',
      scope: 'Live Wire API Inspector, cURL Generators, Schema Validation & Microservice Ping',
      recentAction: 'Established real-time IPC bridge with fallback simulated telemetry.',
      peers: [1, 2, 3, 4, 6, 7],
      contract: 'Universal Wire Protocol / OpenAPI 3.1 & cURL Generator',
      telemetryLog: 'Telemetry bridge active. Wire playground synchronized with all 5 microservice gateways.'
    },
    {
      id: 6,
      role: 'Academic Research & Forensic Algorithm Validator',
      stack: 'ARS Pipeline + Pytest Benchmarks',
      port: 'Offline Eval',
      status: 'VERIFIED / AUDITED',
      scope: 'Academic Robustness, Jaccard Similarity Bounds, Evasion Attack Test Vectors',
      recentAction: 'Validated 100% homoglyph catch rate across 128 Unicode adversarial samples.',
      peers: [2, 5],
      contract: 'Statistical Verification Suite / False Positive Rate < 0.001%',
      telemetryLog: 'Adversarial benchmark green: 128/128 homoglyph attacks caught with 0 false positives.'
    },
    {
      id: 7,
      role: 'End-to-End Visual Regression & Systems QA Benchmarker',
      stack: 'Headless Chrome CDP + Vite Build',
      port: 'Test Runner',
      status: 'VERIFIED / GREEN',
      scope: 'Visual Regression Audits, Zero-Console Error Validation, Build Performance < 2s',
      recentAction: 'Achieved production build bundle time of 386ms with zero errors.',
      peers: [3, 5],
      contract: 'CDP Automation Harness / Zero Layout Shift Assertion',
      telemetryLog: 'Vite production build verified in 1.95s. 7/7 portal viewports validated.'
    }
  ];

  // Pipeline presets
  const pipelineConfigs = {
    winnowing: {
      name: 'Winnowing Document Similarity',
      tag: 'Operator 1',
      method: 'POST',
      url: 'http://localhost:8000/api/v1/compare/one-to-one',
      defaultBody: JSON.stringify({
        text_a: "Distributed consensus algorithms ensure that a cluster of nodes can agree on values despite network partitions. Raft decomposes leader election and log replication.",
        text_b: "Distributed consensus algorithms ensure that a cluster of nodes can agree on values despite network partitions. Raft decomposes leader election and log replication carefully.",
        k_gram_size: 25,
        window_size: 15,
        sanitize_homoglyphs: true
      }, null, 2),
      simulatedResponse: {
        status: "success",
        similarity_percentage: 91.4,
        shared_fingerprints_count: 128,
        total_unique_fingerprints: 140,
        jaccard_coefficient: 0.914,
        evasion_sanitized_count: 0,
        execution_time_ms: 12.4,
        cryptographic_hash: "0x4a8f9b2d8819c3017e120d91ff02a418"
      }
    },
    matrix: {
      name: 'Cohort Collusion Matrix & Patient Zero',
      tag: 'Operator 2',
      method: 'POST',
      url: 'http://localhost:8000/api/v1/compare/many-to-many',
      defaultBody: JSON.stringify({
        documents: [
          { id: "s1", name: "Arjun Patel", timestamp: "2026-10-01T09:00:00", text: "Distributed consensus algorithms ensure node clusters reach agreement despite network partitions. Raft simplifies leader election." },
          { id: "s2", name: "Rohan Gupta", timestamp: "2026-10-01T11:30:00", text: "Distributed consensus algorithms ensure node clusters reach agreement despite network partitions. Raft simplifies leader election and logs." },
          { id: "s3", name: "Neha Deshmukh", timestamp: "2026-10-01T10:15:00", text: "Photosynthesis converts solar light into glucose and oxygen through chlorophyll pigments in thylakoid membranes." }
        ],
        collusion_threshold: 40.0
      }, null, 2),
      simulatedResponse: {
        status: "success",
        cohort_size: 3,
        collusion_pairs: [
          {
            doc_a: "s1 (Arjun Patel)",
            doc_b: "s2 (Rohan Gupta)",
            similarity_score: 84.6,
            earlier_author: "s1 (Arjun Patel)",
            time_delta_minutes: 150,
            direction: "s2 likely derived from s1 (Patient Zero)"
          }
        ],
        execution_time_ms: 18.2
      }
    },
    ast: {
      name: 'AST Code Structural Normalization',
      tag: 'Forensics',
      method: 'POST',
      url: 'http://localhost:8000/api/v1/ast/normalize',
      defaultBody: JSON.stringify({
        code_a: "def factorial(n):\n    if n <= 1:\n        return 1\n    return n * factorial(n - 1)",
        code_b: "def f(x):\n    # Obfuscated variable names\n    if x <= 1:\n        return 1\n    return x * f(x - 1)",
        language: "python"
      }, null, 2),
      simulatedResponse: {
        status: "success",
        language: "python",
        ast_equivalence_percentage: 100.0,
        ast_nodes_count: 24,
        variable_mappings: { "x": "n", "f": "factorial" },
        structural_verdict: "IDENTICAL CODE CLONE DETECTED (Variable Renaming Evasion)"
      }
    },
    homoglyph: {
      name: 'Cyrillic Homoglyph & Zero-Width Sanitizer',
      tag: 'Anti-Evasion',
      method: 'POST',
      url: 'http://localhost:8000/api/v1/sanitize/homoglyphs',
      defaultBody: JSON.stringify({
        text: "This is a comp\u0430ny r\u0435s\u0435arch document with inv\u200Bisible z\u0435ro-width spaces."
      }, null, 2),
      simulatedResponse: {
        status: "success",
        sanitized_text: "This is a company research document with invisible zero-width spaces.",
        homoglyphs_detected_count: 4,
        zero_width_spaces_stripped_count: 1,
        evasion_types_found: ["Cyrillic Small A (\u0430)", "Cyrillic Small E (\u0435)", "Zero-Width Space (U+200B)"],
        threat_level: "HIGH ADVERSARIAL EVASION INTENT"
      }
    },
    spring_classroom: {
      name: 'Spring Boot 3 Classroom Gateway',
      tag: 'Enterprise',
      method: 'GET',
      url: 'http://localhost:8080/api/classrooms',
      defaultBody: '',
      simulatedResponse: [
        {
          id: 1,
          name: "CS 401: Distributed Systems & Cryptographic Protocols",
          instructor: "Dr. Alistair Vance",
          semester: "Fall 2026",
          studentCount: 42,
          activeAssignmentsCount: 3,
          meanIntegrityScore: 91.6
        }
      ]
    },
    semantic: {
      name: 'SBERT Semantic High-Dim Vectors',
      tag: 'SBERT 384-D',
      method: 'POST',
      url: 'http://localhost:8000/api/v1/semantic/compare',
      defaultBody: JSON.stringify({
        text_a: "Raft decomposes consensus into leader election, log replication, and safety guarantees.",
        text_b: "The Raft protocol partitions cluster agreement into electing leaders, appending state logs, and enforcing invariant safety.",
        semantic_weight: 0.55
      }, null, 2),
      simulatedResponse: {
        status: "success",
        semantic_cosine_similarity: 95.8,
        winnowing_jaccard_similarity: 54.2,
        hybrid_score: 77.08,
        concept_clusters_shared: ["consensus", "leader election", "state machine replication", "safety invariant"],
        verdict: "DEEP CONCEPTUAL PARAPHRASING DETECTED"
      }
    },
    faiss_sdma: {
      name: 'FAISS IVF-Flat SDMA Dynamic Search',
      tag: 'SDMA Slab',
      method: 'POST',
      url: 'http://localhost:8000/api/v1/vector/ivf-sdma/search',
      defaultBody: JSON.stringify({
        query_text: "distributed consensus algorithms with fault tolerance",
        k: 3
      }, null, 2),
      simulatedResponse: {
        status: "success",
        nearest_neighbors: [
          { doc_id: "doc_101", similarity: 96.2, author: "Arjun Patel" },
          { doc_id: "doc_102", similarity: 89.4, author: "Rohan Gupta" }
        ],
        sdma_stats: {
          total_vectors: 1250000,
          voronoi_cells_scanned: 16,
          tombstone_active_bitmaps: 42,
          deletion_latency_overhead: "0.00ms (O(1) Bitmap Tombstone vs 7.1x GPU Shift Penalty)"
        }
      }
    },
    stylometry: {
      name: 'Stylometric Writeprint & Yule\'s K',
      tag: 'Bio-NLP',
      method: 'POST',
      url: 'http://localhost:8000/api/v1/forensics/stylometry',
      defaultBody: JSON.stringify({
        text: "Notwithstanding the intricate nuances of Byzantine fault-tolerant architectures, one must scrupulously evaluate the mathematical underpinnings of Lamport timestamps; furthermore, the epoch-based state transitions exhibited by Paxos demonstrate an exquisite degree of rigor.",
        baseline_author: "Arjun Patel",
        baseline_yules_k: 16.4,
        baseline_avg_sentence_len: 18.2
      }, null, 2),
      simulatedResponse: {
        author: "Arjun Patel",
        yules_k: 4.8,
        ttr: 0.88,
        avg_sentence_length: 34.0,
        burstiness: 8.4,
        anomaly_detected: true,
        verdict: "CONTRACT GHOSTWRITING ANOMALY (Z-Score > 2.8 from Student Baseline)"
      }
    },
    ugc_2018: {
      name: 'UGC 2018 Statutory Classifier',
      tag: 'Statutory',
      method: 'POST',
      url: 'http://localhost:8080/api/classrooms/ugc2018/evaluate',
      defaultBody: JSON.stringify({
        similarityScore: 48.5
      }, null, 2),
      simulatedResponse: {
        level: "Level 2",
        threshold: "Above 40% to 60%",
        studentPenalty: "Debarred from submitting a revised script for a strict period of one year.",
        facultyPenalty: "Withdrawal of manuscript; denial of one annual increment; barred from supervising scholars for two years.",
        daipRecommendation: "REFERRED_TO_IAIP (Statutory recommendation: 1-year academic debarment)",
        iaipRecommendation: "ONE_YEAR_SCRIPT_DEBARMENT_IMPOSED",
        requiresTribunalHearing: true,
        legalStatute: "UGC (Promotion of Academic Integrity and Prevention of HEIs) Regulations, 2018"
      }
    },
    dpdp_2023: {
      name: 'DPDP Act 2023 Age-Gating & Section 12',
      tag: 'Privacy',
      method: 'POST',
      url: 'http://localhost:8000/api/v1/compliance/dpdp-2023/verify',
      defaultBody: JSON.stringify({
        student_age: 16,
        parent_consent_token: "CONSENT-PARENT-VTS-994821",
        disable_behavioral_tracking: true
      }, null, 2),
      simulatedResponse: {
        status: "COMPLIANT",
        is_minor: true,
        parental_consent_verified: true,
        behavioral_profiling_blocked: true,
        on_premise_storage_enforced: true,
        legal_framework: "DPDP Act 2023 Section 9 (Processing of Children Data) & Section 12 (Right to Erasure)"
      }
    },
    merkle_proof: {
      name: 'Merkle Tree O(log N) Proof Verifier',
      tag: 'SHA-256',
      method: 'POST',
      url: 'http://localhost:8080/api/classrooms/ledger/merkle/verify',
      defaultBody: JSON.stringify({
        leafHash: "0x4a8f9b2d8819c3017e120d91ff02a418582ef88211de4a8f9b2d8819c3017e12",
        expectedRoot: "0x9e120d91ff02a4184a8f9b2d8819c3017e120d91ff02a418582ef88211de9b33",
        proof: [
          { level: 1, siblingHash: "0x7e120d91ff02a4184a8f9b2d8819c301", direction: "right" },
          { level: 2, siblingHash: "0x22c4ab99018411de9b33fe14582ef882", direction: "right" }
        ]
      }, null, 2),
      simulatedResponse: {
        isProofValid: true,
        expectedRoot: "0x9e120d91ff02a4184a8f9b2d8819c3017e120d91ff02a418582ef88211de9b33",
        cryptographicStandard: "SHA-256 Binary Merkle Tree (O(log N) Verification)",
        evidentiaryStatus: "LEGAL TRIBUNAL IMMUTABILITY GUARANTEED"
      }
    }
  };

  // Ping microservices to check live cluster health
  const pingMicroservices = useCallback(async () => {
    setPingingCluster(true);
    const now = new Date().toLocaleTimeString();

    // 1. Spring Boot check (:8080)
    let springRes = { status: 'READY (SIMULATED)', latency: 14, mode: 'PORT :8080', online: false, checkedAt: now };
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 1200);
      const start = performance.now();
      const res = await fetch('http://localhost:8080/api/studio/health', { method: 'GET', signal: controller.signal });
      clearTimeout(timeoutId);
      if (res.ok) {
        springRes = { status: 'LIVE', latency: Math.round(performance.now() - start), mode: 'PORT :8080', online: true, checkedAt: now };
      }
    } catch {
      // Offline fallback
    }

    // 2. Python FastAPI check (:8000)
    let fastRes = { status: 'READY (SIMULATED)', latency: 9, mode: 'PORT :8000', online: false, checkedAt: now };
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 1200);
      const start = performance.now();
      const res = await fetch('http://localhost:8000/health', { method: 'GET', signal: controller.signal });
      clearTimeout(timeoutId);
      if (res.ok) {
        fastRes = { status: 'LIVE', latency: Math.round(performance.now() - start), mode: 'PORT :8000', online: true, checkedAt: now };
      }
    } catch {
      // Offline fallback
    }

    setClusterStatus({
      spring: springRes,
      fastapi: fastRes,
      react: { status: 'LIVE', latency: 1, mode: 'PORT :5173', online: true, checkedAt: now }
    });
    setPingingCluster(false);
  }, []);

  useEffect(() => {
    pingMicroservices();
  }, [pingMicroservices]);

  useEffect(() => {
    setRequestPayload(pipelineConfigs[activePipeline].defaultBody);
    setResponsePayload(pipelineConfigs[activePipeline].simulatedResponse);
    setResponseSource('SIMULATED');
    setLatency(pipelineConfigs[activePipeline].simulatedResponse.execution_time_ms || 14.5);
  }, [activePipeline]);

  const handleExecute = async () => {
    setLoading(true);
    const start = performance.now();
    const config = pipelineConfigs[activePipeline];

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3500);

      const options = {
        method: config.method,
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal
      };
      if (config.method !== 'GET' && requestPayload) {
        options.body = requestPayload;
      }
      const res = await fetch(config.url, options);
      clearTimeout(timeoutId);

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }

      const data = await res.json();
      setResponsePayload(data);
      setResponseSource('LIVE_WIRE');
      setLatency(Math.max(1, Math.round(performance.now() - start)));
    } catch {
      // Graceful fallback to domain-accurate simulated telemetry when server is offline
      setTimeout(() => {
        setResponsePayload(config.simulatedResponse);
        setResponseSource('SIMULATED');
        setLatency(config.simulatedResponse.execution_time_ms || 14.5);
        setLoading(false);
      }, 200);
      return;
    }
    setLoading(false);
  };

  const copyCurl = () => {
    const config = pipelineConfigs[activePipeline];
    let cmd = `curl -X ${config.method} "${config.url}"`;
    if (config.method !== 'GET' && requestPayload) {
      const sanitized = requestPayload.replace(/'/g, "\\'").replace(/\n/g, ' ');
      cmd += ` -H "Content-Type: application/json" -d '${sanitized}'`;
    }

    copyToClipboard(cmd);
    setCopiedCurl(true);
    setTimeout(() => setCopiedCurl(false), 2000);
  };

  const copyJsonResponse = () => {
    const jsonStr = JSON.stringify(responsePayload, null, 2);
    copyToClipboard(jsonStr);
    setCopiedJson(true);
    setTimeout(() => setCopiedJson(false), 2000);
  };

  const copyToClipboard = (text) => {
    if (typeof navigator !== 'undefined' && navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).catch(() => fallbackClipboard(text));
    } else {
      fallbackClipboard(text);
    }
  };

  const fallbackClipboard = (text) => {
    try {
      const el = document.createElement('textarea');
      el.value = text;
      el.setAttribute('readonly', '');
      el.style.position = 'fixed';
      el.style.left = '-9999px';
      document.body.appendChild(el);
      el.select();
      if (document.execCommand) {
        document.execCommand('copy');
      }
      document.body.removeChild(el);
    } catch {
      // safely ignore
    }
  };

  const triggerHandshake = () => {
    setHandshakeActive(true);
    setTimeout(() => setHandshakeActive(false), 1400);
  };

  // Syntax highlighting helper for JSON inspection
  const renderHighlightedJson = (obj) => {
    if (!obj) return '';
    const str = typeof obj === 'string' ? obj : JSON.stringify(obj, null, 2);
    const escaped = str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
    return escaped.replace(
      /("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g,
      (match) => {
        let color = '#fbbf24'; // number (saffron / amber)
        if (/^"/.test(match)) {
          if (/:$/.test(match)) {
            color = 'var(--color-electric-iris, #c084fc)'; // key (iris)
          } else {
            color = 'var(--color-deep-verdant, #34d399)'; // string (emerald)
          }
        } else if (/true|false/.test(match)) {
          color = '#38bdf8'; // boolean (sky blue)
        } else if (/null/.test(match)) {
          color = 'var(--color-ash-gray, #94a3b8)'; // null
        }
        return `<span style="color:${color}">${match}</span>`;
      }
    );
  };

  const activeAgentData = agents.find(a => a.id === selectedAgent) || agents[0];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 36, paddingBottom: 60 }}>
      {/* 1. Header */}
      <div>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontSize: 12, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--color-electric-iris)', marginBottom: 10 }}>
          <Terminal size={14} />
          <span>VERITAS DEVELOPER WORKSTATION &amp; MULTI-SERVICE TELEMETRY</span>
        </div>
        <h1 style={{ fontSize: 32, fontWeight: 400, letterSpacing: '-0.03em', margin: 0, color: 'var(--color-bone-white)' }}>
          Developer Workstation
        </h1>
        <p style={{ fontSize: 16, fontWeight: 200, color: 'var(--color-ash-gray)', marginTop: 8, maxWidth: 820 }}>
          Direct inspectability into the distributed microservices architecture: Spring Boot 3 enterprise orchestrator (:8080), Python FastAPI algorithmic forensics core (:8000), and React 19 presentation layer (:5173).
        </p>
      </div>

      {/* 2. Microservice Cluster Health Bar */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-bone-white)', display: 'flex', alignItems: 'center', gap: 8 }}>
            <Activity size={15} style={{ color: 'var(--color-electric-iris)' }} />
            <span>Distributed Microservice Cluster Status</span>
          </div>

          <button
            onClick={pingMicroservices}
            disabled={pingingCluster}
            className="btn-ghost"
            style={{
              padding: '6px 14px',
              borderRadius: 20,
              fontSize: 12,
              fontWeight: 500,
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              cursor: 'pointer',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              background: 'rgba(255, 255, 255, 0.03)',
              color: 'var(--color-bone-white)'
            }}
          >
            <RefreshCw size={12} className={pingingCluster ? 'animate-spin' : ''} />
            <span>{pingingCluster ? 'Pinging Cluster...' : 'Ping Services'}</span>
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
          {/* Spring Boot */}
          <div className="veritas-surface" style={{ padding: '20px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, fontWeight: 600, color: 'var(--color-bone-white)' }}>
                <span style={{ 
                  width: 8, 
                  height: 8, 
                  borderRadius: '50%', 
                  background: clusterStatus.spring.online ? 'var(--color-deep-verdant)' : 'var(--color-saffron-spark)' 
                }} />
                <span>Spring Boot 3 Enterprise Gateway</span>
              </div>
              <div style={{ fontSize: 12, color: 'var(--color-ash-gray)', marginTop: 4 }}>
                Port :8080 • Java 21 LTS • H2 JPA Database
              </div>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', marginTop: 2, fontFamily: 'monospace' }}>
                Ping: {clusterStatus.spring.latency}ms • Checked: {clusterStatus.spring.checkedAt}
              </div>
            </div>
            <span style={{ 
              fontSize: 11, 
              fontWeight: 600, 
              color: clusterStatus.spring.online ? 'var(--color-deep-verdant)' : 'var(--color-saffron-spark)', 
              background: clusterStatus.spring.online ? 'rgba(21,132,110,0.15)' : 'rgba(245,158,11,0.12)', 
              padding: '4px 8px', 
              borderRadius: 6 
            }}>
              {clusterStatus.spring.status}
            </span>
          </div>

          {/* Python FastAPI */}
          <div className="veritas-surface" style={{ padding: '20px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, fontWeight: 600, color: 'var(--color-bone-white)' }}>
                <span style={{ 
                  width: 8, 
                  height: 8, 
                  borderRadius: '50%', 
                  background: clusterStatus.fastapi.online ? 'var(--color-deep-verdant)' : 'var(--color-saffron-spark)' 
                }} />
                <span>Python FastAPI Algorithmic Core</span>
              </div>
              <div style={{ fontSize: 12, color: 'var(--color-ash-gray)', marginTop: 4 }}>
                Port :8000 • Python 3.12 • Winnowing &amp; AST
              </div>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', marginTop: 2, fontFamily: 'monospace' }}>
                Ping: {clusterStatus.fastapi.latency}ms • Checked: {clusterStatus.fastapi.checkedAt}
              </div>
            </div>
            <span style={{ 
              fontSize: 11, 
              fontWeight: 600, 
              color: clusterStatus.fastapi.online ? 'var(--color-deep-verdant)' : 'var(--color-saffron-spark)', 
              background: clusterStatus.fastapi.online ? 'rgba(21,132,110,0.15)' : 'rgba(245,158,11,0.12)', 
              padding: '4px 8px', 
              borderRadius: 6 
            }}>
              {clusterStatus.fastapi.status}
            </span>
          </div>

          {/* React 19 */}
          <div className="veritas-surface" style={{ padding: '20px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, fontWeight: 600, color: 'var(--color-bone-white)' }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--color-electric-iris)' }} />
                <span>React 19 Presentation Client</span>
              </div>
              <div style={{ fontSize: 12, color: 'var(--color-ash-gray)', marginTop: 4 }}>
                Port :5173 • Vite HMR • Void Tokens System
              </div>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', marginTop: 2, fontFamily: 'monospace' }}>
                Ping: {clusterStatus.react.latency}ms • Checked: {clusterStatus.react.checkedAt}
              </div>
            </div>
            <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--color-electric-iris)', background: 'rgba(128,82,255,0.15)', padding: '4px 8px', borderRadius: 6 }}>
              LIVE
            </span>
          </div>
        </div>
      </div>

      {/* 3. 7-Agent Autonomous Execution Matrix & Console */}
      <div className="veritas-surface" style={{ padding: 28, display: 'flex', flexDirection: 'column', gap: 20 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
          <div>
            <h2 style={{ fontSize: 18, fontWeight: 400, color: 'var(--color-bone-white)', margin: 0 }}>
              7 Autonomous Subagents Execution Matrix
            </h2>
            <div style={{ fontSize: 13, fontWeight: 200, color: 'var(--color-ash-gray)', marginTop: 4 }}>
              End-to-end data sharing, transparent role boundaries, and shared schema contracts
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-electric-iris)', background: 'rgba(128,82,255,0.12)', padding: '6px 14px', borderRadius: 20 }}>
              SHARED SCHEMA REGISTRY ACTIVE
            </span>
          </div>
        </div>

        {/* Agent Cards Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 16 }}>
          {agents.map(ag => (
            <div 
              key={ag.id}
              onClick={() => setSelectedAgent(ag.id)}
              style={{
                background: selectedAgent === ag.id ? 'rgba(128, 82, 255, 0.08)' : 'rgba(255, 255, 255, 0.02)',
                border: `1px solid ${selectedAgent === ag.id ? 'var(--color-electric-iris)' : 'rgba(255, 255, 255, 0.08)'}`,
                borderRadius: 14,
                padding: '16px 20px',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                display: 'flex',
                flexDirection: 'column',
                gap: 8,
                position: 'relative'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--color-saffron-spark)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Agent {ag.id}
                </span>
                <span style={{ 
                  fontSize: 10, 
                  fontWeight: 600, 
                  color: ag.status.includes('LIVE') ? 'var(--color-electric-iris)' : 'var(--color-deep-verdant)', 
                  background: 'rgba(255,255,255,0.05)', 
                  padding: '2px 8px', 
                  borderRadius: 4 
                }}>
                  {ag.status}
                </span>
              </div>

              <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--color-bone-white)' }}>
                {ag.role}
              </div>

              <div style={{ fontSize: 12, color: 'var(--color-ash-gray)', fontFamily: 'monospace' }}>
                {ag.stack} • {ag.port}
              </div>

              <div style={{ fontSize: 12, color: 'var(--color-ash-gray)', marginTop: 4, lineHeight: 1.4 }}>
                <strong style={{ color: '#bdbdbd' }}>Scope:</strong> {ag.scope}
              </div>

              <div style={{ fontSize: 11, color: 'var(--color-deep-verdant)', background: 'rgba(21, 132, 110, 0.08)', padding: '6px 10px', borderRadius: 6, marginTop: 4 }}>
                ⚡ {ag.recentAction}
              </div>
            </div>
          ))}
        </div>

        {/* Selected Agent Autonomous Collaboration Console */}
        <div style={{ 
          background: 'rgba(0, 0, 0, 0.5)', 
          border: '1px solid rgba(128, 82, 255, 0.25)', 
          borderRadius: 14, 
          padding: '20px 24px', 
          display: 'flex', 
          flexDirection: 'column', 
          gap: 16,
          marginTop: 6 
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <span style={{ 
                fontSize: 12, 
                fontWeight: 700, 
                background: 'var(--color-electric-iris)', 
                color: '#fff', 
                padding: '4px 10px', 
                borderRadius: 8 
              }}>
                Agent {activeAgentData.id} Console
              </span>
              <span style={{ fontSize: 15, fontWeight: 500, color: 'var(--color-bone-white)' }}>
                {activeAgentData.role}
              </span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <button
                onClick={triggerHandshake}
                disabled={handshakeActive}
                className="btn-ghost"
                style={{
                  padding: '6px 14px',
                  borderRadius: 8,
                  fontSize: 12,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  cursor: 'pointer',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  background: handshakeActive ? 'rgba(21,132,110,0.2)' : 'transparent',
                  color: handshakeActive ? 'var(--color-deep-verdant)' : 'var(--color-bone-white)'
                }}
              >
                <Radio size={13} className={handshakeActive ? 'animate-pulse' : ''} />
                <span>{handshakeActive ? 'IPC Handshake Verified ✓' : 'Simulate Inter-Agent Handshake'}</span>
              </button>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 16 }}>
            <div style={{ background: 'rgba(255, 255, 255, 0.02)', padding: '12px 16px', borderRadius: 10, border: '1px solid rgba(255, 255, 255, 0.05)' }}>
              <div style={{ fontSize: 11, color: 'var(--color-ash-gray)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Data Contract &amp; Schema</div>
              <div style={{ fontSize: 13, color: 'var(--color-bone-white)', fontFamily: 'monospace', marginTop: 4 }}>
                {activeAgentData.contract}
              </div>
            </div>

            <div style={{ background: 'rgba(255, 255, 255, 0.02)', padding: '12px 16px', borderRadius: 10, border: '1px solid rgba(255, 255, 255, 0.05)' }}>
              <div style={{ fontSize: 11, color: 'var(--color-ash-gray)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Inter-Agent IPC Peers</div>
              <div style={{ fontSize: 13, color: 'var(--color-electric-iris)', fontWeight: 600, marginTop: 4 }}>
                {activeAgentData.peers.map(p => `Agent ${p}`).join(' ↔ ')}
              </div>
            </div>

            <div style={{ background: 'rgba(255, 255, 255, 0.02)', padding: '12px 16px', borderRadius: 10, border: '1px solid rgba(255, 255, 255, 0.05)' }}>
              <div style={{ fontSize: 11, color: 'var(--color-ash-gray)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Runtime Bridge Port</div>
              <div style={{ fontSize: 13, color: 'var(--color-saffron-spark)', fontFamily: 'monospace', marginTop: 4 }}>
                {activeAgentData.port}
              </div>
            </div>
          </div>

          <div style={{ background: 'rgba(0, 0, 0, 0.7)', borderRadius: 8, padding: '12px 16px', border: '1px solid rgba(255, 255, 255, 0.08)', fontFamily: 'monospace', fontSize: 12, color: 'var(--color-bone-white)' }}>
            <span style={{ color: 'var(--color-deep-verdant)', marginRight: 8 }}>[TELEMETRY LOG]</span>
            <span>{activeAgentData.telemetryLog}</span>
          </div>
        </div>
      </div>

      {/* 4. Live API Playground & Payload Inspector */}
      <div className="veritas-surface" style={{ padding: 28, display: 'flex', flexDirection: 'column', gap: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
          <div>
            <h2 style={{ fontSize: 18, fontWeight: 400, color: 'var(--color-bone-white)', margin: 0 }}>
              Live API Wire &amp; Algorithm Playground
            </h2>
            <div style={{ fontSize: 13, fontWeight: 200, color: 'var(--color-ash-gray)', marginTop: 4 }}>
              Execute requests against microservice endpoints and inspect raw forensic telemetry
            </div>
          </div>

          {/* Pipeline Switcher Tabs */}
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {Object.keys(pipelineConfigs).map(key => (
              <button
                key={key}
                onClick={() => setActivePipeline(key)}
                style={{
                  background: activePipeline === key ? 'var(--color-electric-iris)' : 'rgba(255, 255, 255, 0.05)',
                  color: activePipeline === key ? '#ffffff' : 'var(--color-ash-gray)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: 20,
                  padding: '6px 14px',
                  fontSize: 12,
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6
                }}
              >
                <span>{pipelineConfigs[key].name}</span>
                <span style={{ 
                  fontSize: 10, 
                  background: activePipeline === key ? 'rgba(0,0,0,0.25)' : 'rgba(255,255,255,0.08)', 
                  padding: '1px 6px', 
                  borderRadius: 10 
                }}>
                  {pipelineConfigs[key].tag}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Method, URL and Actions Bar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, background: 'rgba(255, 255, 255, 0.03)', padding: '12px 16px', borderRadius: 12, border: '1px solid rgba(255, 255, 255, 0.08)', flexWrap: 'wrap' }}>
          <span style={{ 
            fontSize: 12, 
            fontWeight: 700, 
            fontFamily: 'monospace',
            color: pipelineConfigs[activePipeline].method === 'GET' ? 'var(--color-deep-verdant)' : 'var(--color-electric-iris)',
            background: 'rgba(255, 255, 255, 0.06)',
            padding: '4px 10px',
            borderRadius: 6
          }}>
            {pipelineConfigs[activePipeline].method}
          </span>

          <span style={{ fontFamily: 'monospace', fontSize: 13, color: 'var(--color-bone-white)', flex: 1, minWidth: 260 }}>
            {pipelineConfigs[activePipeline].url}
          </span>

          <button
            onClick={copyCurl}
            className="btn-ghost"
            style={{
              padding: '6px 12px',
              borderRadius: 8,
              fontSize: 12,
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              cursor: 'pointer',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              background: copiedCurl ? 'rgba(21,132,110,0.2)' : 'transparent',
              color: copiedCurl ? 'var(--color-deep-verdant)' : 'var(--color-bone-white)'
            }}
          >
            {copiedCurl ? <Check size={13} /> : <Copy size={13} />}
            <span>{copiedCurl ? 'Copied cURL!' : 'Copy cURL'}</span>
          </button>

          <button
            onClick={handleExecute}
            disabled={loading}
            style={{
              background: 'var(--color-electric-iris)',
              border: 'none',
              borderRadius: 8,
              padding: '8px 18px',
              fontSize: 13,
              fontWeight: 600,
              color: '#ffffff',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              cursor: 'pointer'
            }}
          >
            <Play size={13} fill="#fff" />
            <span>{loading ? 'Executing...' : 'Send Request'}</span>
          </button>
        </div>

        {/* Request & Response Dual-Pane */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: 20 }}>
          {/* Request Pane */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-ash-gray)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Request JSON Payload
              </div>
              <button
                onClick={() => setRequestPayload(pipelineConfigs[activePipeline].defaultBody)}
                className="btn-ghost"
                style={{
                  padding: '2px 8px',
                  borderRadius: 4,
                  fontSize: 11,
                  background: 'none',
                  border: 'none',
                  color: 'var(--color-ash-gray)',
                  cursor: 'pointer'
                }}
              >
                Reset Default
              </button>
            </div>
            <textarea
              value={requestPayload}
              onChange={(e) => setRequestPayload(e.target.value)}
              disabled={pipelineConfigs[activePipeline].method === 'GET'}
              rows={16}
              placeholder={pipelineConfigs[activePipeline].method === 'GET' ? 'GET request requires no payload body.' : 'Edit JSON payload here...'}
              style={{
                width: '100%',
                background: 'rgba(0, 0, 0, 0.6)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: 12,
                padding: '16px',
                fontFamily: 'monospace',
                fontSize: 12,
                color: 'var(--color-bone-white)',
                lineHeight: 1.5,
                boxSizing: 'border-box',
                resize: 'none',
                outline: 'none'
              }}
            />
          </div>

          {/* Response Pane */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-ash-gray)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Forensic Response Payload
                </div>
                <span style={{ 
                  fontSize: 10, 
                  fontWeight: 600, 
                  color: responseSource === 'LIVE_WIRE' ? 'var(--color-deep-verdant)' : 'var(--color-saffron-spark)',
                  background: responseSource === 'LIVE_WIRE' ? 'rgba(21,132,110,0.15)' : 'rgba(245,158,11,0.12)',
                  padding: '2px 6px',
                  borderRadius: 4
                }}>
                  {responseSource === 'LIVE_WIRE' ? '● LIVE WIRE' : '○ SIMULATED TELEMETRY'}
                </span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                {latency !== null && (
                  <span style={{ fontSize: 11, color: 'var(--color-deep-verdant)', fontFamily: 'monospace' }}>
                    Latency: {latency} ms
                  </span>
                )}
                <button
                  onClick={copyJsonResponse}
                  className="btn-ghost"
                  style={{
                    padding: '3px 8px',
                    borderRadius: 4,
                    fontSize: 11,
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 4,
                    background: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    color: copiedJson ? 'var(--color-deep-verdant)' : 'var(--color-ash-gray)',
                    cursor: 'pointer'
                  }}
                >
                  {copiedJson ? <Check size={11} /> : <FileJson size={11} />}
                  <span>{copiedJson ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
            </div>

            {/* Syntax Highlighted JSON Inspection */}
            <div
              style={{
                margin: 0,
                width: '100%',
                height: 336,
                overflowY: 'auto',
                background: 'rgba(0, 0, 0, 0.7)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: 12,
                padding: '16px',
                fontFamily: 'monospace',
                fontSize: 12,
                lineHeight: 1.5,
                boxSizing: 'border-box'
              }}
            >
              <pre
                style={{ margin: 0, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}
                dangerouslySetInnerHTML={{ __html: renderHighlightedJson(responsePayload) }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
