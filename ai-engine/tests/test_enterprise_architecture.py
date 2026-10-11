"""
Comprehensive Test Suite for Veritas Enterprise Architecture Guide Implementations:
1. SBERT Semantic Vectorization & Cosine Similarity
2. FAISS IVF-Flat with SDMA Memory Manager (O(1) deletion)
3. Stylometric Author Fingerprinting (Yule's K & Writeprint)
4. OCR Document Capture Layer
5. UGC 2018 Statutory Regulations & DAIP/IAIP Dossiers
6. DPDP Act 2023 Age-Gating & Right to Erasure
7. CodeBERT Bimodal AST Code Alignment
"""

import pytest
import sys
import os

# Add ai-engine to sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from fastapi.testclient import TestClient
from main import app
from core.stylometry import calculate_yules_k, extract_writeprint, detect_stylometric_anomaly
from core.semantic_vector import generate_sentence_embedding, compute_cosine_similarity
from core.vector_index import IVFFlatIndexSDMA
from core.compliance_ugc import classify_ugc_2018_level, apply_ugc_exclusions
from core.ast_code import compare_code_files


client = TestClient(app)


def test_sbert_vectorization_and_cosine():
    text_a = "Distributed consensus algorithms ensure node clusters agree on state despite network partitions."
    text_b = "A cluster of network nodes utilizes consensus protocols to reach agreement on values across partitions."
    
    vec_a = generate_sentence_embedding(text_a, dim=384)
    vec_b = generate_sentence_embedding(text_b, dim=384)
    
    assert len(vec_a) == 384
    assert len(vec_b) == 384
    
    sim = compute_cosine_similarity(vec_a, vec_b)
    assert sim >= 70.0, f"Expected high semantic similarity for paraphrased Raft text, got {sim}%"
    
    # API Test
    resp = client.post("/api/v1/semantic/compare", json={
        "text_a": text_a,
        "text_b": text_b,
        "lexical_winnowing_score": 85.0
    })
    assert resp.status_code == 200
    data = resp.json()["result"]
    assert "semantic_cosine_score" in data
    assert "hybrid_plagiarism_score" in data
    assert data["hybrid_plagiarism_score"] > 0.0


def test_faiss_ivf_flat_sdma_memory_lifecycle():
    index = IVFFlatIndexSDMA(num_centroids=4, slab_capacity=16)
    
    doc1 = "Distributed lock management in cloud datacenters."
    doc2 = "Raft consensus leader election algorithm."
    doc3 = "Photosynthesis mechanism in green plant thylakoids."
    
    res1 = index.add_document("doc-1", doc1, {"author": "Arjun Patel"})
    res2 = index.add_document("doc-2", doc2, {"author": "Rohan Gupta"})
    res3 = index.add_document("doc-3", doc3, {"author": "Biology Text"})
    
    assert res1["status"] == "INDEXED"
    assert index.total_indexed_count == 3
    
    # Search for Raft query
    search_res = index.search("Raft leader election protocol for cluster", n_probe=3, top_k=2)
    assert search_res["matches_found"] >= 1
    top_doc = search_res["matches"][0]
    assert top_doc["doc_id"] == "doc-2"
    
    # Test SDMA O(1) non-blocking bitmap deletion (Section 11 of Guide)
    del_res = index.delete_document("doc-1")
    assert del_res["status"] == "DELETED_SDMA_TOMBSTONE"
    assert del_res["memory_reallocation_avoided"] is True
    assert index.total_indexed_count == 2
    
    # Ensure deleted document is no longer returned in search
    search_after_del = index.search("Distributed lock management in cloud datacenters.", n_probe=4)
    matching_ids = [m["doc_id"] for m in search_after_del["matches"]]
    assert "doc-1" not in matching_ids


def test_stylometric_writeprint_and_yules_k():
    sample_text = (
        "Distributed systems remain fundamentally challenging because individual machines fail independently. "
        "Consequently, engineers must architect protocols that gracefully degrade under partitioned networks. "
        "Paxos and Raft represent two distinct mathematical approaches toward solving this dilemma. "
        "While Paxos provides theoretical elegance, Raft prioritizes intuitive state decomposition."
    )
    
    wp = extract_writeprint(sample_text)
    assert wp["word_count"] > 20
    assert "yules_k" in wp
    assert "type_token_ratio" in wp
    assert "burstiness" in wp
    assert wp["burstiness"]["mean_length"] > 0
    assert len(wp["punctuation_vector"]) > 0
    
    # Test contract ghostwriting detection
    baseline_simple = [
        "I like code. It is good. We run tests. The tests work.",
        "Today we learn raft. It is easy. Leader sends heartbeat.",
        "Code is done. We can submit now. Have a nice day."
    ]
    complex_ghostwritten = (
        "The epistemological foundations of distributed consensus transcend rudimentary token exchange, "
        "necessitating rigorous probabilistic invariants to guarantee Byzantine fault tolerance across disparate nodes."
    )
    
    anomaly = detect_stylometric_anomaly(complex_ghostwritten, baseline_simple)
    assert anomaly["anomaly_detected"] is True
    assert anomaly["anomaly_type"] == "CONTRACT_GHOSTWRITING_SUSPECTED"
    assert len(anomaly["flags"]) > 0


def test_ocr_document_capture():
    resp = client.post("/api/v1/ocr/extract", json={
        "filename": "scanned_homework_submission.png"
    })
    assert resp.status_code == 200
    data = resp.json()
    assert data["format"] == "RASTER_IMAGE_CAPTURE"
    assert data["evasion_thwarted"] is True
    assert len(data["extracted_text"]) > 0


def test_ugc_2018_statutory_compliance():
    # Level 0 (up to 10%)
    l0 = classify_ugc_2018_level(8.5, "STUDENT")
    assert l0["ugc_level"] == "Level 0"
    assert l0["severity"] == "CLEAN"
    assert l0["regulatory_governance"]["formal_hearing_required"] is False
    
    # Level 1 (10% to 40%)
    l1 = classify_ugc_2018_level(32.4, "STUDENT")
    assert l1["ugc_level"] == "Level 1"
    assert "revised manuscript" in l1["mandated_disciplinary_penalty"]
    
    # Level 2 (40% to 60%)
    l2 = classify_ugc_2018_level(54.0, "STUDENT")
    assert l2["ugc_level"] == "Level 2"
    assert "1 year" in l2["mandated_disciplinary_penalty"]
    
    # Level 3 (Above 60%)
    l3 = classify_ugc_2018_level(82.5, "STUDENT")
    assert l3["ugc_level"] == "Level 3"
    assert "cancelled" in l3["mandated_disciplinary_penalty"]
    
    # Test exclusions under Section 7 (Quotes and References)
    text_with_quotes = (
        "Here is student analysis. \"This is a direct cited quote from Lamport 1998.\" "
        "More independent analysis. References: 1. Lamport Leslie Paxos Made Simple."
    )
    filtered = apply_ugc_exclusions(text_with_quotes)
    assert filtered["excluded_segments_count"] >= 1


def test_dpdp_act_2023_privacy_and_erasure():
    # 1. Minor (<18) without consent -> REJECTED
    minor_rejected = client.post("/api/v1/compliance/dpdp/consent", json={
        "student_id": "STU-9901",
        "age": 16,
        "parental_consent_token": None
    })
    assert minor_rejected.status_code == 200
    assert minor_rejected.json()["status"] == "CONSENT_REJECTED"
    assert minor_rejected.json()["processing_permitted"] is False
    
    # 2. Minor (<18) with parental consent token -> ACCEPTED
    minor_accepted = client.post("/api/v1/compliance/dpdp/consent", json={
        "student_id": "STU-9901",
        "age": 16,
        "parental_consent_token": "TOKEN-PARENT-GUARDIAN-9901"
    })
    assert minor_accepted.status_code == 200
    assert minor_accepted.json()["status"] == "CONSENT_VALIDATED"
    assert minor_accepted.json()["processing_permitted"] is True
    
    # 3. Right to Erasure / Right to be Forgotten (Section 12)
    # First index a doc
    client.post("/api/v1/vector/index", json={
        "doc_id": "DOC-ERASE-TEST-1",
        "text": "Private student essay to be permanently forgotten under Section 12."
    })
    
    erasure_resp = client.post("/api/v1/compliance/dpdp/erasure", json={
        "student_id": "STU-9901",
        "document_id": "DOC-ERASE-TEST-1"
    })
    assert erasure_resp.status_code == 200
    erasure_data = erasure_resp.json()
    assert erasure_data["status"] == "SUCCESSFULLY_ERASED"
    assert "tombstone_hash" in erasure_data


def test_codebert_ast_bimodal_alignment():
    code_a = """
def calculate_factorial(n):
    total = 1
    for i in range(1, n + 1):
        total = total * i
    return total
"""
    code_b = """
def compute_fact(num):
    res = 1
    for count in range(1, num + 1):
        res = res * count
    return res
"""
    res = compare_code_files(code_a, code_b, "python")
    assert res["status"] == "success"
    assert res["is_code_clone"] is True
    assert res["ast_equivalence_percentage"] >= 80.0
    assert "codebert_semantic_similarity" in res
    assert res["codebert_semantic_similarity"] >= 80.0
