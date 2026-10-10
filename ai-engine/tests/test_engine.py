"""
Automated Verification Suite for Veritas AI Engine
Exhaustively tests:
1. Winnowing algorithm & Karp-Rabin polynomial rolling hash
2. 1-to-1 Jaccard similarity, containment, aligned diff & crypto hash
3. Intra-cohort NxN matrix, graph collusion clusters, and Patient Zero detection
4. Python AST syntax clone normalization and variable cross-mapping
5. Java AST syntax clone normalization using javalang
6. Unicode NFKC normalization, Cyrillic homoglyphs translation table & zero-width stripping
7. API endpoint contract verification against Developer Workstation and Universal Studio
"""

import sys
import os
import time

# Add parent directory to path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from core.evasion import sanitize_and_audit, HOMOGLYPH_MAP, INVISIBLE_CHARS
from core.winnowing import (
    generate_fingerprints,
    compute_kgram_rolling_hashes,
    tokenize_with_spans,
    hash_kgram,
)
from core.similarity import compare_documents_1to1, get_color_tier
from core.matrix import compute_cohort_matrix
from core.ai_forensics import analyze_ai_writing
from core.ast_code import (
    compare_code_files,
    normalize_python_code,
    normalize_java_code,
)
from main import app
from fastapi.testclient import TestClient


def test_evasion_detector_comprehensive():
    print("[1/7] Testing Evasion Detector & Unicode NFKC Normalization...")
    start = time.perf_counter()

    # Adversarial test string with Cyrillic lookalikes and zero-width characters
    # 'а' (U+0430), 'е' (U+0435), 'о' (U+043E), 'р' (U+0440), 'с' (U+0441)
    tampered_text = (
        "This is \u0430 comp\u0430ny r\u0435s\u0435\u0430rch d\u043ecum\u0435nt with "
        "inv\u200Bisible z\u0435r\u043e-width sp\u0430\u200Cces \u200Dand sh\u00ADingles."
    )
    clean, report = sanitize_and_audit(tampered_text)

    # 1. Verify zero-width stripping
    assert "\u200b" not in clean, "Zero-width space (U+200B) not stripped!"
    assert "\u200c" not in clean, "Zero-width non-joiner (U+200C) not stripped!"
    assert "\u200d" not in clean, "Zero-width joiner (U+200D) not stripped!"
    assert "\u00ad" not in clean, "Soft hyphen (U+00AD) not stripped!"

    # 2. Verify Cyrillic translation table
    assert "\u0430" not in clean, "Cyrillic small a (U+0430) not translated!"
    assert "\u0435" not in clean, "Cyrillic small e (U+0435) not translated!"
    assert "\u043e" not in clean, "Cyrillic small o (U+043E) not translated!"

    # 3. Verify report structure and threat level
    assert report["is_suspicious"] is True
    assert report["homoglyphs_detected_count"] >= 5
    assert report["zero_width_spaces_stripped_count"] >= 3
    assert report["threat_level"] == "HIGH ADVERSARIAL EVASION INTENT"
    assert len(report["evasion_types_found"]) > 0

    elapsed = (time.perf_counter() - start) * 1000
    print(f"  -> Passed in {elapsed:.2f}ms: Caught {report['homoglyphs_detected_count']} homoglyphs and {report['zero_width_spaces_stripped_count']} zero-width characters.")


def test_winnowing_karp_rabin():
    print("[2/7] Testing Winnowing Algorithm & Karp-Rabin Rolling Hash...")
    start = time.perf_counter()

    sample_doc = (
        "Distributed consensus algorithms ensure that a cluster of nodes can agree on values despite network partitions. "
        "Raft decomposes leader election and log replication into modular independent stages. "
        "Each follower maintains randomized heartbeat timers to prevent split-vote scenarios during election cycles."
    )

    # 1. Tokenization and offsets
    tokens = tokenize_with_spans(sample_doc)
    assert len(tokens) > 25, f"Expected >25 tokens, got {len(tokens)}"

    # 2. Karp-Rabin rolling hash calculation
    kgram_hashes = compute_kgram_rolling_hashes(tokens, k=5)
    assert len(kgram_hashes) == len(tokens) - 5 + 1

    # Verify that rolling hash produces correct 64-bit integer values
    for item in kgram_hashes:
        assert isinstance(item["hash"], int)
        assert 0 <= item["hash"] < (1 << 64)
        assert item["start_char"] < item["end_char"]

    # 3. Winnowing fingerprint extraction with sliding window
    fps, _, _ = generate_fingerprints(sample_doc, k=5, w=4)
    assert len(fps) > 0
    # Verify deduplication: adjacent fingerprints must have distinct indices
    for i in range(len(fps) - 1):
        assert fps[i].token_start != fps[i + 1].token_start

    elapsed = (time.perf_counter() - start) * 1000
    print(f"  -> Passed in {elapsed:.2f}ms: Generated {len(fps)} winnowed fingerprints across {len(tokens)} tokens in O(N).")


def test_1to1_similarity_and_diff():
    print("[3/7] Testing 1-to-1 Document Similarity & Semantic Diff...")
    start = time.perf_counter()

    doc_a = (
        "Distributed consensus algorithms ensure that a cluster of nodes can agree on values despite network partitions. "
        "Raft simplifies consensus by decomposing it into leader election, log replication, and safety guarantees. "
        "A leader is elected via randomized heartbeat timers to prevent split-vote scenarios. "
        "Once established, all client state transitions flow strictly through the leader before being committed to follower logs."
    )
    doc_b = (
        "Distributed consensus algorithms ensure that a cluster of nodes can agree on values despite network partitions. "
        "Raft simplifies consensus by decomposing it into leader election, log replication, and safety guarantees. "
        "A leader is elected via randomized heartbeat timers to prevent split-vote scenarios. "
        "Client state transitions flow strictly through the leader before being committed."
    )

    result = compare_documents_1to1(doc_a, doc_b, k=5, w=4)

    assert result["status"] == "success"
    assert result["similarity_score"] >= 85.0
    assert result["similarity_percentage"] >= 85.0
    assert result["jaccard_coefficient"] > 0.6
    assert result["shared_fingerprints_count"] > 0

    assert len(result["matched_segments"]) > 0
    assert len(result["aligned_diff"]) > 0
    assert result["cryptographic_hash"].startswith("0x")
    assert result["color_tier"]["code"] == "RED"

    elapsed = (time.perf_counter() - start) * 1000
    print(f"  -> Passed in {elapsed:.2f}ms: Similarity={result['similarity_score']}%, Jaccard={result['jaccard_score']}%, CryptoHash={result['cryptographic_hash'][:14]}...")


def test_cohort_matrix_and_patient_zero():
    print("[4/7] Testing NxN Cohort Matrix & Patient Zero Discovery...")
    start = time.perf_counter()

    cohort_docs = [
        {
            "id": "s1",
            "name": "Arjun Patel",
            "timestamp": "2026-10-01T09:00:00",
            "text": "Distributed consensus algorithms ensure node clusters reach agreement despite network partitions. Raft simplifies leader election."
        },
        {
            "id": "s2",
            "name": "Rohan Gupta",
            "timestamp": "2026-10-01T11:30:00",
            "text": "Distributed consensus algorithms ensure node clusters reach agreement despite network partitions. Raft simplifies leader election and logs."
        },
        {
            "id": "s3",
            "name": "Neha Deshmukh",
            "timestamp": "2026-10-01T10:15:00",
            "text": "Photosynthesis converts solar light into glucose and oxygen through chlorophyll pigments in thylakoid membranes."
        }
    ]

    matrix_res = compute_cohort_matrix(cohort_docs, collusion_threshold=40.0)

    assert matrix_res["status"] == "success"
    assert matrix_res["cohort_size"] == 3
    assert len(matrix_res["similarity_matrix"]) == 3
    assert len(matrix_res["collusion_pairs"]) >= 1

    top_pair = matrix_res["collusion_pairs"][0]
    assert "s1" in top_pair["earlier_author"]
    assert top_pair["time_delta_minutes"] == 150
    assert "Patient Zero" in top_pair["direction"]
    assert top_pair["similarity_score"] > 80.0

    assert len(matrix_res["collusion_clusters"]) >= 1
    cluster = matrix_res["collusion_clusters"][0]
    assert cluster["patient_zero"] == "Arjun Patel"

    elapsed = (time.perf_counter() - start) * 1000
    print(f"  -> Passed in {elapsed:.2f}ms: Identified Patient Zero '{cluster['patient_zero']}' with time delta {top_pair['time_delta_minutes']} min.")


def test_python_ast_clone_normalization():
    print("[5/7] Testing Python AST Structural Clone Normalization...")
    start = time.perf_counter()

    code_a = """
def factorial(n: int) -> int:
    \"\"\"Calculates factorial of n.\"\"\"
    if n <= 1:
        return 1
    return n * factorial(n - 1)
"""
    code_b = """
def f(x):
    # Obfuscated variable names and stripped comments
    if x <= 1:
        return 1
    return x * f(x - 1)
"""

    res = compare_code_files(code_a, code_b, lang="python")

    assert res["status"] == "success"
    assert res["is_code_clone"] is True
    assert res["ast_equivalence_percentage"] == 100.0
    assert res["structural_similarity"] == 100.0
    assert res["variable_mappings"].get("x") == "n"
    assert res["variable_mappings"].get("f") == "factorial"
    assert "IDENTICAL CODE CLONE DETECTED" in res["structural_verdict"]

    elapsed = (time.perf_counter() - start) * 1000
    print(f"  -> Passed in {elapsed:.2f}ms: Detected 100% clone! Mapped variables: {res['variable_mappings']}.")


def test_java_ast_clone_normalization():
    print("[6/7] Testing Java AST Structural Clone Normalization (javalang)...")
    start = time.perf_counter()

    java_a = """
public class FactorialCalculator {
    public static int computeFactorial(int number) {
        int result = 1;
        for (int i = 1; i <= number; i++) {
            result = result * i;
        }
        return result;
    }
}
"""
    java_b = """
// Renamed identifiers and altered formatting
public class MathUtil {
    public static int calcFact(int n) {
        int res = 1;
        for (int count = 1; count <= n; count++) {
            res = res * count;
        }
        return res;
    }
}
"""

    res = compare_code_files(java_a, java_b, lang="java")

    assert res["status"] == "success"
    assert res["is_code_clone"] is True
    assert res["ast_equivalence_percentage"] == 100.0
    assert res["variable_mappings"].get("n") == "number"
    assert res["variable_mappings"].get("res") == "result"
    assert res["variable_mappings"].get("count") == "i"
    assert res["variable_mappings"].get("calcFact") == "computeFactorial"

    elapsed = (time.perf_counter() - start) * 1000
    print(f"  -> Passed in {elapsed:.2f}ms: Java AST clone verified! Mapped variables: {res['variable_mappings']}.")


def test_api_endpoint_contracts():
    print("[7/7] Testing API Endpoint Contracts (Developer Workstation & Studio)...")
    start = time.perf_counter()

    client = TestClient(app)

    # 1. Health endpoint
    health_resp = client.get("/health")
    assert health_resp.status_code == 200
    assert health_resp.json()["status"] == "UP"

    # 2. Winnowing 1-to-1 endpoint (Developer Workstation payload)
    winnowing_payload = {
        "text_a": "Distributed consensus algorithms ensure that a cluster of nodes can agree on values despite network partitions. Raft decomposes leader election and log replication.",
        "text_b": "Distributed consensus algorithms ensure that a cluster of nodes can agree on values despite network partitions. Raft decomposes leader election and log replication carefully.",
        "k_gram_size": 25,
        "window_size": 15,
        "sanitize_homoglyphs": True
    }
    w_resp = client.post("/api/v1/compare/one-to-one", json=winnowing_payload)
    assert w_resp.status_code == 200
    w_data = w_resp.json()
    assert "similarity_percentage" in w_data
    assert "similarity_score" in w_data
    assert "shared_fingerprints_count" in w_data
    assert "total_unique_fingerprints" in w_data
    assert "jaccard_coefficient" in w_data
    assert "evasion_sanitized_count" in w_data
    assert "execution_time_ms" in w_data
    assert "cryptographic_hash" in w_data
    assert "aligned_diff" in w_data
    assert "color_tier" in w_data

    # 3. Intra-cohort matrix endpoint (Developer Workstation payload)
    matrix_payload = {
        "documents": [
            {"id": "s1", "name": "Arjun Patel", "timestamp": "2026-10-01T09:00:00", "text": "Distributed consensus algorithms ensure node clusters reach agreement despite network partitions. Raft simplifies leader election."},
            {"id": "s2", "name": "Rohan Gupta", "timestamp": "2026-10-01T11:30:00", "text": "Distributed consensus algorithms ensure node clusters reach agreement despite network partitions. Raft simplifies leader election and logs."},
            {"id": "s3", "name": "Neha Deshmukh", "timestamp": "2026-10-01T10:15:00", "text": "Photosynthesis converts solar light into glucose and oxygen through chlorophyll pigments in thylakoid membranes."}
        ],
        "collusion_threshold": 40.0
    }
    m_resp = client.post("/api/v1/compare/many-to-many", json=matrix_payload)
    assert m_resp.status_code == 200
    m_data = m_resp.json()
    assert m_data["status"] == "success"
    assert m_data["cohort_size"] == 3
    assert len(m_data["collusion_pairs"]) >= 1
    assert "direction" in m_data["collusion_pairs"][0]
    assert "similarity_matrix" in m_data
    assert "collusion_clusters" in m_data

    # 4. AST code normalize endpoint (Developer Workstation payload)
    ast_payload = {
        "code_a": "def factorial(n):\n    if n <= 1:\n        return 1\n    return n * factorial(n - 1)",
        "code_b": "def f(x):\n    # Obfuscated variable names\n    if x <= 1:\n        return 1\n    return x * f(x - 1)",
        "language": "python"
    }
    ast_resp = client.post("/api/v1/ast/normalize", json=ast_payload)
    assert ast_resp.status_code == 200
    ast_data = ast_resp.json()
    assert ast_data["status"] == "success"
    assert ast_data["ast_equivalence_percentage"] == 100.0
    assert ast_data["variable_mappings"].get("x") == "n"
    assert "IDENTICAL CODE CLONE DETECTED" in ast_data["structural_verdict"]

    # 5. Homoglyphs sanitizer endpoint (Developer Workstation payload)
    homo_payload = {
        "text": "This is a comp\u0430ny r\u0435s\u0435arch document with inv\u200Bisible z\u0435ro-width spaces."
    }
    homo_resp = client.post("/api/v1/sanitize/homoglyphs", json=homo_payload)
    assert homo_resp.status_code == 200
    homo_data = homo_resp.json()
    assert homo_data["status"] == "success"
    assert homo_data["homoglyphs_detected_count"] == 4
    assert homo_data["zero_width_spaces_stripped_count"] == 1
    assert homo_data["threat_level"] == "HIGH ADVERSARIAL EVASION INTENT"

    # 6. AI Forensics endpoint
    ai_payload = {
        "text": "Artificial intelligence continues to evolve across modern sectors. Machine learning algorithms optimize supply chains and increase operational efficiency. Predictive analytics tools assist organizations in making informed business decisions. Automation reduces repetitive workflows while maximizing overall productivity."
    }
    ai_resp = client.post("/api/v1/detect/ai-forensics", json=ai_payload)
    assert ai_resp.status_code == 200
    ai_data = ai_resp.json()
    assert "ai_probability" in ai_data
    assert "metrics" in ai_data
    assert len(ai_data["sentence_analysis"]) > 0

    elapsed = (time.perf_counter() - start) * 1000
    print(f"  -> Passed in {elapsed:.2f}ms: All endpoints matched Developer Workstation and Universal Studio contracts.")


if __name__ == "__main__":
    print("=" * 70)
    print("  VERITAS AI & SIMILARITY ENGINE — ALGORITHMIC VERIFICATION SUITE  ")
    print("=" * 70)
    total_start = time.perf_counter()

    test_evasion_detector_comprehensive()
    test_winnowing_karp_rabin()
    test_1to1_similarity_and_diff()
    test_cohort_matrix_and_patient_zero()
    test_python_ast_clone_normalization()
    test_java_ast_clone_normalization()
    test_api_endpoint_contracts()

    total_elapsed = (time.perf_counter() - total_start) * 1000
    print("=" * 70)
    print(f"[SUCCESS] ALL 7 ALGORITHMIC & CONTRACT VERIFICATION SUITES PASSED! (Total: {total_elapsed:.2f}ms)")
    print("=" * 70)

