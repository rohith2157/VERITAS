"""
Automated Verification Suite for Veritas AI Engine
Tests Winnowing, Evasion Detection, 1-to-1, Many-to-Many, AI Forensics, and Code AST.
"""

import sys
import os

# Add parent directory to path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from core.evasion import sanitize_and_audit
from core.winnowing import generate_fingerprints
from core.similarity import compare_documents_1to1
from core.matrix import compute_cohort_matrix
from core.ai_forensics import analyze_ai_writing
from core.ast_code import compare_code_files


def test_evasion_detector():
    print("Testing Evasion Detector...")
    # Inject Cyrillic 'а' and zero-width space into "plagiarism"
    tampered_text = "This is a comp\u0430ny document with inv\u200Bisible spaces."
    clean, report = sanitize_and_audit(tampered_text)
    
    assert report["is_suspicious"] is True
    assert report["homoglyph_count"] > 0
    assert report["invisible_char_count"] > 0
    assert "\u200B" not in clean
    print("  -> Evasion detector passed: Successfully flagged homoglyph and zero-width characters.")


def test_1to1_similarity():
    print("Testing 1-to-1 Similarity...")
    doc_original = (
        "Distributed systems enable horizontal scaling by dividing compute workloads across multiple nodes. "
        "Consensus algorithms like Raft and Paxos ensure fault tolerance and data consistency across networks. "
        "Each node maintains an append-only log of state transitions."
    )
    # Copied version with slight reordering
    doc_copied = (
        "Distributed systems enable horizontal scaling by dividing compute workloads across multiple nodes. "
        "In addition, consensus algorithms like Raft and Paxos ensure fault tolerance and data consistency across networks. "
        "Our team concluded the study."
    )
    doc_unique = (
        "Photosynthesis in green plants converts sunlight into glucose and oxygen through chlorophyll pigments. "
        "Light-dependent reactions occur within the thylakoid membranes of chloroplasts."
    )

    result_high = compare_documents_1to1(doc_original, doc_copied)
    assert result_high["similarity_score"] > 60.0, f"Expected high similarity, got {result_high['similarity_score']}"
    assert len(result_high["matched_segments"]) > 0

    result_low = compare_documents_1to1(doc_original, doc_unique)
    assert result_low["similarity_score"] < 15.0, f"Expected low similarity, got {result_low['similarity_score']}"
    print(f"  -> 1-to-1 comparison passed: Copied score={result_high['similarity_score']}%, Unique score={result_low['similarity_score']}%.")


def test_cohort_matrix():
    print("Testing NxN Cohort Matrix...")
    docs = [
        {"id": "s1", "name": "Student A", "text": "Deep learning models require massive datasets to train neural network weights effectively.", "timestamp": "2026-10-01T10:00:00"},
        {"id": "s2", "name": "Student B", "text": "Deep learning models require massive datasets to train neural network weights effectively and accurately.", "timestamp": "2026-10-01T11:00:00"},
        {"id": "s3", "name": "Student C", "text": "Quantum computing uses qubits and superposition to solve combinatorial optimization problems.", "timestamp": "2026-10-01T12:00:00"}
    ]
    res = compute_cohort_matrix(docs, collusion_threshold=30.0)
    assert res["cohort_size"] == 3
    assert len(res["flagged_pairs"]) >= 1
    top_pair = res["flagged_pairs"][0]
    assert top_pair["doc_a_name"] in ["Student A", "Student B"]
    assert top_pair["suspected_original_submitter"] == "Student A"
    print(f"  -> NxN Cohort Matrix passed: Identified collusion between Student A & B. Patient zero={top_pair['suspected_original_submitter']}.")


def test_ai_forensics():
    print("Testing AI Forensics...")
    sample_text = (
        "Artificial intelligence continues to evolve across modern sectors. "
        "Machine learning algorithms optimize supply chains and increase operational efficiency. "
        "Predictive analytics tools assist organizations in making informed business decisions. "
        "Automation reduces repetitive workflows while maximizing overall productivity."
    )
    res = analyze_ai_writing(sample_text)
    assert "ai_probability" in res
    assert "metrics" in res
    assert len(res["sentence_analysis"]) > 0
    print(f"  -> AI Forensics passed: AI Probability={res['ai_probability']}%, Burstiness StdDev={res['metrics']['burstiness_std_dev']}.")


def test_code_ast():
    print("Testing AST Code Plagiarism...")
    code_1 = """
def calculate_factorial(n):
    total = 1
    for i in range(1, n + 1):
        total = total * i
    return total
"""
    code_2 = """
# Renamed variables and added comments
def compute_fact(num):
    # initialize accumulator
    res = 1
    for count in range(1, num + 1):
        res = res * count
    return res
"""
    res = compare_code_files(code_1, code_2, lang="python")
    assert res["structural_similarity"] > 70.0, f"Expected high structural similarity, got {res['structural_similarity']}"
    assert res["is_code_clone"] is True
    print(f"  -> Code AST passed: Detected clone with renamed variables! Similarity={res['structural_similarity']}%.")


if __name__ == "__main__":
    test_evasion_detector()
    test_1to1_similarity()
    test_cohort_matrix()
    test_ai_forensics()
    test_code_ast()
    print("\n[SUCCESS] ALL AI ENGINE TESTS PASSED SUCCESSFULLY!")
