// Comprehensive Live E2E Verification Script for all Veritas Enterprise Architecture Endpoints
const http = require('http');

function postJson(urlStr, data) {
  return new Promise((resolve, reject) => {
    const url = new URL(urlStr);
    const bodyStr = JSON.stringify(data);
    const options = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(bodyStr)
      }
    };

    const req = http.request(options, (res) => {
      let responseBody = '';
      res.on('data', chunk => responseBody += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(responseBody);
          resolve({ status: res.statusCode, body: json });
        } catch (e) {
          resolve({ status: res.statusCode, raw: responseBody });
        }
      });
    });

    req.on('error', reject);
    req.write(bodyStr);
    req.end();
  });
}

function getJson(urlStr) {
  return new Promise((resolve, reject) => {
    const url = new URL(urlStr);
    const options = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname,
      method: 'GET'
    };

    const req = http.request(options, (res) => {
      let responseBody = '';
      res.on('data', chunk => responseBody += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(responseBody);
          resolve({ status: res.statusCode, body: json });
        } catch (e) {
          resolve({ status: res.statusCode, raw: responseBody });
        }
      });
    });

    req.on('error', reject);
    req.end();
  });
}

async function run() {
  console.log('================================================================');
  console.log('   VERITAS PLATFORM: ENTERPRISE ARCHITECTURE LIVE E2E SUITE     ');
  console.log('================================================================\n');

  let passes = 0;
  let total = 0;

  // 1. Spring Boot Health
  total++;
  try {
    const res = await getJson('http://localhost:8080/api/studio/health');
    console.log(`[1] Spring Boot Health (:8080): HTTP ${res.status} - Status: ${res.body.status || 'OK'}`);
    if (res.status === 200) passes++;
  } catch (e) {
    console.log(`[1] Spring Boot Health (:8080): FAILED (${e.message})`);
  }

  // 2. Merkle Tree Generation
  total++;
  let merkleData = null;
  try {
    const res = await getJson('http://localhost:8080/api/classrooms/submissions/1/merkle');
    console.log(`[2] Merkle Tree Generation (:8080): HTTP ${res.status}`);
    if (res.status === 200 && res.body.merkleRoot) {
      merkleData = res.body;
      console.log(`    Merkle Root: ${res.body.merkleRoot}`);
      console.log(`    Leaf Count: ${res.body.leaves.length}`);
      passes++;
    }
  } catch (e) {
    console.log(`[2] Merkle Tree Generation (:8080): FAILED (${e.message})`);
  }

  // 3. Merkle Proof Verification
  total++;
  try {
    if (merkleData && merkleData.leaves && merkleData.leaves.length > 0) {
      const leaf0 = merkleData.leaves[0];
      const proof0 = merkleData.proofs["0"] || merkleData.proofs[0];
      const res = await postJson('http://localhost:8080/api/classrooms/ledger/merkle/verify', {
        leafHash: leaf0,
        proof: proof0,
        expectedRoot: merkleData.merkleRoot
      });
      console.log(`[3] Merkle Proof Verification (:8080): HTTP ${res.status} - isProofValid: ${res.body.isProofValid}`);
      if (res.status === 200 && res.body.isProofValid === true) passes++;
    } else {
      console.log(`[3] Merkle Proof Verification: Skipped (no tree data)`);
    }
  } catch (e) {
    console.log(`[3] Merkle Proof Verification: FAILED (${e.message})`);
  }

  // 4. UGC 2018 Statutory Evaluation
  total++;
  try {
    const res = await postJson('http://localhost:8080/api/classrooms/ugc2018/evaluate', {
      similarityScore: 48.5
    });
    console.log(`[4] UGC 2018 Evaluation (:8080): HTTP ${res.status}`);
    if (res.status === 200 && res.body.level) {
      console.log(`    Classification: ${res.body.level} (${res.body.threshold})`);
      console.log(`    Student Penalty: ${res.body.studentPenalty.substring(0, 50)}...`);
      console.log(`    DAIP Rec: ${res.body.daipRecommendation}`);
      passes++;
    } else {
      console.log(`    Error response:`, res.raw || res.body);
    }
  } catch (e) {
    console.log(`[4] UGC 2018 Evaluation (:8080): FAILED (${e.message})`);
  }

  // 5. FastAPI SBERT Semantic Comparison
  total++;
  try {
    const res = await postJson('http://localhost:8000/api/v1/semantic/compare', {
      text_a: "Raft decomposes consensus into leader election, log replication, and safety guarantees.",
      text_b: "The Raft protocol partitions cluster agreement into electing leaders, appending state logs, and enforcing invariant safety.",
      lexical_winnowing_score: 54.2
    });
    console.log(`[5] SBERT Semantic Compare (:8000): HTTP ${res.status}`);
    if (res.status === 200 && res.body.result) {
      console.log(`    Cosine Score: ${res.body.result.semantic_cosine_score}%`);
      console.log(`    Hybrid Score: ${res.body.result.hybrid_plagiarism_score}%`);
      console.log(`    Architecture: ${res.body.result.model_architecture}`);
      passes++;
    }
  } catch (e) {
    console.log(`[5] SBERT Semantic Compare (:8000): FAILED (${e.message})`);
  }

  // 6. FAISS IVF-SDMA Vector Search
  total++;
  try {
    const res = await postJson('http://localhost:8000/api/v1/vector/ivf-sdma/search', {
      query_text: "distributed consensus algorithms with fault tolerance",
      k: 3
    });
    console.log(`[6] FAISS IVF-SDMA Search (:8000): HTTP ${res.status}`);
    if (res.status === 200 && res.body.status === 'success') {
      console.log(`    Voronoi Cells Scanned: ${res.body.sdma_stats.voronoi_cells_scanned}`);
      console.log(`    Nearest Neighbors: ${res.body.nearest_neighbors.length}`);
      passes++;
    }
  } catch (e) {
    console.log(`[6] FAISS IVF-SDMA Search (:8000): FAILED (${e.message})`);
  }

  // 7. Stylometric Forensics Writeprint
  total++;
  try {
    const res = await postJson('http://localhost:8000/api/v1/forensics/stylometry', {
      text: "Notwithstanding the intricate nuances of Byzantine fault-tolerant architectures, one must scrupulously evaluate the mathematical underpinnings of Lamport timestamps; furthermore, the epoch-based state transitions exhibited by Paxos demonstrate an exquisite degree of rigor.",
      baseline_author: "Arjun Patel"
    });
    console.log(`[7] Stylometry Writeprint (:8000): HTTP ${res.status}`);
    if (res.status === 200 && res.body.status === 'success') {
      console.log(`    Author: ${res.body.author}`);
      console.log(`    Yule's K: ${res.body.yules_k}`);
      console.log(`    TTR: ${res.body.ttr}`);
      console.log(`    Verdict: ${res.body.verdict}`);
      passes++;
    }
  } catch (e) {
    console.log(`[7] Stylometry Writeprint (:8000): FAILED (${e.message})`);
  }

  // 8. DPDP Act 2023 Consent & Minor Age-Gating
  total++;
  try {
    const res = await postJson('http://localhost:8000/api/v1/compliance/dpdp-2023/verify', {
      student_age: 16,
      parent_consent_token: "CONSENT-PARENT-VTS-994821",
      disable_behavioral_tracking: true
    });
    console.log(`[8] DPDP Act 2023 Verify (:8000): HTTP ${res.status}`);
    if (res.status === 200 && (res.body.status === 'CONSENT_VALIDATED' || res.body.status === 'COMPLIANT')) {
      console.log(`    Status: ${res.body.status}`);
      console.log(`    Minor Status: is_minor=${res.body.is_minor}`);
      console.log(`    Parental Consent: ${res.body.parental_consent_verified}`);
      console.log(`    Behavioral Tracking Blocked: ${res.body.behavioral_profiling_blocked}`);
      passes++;
    }
  } catch (e) {
    console.log(`[8] DPDP Act 2023 Verify (:8000): FAILED (${e.message})`);
  }

  console.log('\n================================================================');
  console.log(`   FINAL VERIFICATION SCORE: ${passes}/${total} PASSED (${Math.round((passes/total)*100)}%)`);
  console.log('================================================================');

  if (passes === total) {
    console.log('>>> ALL VERITAS ENTERPRISE ARCHITECTURE GATES CERTIFIED GREEN <<<');
    process.exit(0);
  } else {
    console.error('>>> SOME GATES PENDING OR FAILED <<<');
    process.exit(1);
  }
}

run();
