import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, Lock, Award, CheckCircle, AlertTriangle, 
  RefreshCw, Copy, Check, FileText, Download, Hash, Activity, Layers, ExternalLink 
} from 'lucide-react';
import ForensicCertificateModal from '../classroom/ForensicCertificateModal';
import { useToast } from '../../context/ToastContext';

// Native browser SHA-256 for deterministic hash verification
async function sha256Browser(str) {
  try {
    const encoder = new TextEncoder();
    const data = encoder.encode(str || '');
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  } catch (e) {
    let hash = 0;
    for (let i = 0; i < (str || '').length; i++) {
      hash = (hash << 5) - hash + str.charCodeAt(i);
      hash |= 0;
    }
    return Math.abs(hash).toString(16).padStart(64, '0');
  }
}

export default function CryptographicLedger() {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [copiedHash, setCopiedHash] = useState(false);
  const [tamperMode, setTamperMode] = useState(false);
  const [selectedLeaf, setSelectedLeaf] = useState(0);
  const [verificationResult, setVerificationResult] = useState(null);
  const [selectedCertSub, setSelectedCertSub] = useState(null);

  // Live blocks state
  const [blocks, setBlocks] = useState([
    { height: 3242, hash: '0x4a8f9b2d8819c301e5b1289cf291048b', txCount: 14, timestamp: '12 mins ago', validator: 'Node-US-East (Veritas Enterprise)', student: 'Arjun Patel', status: 'CONFIRMED' },
    { height: 3241, hash: '0x7e120d91ff02a41893c5d648bfa92301', txCount: 8, timestamp: '28 mins ago', validator: 'Node-EU-Central (Veritas Enterprise)', student: 'Rohan Gupta', status: 'CONFIRMED' },
    { height: 3240, hash: '0x9b33fe14582ef882194b6ce7a1f59238', txCount: 22, timestamp: '1 hour ago', validator: 'Node-AP-South (Veritas Enterprise)', student: 'Elena Rostova', status: 'CONFIRMED' },
    { height: 3239, hash: '0x22c4ab99018411def4b593012fae8391', txCount: 19, timestamp: '2 hours ago', validator: 'Node-US-West (Veritas Enterprise)', student: 'David Chen', status: 'CONFIRMED' },
    { height: 3238, hash: '0x55df982a9834b912a784cb23f98218ae', txCount: 16, timestamp: '3 hours ago', validator: 'Node-US-East (Veritas Enterprise)', student: 'Sarah Jenkins', status: 'CONFIRMED' },
    { height: 3237, hash: '0x88ea3091bc40283fa7192830fbe87192', txCount: 11, timestamp: '4 hours ago', validator: 'Node-EU-West (Veritas Enterprise)', student: 'Marcus Vance', status: 'CONFIRMED' }
  ]);

  // Merkle Tree structure state
  const [treeData, setTreeData] = useState(null);

  // Recompute Merkle tree when tamperMode toggles
  const computeMerkleTree = async (isCorrupted = tamperMode) => {
    setLoading(true);
    try {
      const rawLeaf0 = isCorrupted
        ? "CORRUPTED_TAMPERED_SUBMISSION_HASH_MALICIOUS_INJECTION"
        : "SUBMISSION_DOCUMENT_AST_HASH_ORIGINAL_ARJUN_PATEL";
      const rawLeaf1 = "AST_NORMALIZED_SYNTAX_FINGERPRINT_VECTOR_V1";
      const rawLeaf2 = "STYLOMETRY_YULES_K_BURSTINESS_VECTOR_V1";
      const rawLeaf3 = "UGC2018_STATUTORY_CLASSIFICATION_LEVEL_0_DAIP";

      const h0 = await sha256Browser(rawLeaf0);
      const h1 = await sha256Browser(rawLeaf1);
      const h2 = await sha256Browser(rawLeaf2);
      const h3 = await sha256Browser(rawLeaf3);

      const h01 = await sha256Browser(h0 + h1);
      const h23 = await sha256Browser(h2 + h3);
      const root = await sha256Browser(h01 + h23);

      const proofs = {
        0: [
          { level: 1, siblingHash: h1, direction: 'right' },
          { level: 2, siblingHash: h23, direction: 'right' }
        ],
        1: [
          { level: 1, siblingHash: h0, direction: 'left' },
          { level: 2, siblingHash: h23, direction: 'right' }
        ],
        2: [
          { level: 1, siblingHash: h3, direction: 'right' },
          { level: 2, siblingHash: h01, direction: 'left' }
        ],
        3: [
          { level: 1, siblingHash: h2, direction: 'left' },
          { level: 2, siblingHash: h01, direction: 'left' }
        ]
      };

      setTreeData({
        merkleRoot: "0x" + root,
        canonicalRoot: "0x" + (isCorrupted ? (await sha256Browser((await sha256Browser((await sha256Browser("SUBMISSION_DOCUMENT_AST_HASH_ORIGINAL_ARJUN_PATEL")) + h1)) + h23)) : root),
        rawMerkleRoot: root,
        leaves: [h0, h1, h2, h3],
        leafLabels: [
          "Leaf 0: Raw Document Text & Karp-Rabin Fingerprints",
          "Leaf 1: AST Structural Syntax Normalization",
          "Leaf 2: Stylometric Writeprint & Yule's K Vector",
          "Leaf 3: UGC 2018 Statutory Classification & Timestamp"
        ],
        intermediates: [h01, h23],
        proofs: proofs,
        validatorNode: "Node-US-East (Veritas Enterprise Distributed Ledger)",
        treeTopology: "Binary Balanced SHA-256 (Depth 2, 4 Leaves)",
        sealedBlockHeight: 3242,
        isTampered: isCorrupted
      });
      setVerificationResult(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    computeMerkleTree(tamperMode);
  }, [tamperMode]);

  // Verify currently selected leaf proof
  const verifyProof = async () => {
    if (!treeData) return;
    setLoading(true);
    try {
      let cur = treeData.leaves[selectedLeaf];
      const proof = treeData.proofs[selectedLeaf];
      for (const step of proof) {
        if (step.direction === 'right') {
          cur = await sha256Browser(cur + step.siblingHash);
        } else {
          cur = await sha256Browser(step.siblingHash + cur);
        }
      }
      const matches = !tamperMode && ("0x" + cur.toLowerCase()) === treeData.canonicalRoot.toLowerCase();
      setVerificationResult({
        isProofValid: matches,
        leafHash: "0x" + treeData.leaves[selectedLeaf],
        expectedRoot: treeData.canonicalRoot,
        recomputedRoot: "0x" + cur,
        verifiedAt: new Date().toISOString(),
        cryptographicStandard: "SHA-256 Binary Merkle Tree (O(log N) Verification)",
        statusMessage: matches 
          ? "PROOF VALID: Computed root matches immutable institutional block anchor." 
          : "INTEGRITY VIOLATION DETECTED: Hash mismatch! Data was altered after anchor."
      });
      if (matches) {
        showToast('Cryptographic Merkle proof verified successfully (O(log N) passed)', 'success');
      } else {
        showToast('Tamper alert: Merkle root mismatch detected!', 'error');
      }
    } finally {
      setLoading(false);
    }
  };

  const copyMerkleRoot = () => {
    if (!treeData) return;
    navigator.clipboard.writeText(treeData.merkleRoot);
    setCopiedHash(true);
    showToast('Merkle root copied to clipboard', 'info');
    setTimeout(() => setCopiedHash(false), 2000);
  };

  return (
    <div style={{ maxWidth: 'var(--page-max-width, 1360px)', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 32 }}>
      
      {/* 1. Header & Institutional Status */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        flexWrap: 'wrap',
        gap: 20,
        borderBottom: '1px solid var(--border-subtle, rgba(255, 255, 255, 0.08))',
        paddingBottom: 24
      }}>
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '4px 10px', borderRadius: 9999, background: 'rgba(128, 82, 255, 0.15)', border: '1px solid rgba(128, 82, 255, 0.3)', color: 'var(--color-electric-iris)', fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 10 }}>
            <Lock size={12} />
            <span>Pillar 3: Immutable Academic Ledger</span>
          </div>
          <h1 style={{ fontSize: 32, fontWeight: 400, letterSpacing: '-0.03em', margin: 0, color: 'var(--color-bone-white)' }}>
            Cryptographic Merkle Tree Ledger
          </h1>
          <p style={{ fontSize: 14, color: 'var(--color-ash-gray)', margin: '8px 0 0 0', maxWidth: 720, lineHeight: 1.5 }}>
            Tamper-evident SHA-256 Merkle block explorer and verifiable proof auditor. Guarantees non-repudiation and timestamped evidentiary verification across all student submissions.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button
            onClick={() => setSelectedCertSub({
              id: 3242,
              studentName: "Arjun Patel",
              studentEmail: "arjun.p@cs.university.edu",
              assignment: "Assignment 3: Raft Consensus & Byzantine Fault Tolerance",
              filename: "raft_consensus_patel.py",
              similarityScore: 6.2,
              ledgerHash: treeData?.merkleRoot || "0x4a8f9b2d8819c301e5b1289cf291048b"
            })}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              padding: '10px 18px',
              borderRadius: 20,
              background: 'rgba(21, 132, 110, 0.15)',
              border: '1px solid var(--color-deep-verdant)',
              color: 'var(--color-deep-verdant)',
              fontSize: 13,
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            <Award size={15} />
            <span>Export Certificate (PDF/JSON)</span>
          </button>
        </div>
      </div>

      {/* 2. Ledger Metrics Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16 }}>
        <div className="veritas-surface" style={{ padding: '20px 24px' }}>
          <div style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', color: 'var(--color-ash-gray)', marginBottom: 6 }}>
            Sealed Block Height
          </div>
          <div style={{ fontSize: 30, fontWeight: 400, color: 'var(--color-bone-white)', fontFamily: 'var(--font-mono)' }}>
            #3,242
          </div>
          <div style={{ fontSize: 12, color: 'var(--color-deep-verdant)', marginTop: 6, display: 'flex', alignItems: 'center', gap: 6 }}>
            <CheckCircle size={12} />
            <span>Consensus Confirmed (6 Nodes)</span>
          </div>
        </div>

        <div className="veritas-surface" style={{ padding: '20px 24px' }}>
          <div style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', color: 'var(--color-ash-gray)', marginBottom: 6 }}>
            Verification Complexity
          </div>
          <div style={{ fontSize: 30, fontWeight: 400, color: 'var(--color-electric-iris)', fontFamily: 'var(--font-mono)' }}>
            O(log N)
          </div>
          <div style={{ fontSize: 12, color: 'var(--color-ash-gray)', marginTop: 6 }}>
            2 Proof Steps (Instant 0.2ms)
          </div>
        </div>

        <div className="veritas-surface" style={{ padding: '20px 24px' }}>
          <div style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', color: 'var(--color-ash-gray)', marginBottom: 6 }}>
            Tamper Protection
          </div>
          <div style={{ fontSize: 30, fontWeight: 400, color: tamperMode ? '#ef4444' : 'var(--color-deep-verdant)' }}>
            {tamperMode ? 'COMPROMISED' : '100% SECURE'}
          </div>
          <div style={{ fontSize: 12, color: tamperMode ? '#fca5a5' : 'var(--color-ash-gray)', marginTop: 6 }}>
            {tamperMode ? 'Simulated bit mutation active' : 'Zero unauthenticated changes'}
          </div>
        </div>

        <div className="veritas-surface" style={{ padding: '20px 24px' }}>
          <div style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', color: 'var(--color-ash-gray)', marginBottom: 6 }}>
            Compliance Standard
          </div>
          <div style={{ fontSize: 26, fontWeight: 400, color: 'var(--color-saffron-spark)' }}>
            UGC 2018 § 7
          </div>
          <div style={{ fontSize: 12, color: 'var(--color-ash-gray)', marginTop: 6 }}>
            Statutory Tamper Evident
          </div>
        </div>
      </div>

      {/* 3. Interactive Merkle Tree Visualizer & Tamper Simulator */}
      <div className="veritas-surface" style={{ padding: 28, display: 'flex', flexDirection: 'column', gap: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
          <div>
            <h2 style={{ fontSize: 18, fontWeight: 400, color: 'var(--color-bone-white)', margin: 0 }}>
              Interactive Merkle Tree Audit Visualizer
            </h2>
            <div style={{ fontSize: 13, color: 'var(--color-ash-gray)', marginTop: 4 }}>
              Select any leaf node to audit its cryptographic membership proof against the immutable root anchor.
            </div>
          </div>

          {/* Tamper Simulator Toggle Button */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 12, fontWeight: 600, color: tamperMode ? '#ef4444' : 'var(--color-ash-gray)', textTransform: 'uppercase' }}>
              Adversarial Tamper Simulation:
            </span>
            <button
              onClick={() => setTamperMode(!tamperMode)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                padding: '7px 14px',
                borderRadius: 20,
                fontSize: 12,
                fontWeight: 600,
                background: tamperMode ? 'rgba(239, 68, 68, 0.2)' : 'rgba(255, 255, 255, 0.05)',
                border: tamperMode ? '1px solid #ef4444' : '1px solid rgba(255, 255, 255, 0.12)',
                color: tamperMode ? '#fca5a5' : 'var(--color-bone-white)',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
            >
              <AlertTriangle size={13} color={tamperMode ? '#ef4444' : 'currentColor'} />
              <span>{tamperMode ? 'Mutate Bit: ON (Corrupted)' : 'Mutate Bit: OFF (Clean)'}</span>
            </button>
          </div>
        </div>

        {/* Root Anchor Banner */}
        <div style={{
          padding: '16px 20px',
          borderRadius: 12,
          background: tamperMode ? 'rgba(239, 68, 68, 0.08)' : 'rgba(128, 82, 255, 0.08)',
          border: tamperMode ? '1px solid rgba(239, 68, 68, 0.3)' : '1px solid rgba(128, 82, 255, 0.3)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 12
        }}>
          <div>
            <div style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', color: tamperMode ? '#fca5a5' : 'var(--color-electric-iris)', letterSpacing: '0.04em' }}>
              Anchored Merkle Root (Block #3242)
            </div>
            <div style={{ fontSize: 13, fontFamily: 'var(--font-mono)', color: 'var(--color-bone-white)', marginTop: 4, wordBreak: 'break-all' }}>
              {treeData?.merkleRoot || 'Computing cryptographic root...'}
            </div>
          </div>
          <button
            onClick={copyMerkleRoot}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              padding: '6px 12px',
              borderRadius: 14,
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              color: 'var(--color-bone-white)',
              fontSize: 12,
              cursor: 'pointer'
            }}
          >
            {copiedHash ? <Check size={13} color="var(--color-deep-verdant)" /> : <Copy size={13} />}
            <span>{copiedHash ? 'Copied' : 'Copy Root'}</span>
          </button>
        </div>

        {/* Tree Topology Diagram (Roots -> Intermediates -> Leaves) */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20, alignItems: 'center' }}>
          
          {/* Top Level: Merkle Root Node */}
          <div style={{
            padding: '12px 24px',
            borderRadius: 12,
            background: 'rgba(128, 82, 255, 0.15)',
            border: '1px solid var(--color-electric-iris)',
            textAlign: 'center',
            maxWidth: 420,
            width: '100%'
          }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--color-electric-iris)', textTransform: 'uppercase' }}>
              Merkle Root (Depth 0)
            </div>
            <div style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--color-bone-white)', marginTop: 4, overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {treeData ? (treeData.merkleRoot.substring(0, 22) + '...') : '0x...'}
            </div>
          </div>

          <div style={{ width: 2, height: 16, background: 'rgba(255, 255, 255, 0.15)' }} />

          {/* Intermediate Nodes Level */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 32, maxWidth: 640, width: '100%' }}>
            <div style={{
              padding: '10px 16px',
              borderRadius: 10,
              background: 'rgba(255, 255, 255, 0.03)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: 10, fontWeight: 600, color: 'var(--color-ash-gray)', textTransform: 'uppercase' }}>
                Node H(0,1)
              </div>
              <div style={{ fontSize: 10, fontFamily: 'var(--font-mono)', color: 'var(--color-bone-white)', marginTop: 2 }}>
                {treeData ? (treeData.intermediates[0].substring(0, 16) + '...') : '0x...'}
              </div>
            </div>

            <div style={{
              padding: '10px 16px',
              borderRadius: 10,
              background: 'rgba(255, 255, 255, 0.03)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: 10, fontWeight: 600, color: 'var(--color-ash-gray)', textTransform: 'uppercase' }}>
                Node H(2,3)
              </div>
              <div style={{ fontSize: 10, fontFamily: 'var(--font-mono)', color: 'var(--color-bone-white)', marginTop: 2 }}>
                {treeData ? (treeData.intermediates[1].substring(0, 16) + '...') : '0x...'}
              </div>
            </div>
          </div>

          <div style={{ width: 2, height: 16, background: 'rgba(255, 255, 255, 0.15)' }} />

          {/* Leaf Nodes Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16, width: '100%' }}>
            {treeData && treeData.leaves.map((leaf, idx) => {
              const isSelected = selectedLeaf === idx;
              const isCorrupted = idx === 0 && tamperMode;
              return (
                <div
                  key={idx}
                  onClick={() => { setSelectedLeaf(idx); setVerificationResult(null); }}
                  style={{
                    padding: 16,
                    borderRadius: 12,
                    background: isSelected ? 'rgba(128, 82, 255, 0.12)' : 'rgba(255, 255, 255, 0.03)',
                    border: isCorrupted
                      ? '1px solid #ef4444'
                      : (isSelected ? '1px solid var(--color-electric-iris)' : '1px solid rgba(255, 255, 255, 0.08)'),
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    boxShadow: isSelected ? '0 0 16px rgba(128, 82, 255, 0.15)' : 'none'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                    <span style={{ fontSize: 12, fontWeight: 600, color: isCorrupted ? '#fca5a5' : (isSelected ? 'var(--color-electric-iris)' : 'var(--color-bone-white)') }}>
                      Leaf {idx}
                    </span>
                    {isCorrupted ? (
                      <span style={{ fontSize: 10, background: '#ef4444', color: '#fff', padding: '1px 6px', borderRadius: 6, fontWeight: 700 }}>
                        MUTATED
                      </span>
                    ) : isSelected ? (
                      <span style={{ fontSize: 10, background: 'var(--color-electric-iris)', color: '#fff', padding: '1px 6px', borderRadius: 6 }}>
                        AUDITING
                      </span>
                    ) : null}
                  </div>
                  <div style={{ fontSize: 12, fontWeight: 400, color: 'var(--color-ash-gray)', marginBottom: 8, minHeight: 32 }}>
                    {treeData.leafLabels[idx]}
                  </div>
                  <div style={{ fontSize: 10.5, fontFamily: 'var(--font-mono)', color: isCorrupted ? '#fca5a5' : 'var(--color-silver-mist)', wordBreak: 'break-all' }}>
                    {leaf.substring(0, 18)}...
                  </div>
                </div>
              );
            })}
          </div>

          {/* Proof Verification Action */}
          <div style={{ marginTop: 12, display: 'flex', gap: 12, alignItems: 'center' }}>
            <button
              onClick={verifyProof}
              disabled={loading}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                padding: '10px 24px',
                borderRadius: 24,
                background: 'var(--color-electric-iris)',
                color: '#ffffff',
                border: 'none',
                fontSize: 13,
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              <ShieldCheck size={16} />
              <span>{loading ? 'Verifying Path...' : `Verify Leaf ${selectedLeaf} Proof`}</span>
            </button>
          </div>

          {/* Verification Result Output */}
          {verificationResult && (
            <div style={{
              width: '100%',
              padding: '16px 20px',
              borderRadius: 12,
              background: verificationResult.isProofValid ? 'rgba(21, 132, 110, 0.12)' : 'rgba(239, 68, 68, 0.12)',
              border: verificationResult.isProofValid ? '1px solid var(--color-deep-verdant)' : '1px solid #ef4444',
              display: 'flex',
              flexDirection: 'column',
              gap: 8
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                {verificationResult.isProofValid ? (
                  <CheckCircle size={18} color="var(--color-deep-verdant)" />
                ) : (
                  <AlertTriangle size={18} color="#ef4444" />
                )}
                <span style={{ fontSize: 14, fontWeight: 600, color: verificationResult.isProofValid ? 'var(--color-deep-verdant)' : '#ef4444' }}>
                  {verificationResult.statusMessage}
                </span>
              </div>
              <div style={{ fontSize: 12, color: 'var(--color-ash-gray)', fontFamily: 'var(--font-mono)' }}>
                Recomputed Root: {verificationResult.recomputedRoot}
              </div>
              <div style={{ fontSize: 11, color: 'var(--color-ash-gray)' }}>
                Audit Standard: {verificationResult.cryptographicStandard} • Timestamp: {verificationResult.verifiedAt}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 4. Live Ledger Blocks Explorer */}
      <div className="veritas-surface" style={{ padding: 28, display: 'flex', flexDirection: 'column', gap: 20 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
          <div>
            <h2 style={{ fontSize: 18, fontWeight: 400, color: 'var(--color-bone-white)', margin: 0 }}>
              Live Cryptographic Blocks Explorer
            </h2>
            <div style={{ fontSize: 13, color: 'var(--color-ash-gray)', marginTop: 4 }}>
              Distributed blocks anchored across the institutional consortium network.
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--color-deep-verdant)' }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--color-deep-verdant)', display: 'inline-block', animation: 'pulse 1.5s infinite' }} />
            <span>Consortium Network Synced</span>
          </div>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: 13 }}>
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.08)', color: 'var(--color-ash-gray)', textTransform: 'uppercase', fontSize: 11 }}>
                <th style={{ padding: '12px 14px' }}>Height</th>
                <th style={{ padding: '12px 14px' }}>Block Hash</th>
                <th style={{ padding: '12px 14px' }}>Student Subject</th>
                <th style={{ padding: '12px 14px' }}>Validator Node</th>
                <th style={{ padding: '12px 14px' }}>Tx Count</th>
                <th style={{ padding: '12px 14px' }}>Timestamp</th>
                <th style={{ padding: '12px 14px' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {blocks.map((b) => (
                <tr key={b.height} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.04)' }}>
                  <td style={{ padding: '12px 14px', fontFamily: 'var(--font-mono)', color: 'var(--color-electric-iris)', fontWeight: 600 }}>
                    #{b.height}
                  </td>
                  <td style={{ padding: '12px 14px', fontFamily: 'var(--font-mono)', color: 'var(--color-bone-white)' }}>
                    {b.hash}
                  </td>
                  <td style={{ padding: '12px 14px', color: 'var(--color-bone-white)' }}>
                    {b.student}
                  </td>
                  <td style={{ padding: '12px 14px', color: 'var(--color-ash-gray)' }}>
                    {b.validator}
                  </td>
                  <td style={{ padding: '12px 14px', color: 'var(--color-ash-gray)' }}>
                    {b.txCount} txs
                  </td>
                  <td style={{ padding: '12px 14px', color: 'var(--color-ash-gray)' }}>
                    {b.timestamp}
                  </td>
                  <td style={{ padding: '12px 14px' }}>
                    <span style={{ fontSize: 11, background: 'rgba(21, 132, 110, 0.15)', color: 'var(--color-deep-verdant)', padding: '2px 8px', borderRadius: 9999, fontWeight: 600 }}>
                      {b.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Forensic Certificate Modal */}
      {selectedCertSub && (
        <ForensicCertificateModal
          submission={selectedCertSub}
          onClose={() => setSelectedCertSub(null)}
        />
      )}
    </div>
  );
}
