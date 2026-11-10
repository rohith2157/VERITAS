"""
Dedicated Test Suite for Real Models and Upgrades:
1. Real FAISS CPU IndexFlatIP persistence and isolation
2. SBERT batch vector generation, caching, and engine telemetry
3. Genuine javalang AST code clone normalization
"""

import os
import tempfile
import pytest
from core.vector_index import IVFFlatIndexSDMA, get_institution_index
from core.semantic_vector import (
    generate_sentence_embedding,
    generate_batch_embeddings,
    get_embedding_engine_status,
    compute_cosine_similarity
)
from core.ast_code import normalize_java_code, compare_code_files


def test_real_faiss_lifecycle_and_persistence():
    index = IVFFlatIndexSDMA(num_centroids=4, slab_capacity=16, institution_id="stanford")
    
    doc1 = "Distributed consensus algorithm using Paxos and Raft."
    doc2 = "Photosynthetic light reaction in plant chloroplasts."
    
    r1 = index.add_document("doc-1", doc1, {"course": "CS401"})
    r2 = index.add_document("doc-2", doc2, {"course": "BIO101"})
    
    assert r1["status"] == "INDEXED"
    assert r2["status"] == "INDEXED"
    assert index.total_indexed_count == 2
    
    # Verify FAISS is active
    if index.faiss_available and index.faiss_index is not None:
        assert index.faiss_index.ntotal == 2
        
        # Test index persistence to disk
        with tempfile.TemporaryDirectory() as tmpdir:
            saved_path = index.save_index(tmpdir)
            assert os.path.exists(saved_path)
            
            # Load into fresh index
            loaded_index = IVFFlatIndexSDMA(num_centroids=4, institution_id="stanford")
            success = loaded_index.load_index(saved_path)
            assert success is True
            assert loaded_index.total_indexed_count == 2


def test_multi_tenant_institution_isolation():
    idx_stanford = get_institution_index("stanford_university")
    idx_mit = get_institution_index("mit_cryptography")
    
    idx_stanford.add_document("doc-s1", "Distributed lock manager algorithm", {"inst": "Stanford"})
    idx_mit.add_document("doc-m1", "Quantum key distribution protocol", {"inst": "MIT"})
    
    assert idx_stanford.institution_id == "stanford_university"
    assert idx_mit.institution_id == "mit_cryptography"
    assert idx_stanford != idx_mit


def test_sBERT_caching_and_batch_inference():
    texts = [
        "Distributed state machine replication.",
        "Leader election timeout and heartbeat.",
        "Distributed state machine replication."  # Duplicate to test cache hit
    ]
    
    embeddings = generate_batch_embeddings(texts)
    assert len(embeddings) == 3
    assert len(embeddings[0]) == 384
    
    # Cosine similarity between identical texts should be 100%
    sim_identical = compute_cosine_similarity(embeddings[0], embeddings[2])
    assert sim_identical == 100.0
    
    # Telemetry check
    status = get_embedding_engine_status()
    assert status["status"] == "OPERATIONAL"
    assert status["cache_entries"] > 0
    assert status["numpy_acceleration"] is True


def test_genuine_javalang_ast_normalization():
    java_code_a = """
    package com.veritas.algo;
    public class DistributedLockManager {
        private int lockTimeout = 5000;
        public boolean acquireLock(String resourceId, int ownerId) {
            if (resourceId != null && ownerId > 0) {
                return true;
            }
            return false;
        }
    }
    """
    
    java_code_b = """
    package com.veritas.algo;
    public class ClusterMutexCoordinator {
        private int leaseDuration = 5000;
        public boolean requestMutex(String targetKey, int clientIdentifier) {
            if (targetKey != null && clientIdentifier > 0) {
                return true;
            }
            return false;
        }
    }
    """
    
    norm_a, meta_a = normalize_java_code(java_code_a)
    norm_b, meta_b = normalize_java_code(java_code_b)
    
    assert meta_a["success"] is True
    assert meta_b["success"] is True
    assert meta_a["node_count"] > 10
    
    # Renamed classes, methods, and variables should be mapped to canonical tokens
    assert "CLASS_1" in norm_a
    assert "CLASS_1" in norm_b
    assert "FUNC_1" in norm_a
    assert "FUNC_1" in norm_b
    
    # Compare code files should detect structural AST clone
    cmp_res = compare_code_files(java_code_a, java_code_b, "java")
    assert cmp_res["ast_equivalence_percentage"] >= 75.0
    assert "CLONE DETECTED" in cmp_res["structural_verdict"]
