"""
Benchmark 3: Student Cohort Collusion & Patient Zero Attribution Benchmark
Validates:
1. Intra-cohort collusion matrix across the official student benchmark:
   - Arjun Patel (Original author, T=09:00)
   - Rohan Gupta (Direct copycat, T=11:30)
   - Elena Rostova (Adversarial evasion copycat, T=14:15)
   - David Chen (AI synthetic control, T=16:00)
   - Sarah Jenkins (Independent student control, T=17:30)
   - Neha Deshmukh (Orthogonal discipline control, T=18:00)
2. Graph-based Collusion Ring clustering
3. Patient Zero attribution accuracy and temporal permutation robustness
4. AST Code Plagiarism collusion benchmark (Arjun vs Rohan vs Elena)
"""

import os
import sys
import json
import itertools

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from core.matrix import compute_cohort_matrix
from core.ast_code import compare_code_files
from core.extractor import extract_text_from_file

def load_cohort_documents():
    docs_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..', 'data', 'sample_documents'))
    
    # Read Arjun's original essay
    with open(os.path.join(docs_dir, "Essay_Original_StudentA.txt"), "r", encoding="utf-8") as f:
        text_arjun = f.read().strip()
        
    # Read Rohan's copied essay
    with open(os.path.join(docs_dir, "Essay_Copied_StudentB.txt"), "r", encoding="utf-8") as f:
        text_rohan = f.read().strip()
        
    # Read Elena's homoglyph essay
    with open(os.path.join(docs_dir, "Essay_HomoglyphCheat_StudentE.txt"), "r", encoding="utf-8") as f:
        text_elena = f.read().strip()
        
    # Read Neha's independent essay
    with open(os.path.join(docs_dir, "Essay_Independent_StudentD.txt"), "r", encoding="utf-8") as f:
        text_neha = f.read().strip()
        
    text_david_ai = (
        "Distributed state machines provide foundational guarantees for fault-tolerant architectures. "
        "Consensus protocols establish strict serialized agreement on cluster log transactions. "
        "Heartbeat mechanisms govern election safety criteria across participating cluster instances."
    )
    
    text_sarah_independent = (
        "Paxos achieves consensus through two distinct phases: Prepare/Promise and Accept/Accepted. "
        "Proposers suggest values with monotonically increasing ballot numbers to prevent stale commits. "
        "Acceptors acknowledge ballots and store state in non-volatile storage to survive reboots."
    )
    
    return [
        {"id": "s1_arjun", "name": "Arjun Patel", "text": text_arjun, "timestamp": "2026-10-01T09:00:00Z"},
        {"id": "s2_rohan", "name": "Rohan Gupta", "text": text_rohan, "timestamp": "2026-10-01T11:30:00Z"},
        {"id": "s3_elena", "name": "Elena Rostova", "text": text_elena, "timestamp": "2026-10-01T14:15:00Z"},
        {"id": "s4_david", "name": "David Chen", "text": text_david_ai, "timestamp": "2026-10-01T16:00:00Z"},
        {"id": "s5_sarah", "name": "Sarah Jenkins", "text": text_sarah_independent, "timestamp": "2026-10-01T17:30:00Z"},
        {"id": "s6_neha", "name": "Neha Deshmukh", "text": text_neha, "timestamp": "2026-10-01T18:00:00Z"}
    ]

def benchmark_cohort_collusion_matrix():
    print("\n--- Sub-Benchmark 3A: Intra-Cohort Collusion Matrix & Graph Clustering ---")
    documents = load_cohort_documents()
    
    # Compute cohort matrix at collusion threshold 30.0%
    result = compute_cohort_matrix(documents, k=5, w=4, collusion_threshold=30.0)
    
    matrix = result["similarity_matrix"]
    headers = [d["name"] for d in result["document_headers"]]
    flagged_pairs = result["flagged_pairs"]
    clusters = result["collusion_clusters"]
    
    print("\n  Pairwise Similarity Heatmap (% Containment):")
    header_line = " " * 16 + " ".join(f"{h[:10]:>10}" for h in headers)
    print(header_line)
    for i, row in enumerate(matrix):
        row_str = f"{headers[i][:15]:15s} " + " ".join(f"{val:10.1f}" for val in row)
        print(row_str)
        
    print(f"\n  Flagged Collusion Pairs (Threshold >= 30%): {len(flagged_pairs)}")
    for p in flagged_pairs:
        print(f"    - {p['doc_a_name']} <-> {p['doc_b_name']} : {p['similarity_score']}% | Original Author: {p['suspected_original_submitter']}")
        
    print(f"\n  Detected Collusion Clusters: {len(clusters)}")
    for c in clusters:
        members_str = ", ".join(m["name"] for m in c["members"])
        print(f"    - Cluster [{c['cluster_id']}]: Size={c['size']} | Patient Zero: '{c['patient_zero']}' | Members: [{members_str}]")
        
    # Academic Validations:
    # 1. Exactly 1 collusion ring must be discovered
    assert len(clusters) == 1, f"Expected 1 collusion ring, found {len(clusters)}"
    ring = clusters[0]
    
    # 2. Ring members must be exactly {Arjun Patel, Rohan Gupta, Elena Rostova}
    ring_member_names = {m["name"] for m in ring["members"]}
    expected_colluders = {"Arjun Patel", "Rohan Gupta", "Elena Rostova"}
    assert ring_member_names == expected_colluders, f"Expected {expected_colluders}, got {ring_member_names}"
    
    # 3. Patient Zero must be Arjun Patel (earliest submission at 09:00:00)
    assert ring["patient_zero"] == "Arjun Patel", f"Expected Patient Zero 'Arjun Patel', got {ring['patient_zero']}"
    
    # 4. Sarah Jenkins, David Chen, Neha Deshmukh must have 0 collusion flags with Arjun
    for p in flagged_pairs:
        pair_names = {p["doc_a_name"], p["doc_b_name"]}
        assert "Sarah Jenkins" not in pair_names, "False positive flag on Sarah Jenkins!"
        assert "David Chen" not in pair_names, "False positive flag on David Chen!"
        assert "Neha Deshmukh" not in pair_names, "False positive flag on Neha Deshmukh!"

    print("  -> Collusion Ring Detection and Patient Zero: 100% ACCURATE!")
    return {
        "cohort_size": len(documents),
        "similarity_matrix": matrix,
        "flagged_pairs": flagged_pairs,
        "clusters": clusters
    }

def benchmark_patient_zero_temporal_permutations():
    print("\n--- Sub-Benchmark 3B: Patient Zero Temporal Robustness Permutation Suite ---")
    documents = load_cohort_documents()
    colluders = [d for d in documents if d["name"] in ["Arjun Patel", "Rohan Gupta", "Elena Rostova"]]
    
    permutation_scenarios = [
        ("Chronological (Arjun First)", {"Arjun Patel": "2026-10-01T08:00:00Z", "Rohan Gupta": "2026-10-01T10:00:00Z", "Elena Rostova": "2026-10-01T12:00:00Z"}, "Arjun Patel"),
        ("Rohan First Leaker",          {"Arjun Patel": "2026-10-01T11:00:00Z", "Rohan Gupta": "2026-10-01T07:30:00Z", "Elena Rostova": "2026-10-01T12:00:00Z"}, "Rohan Gupta"),
        ("Elena First Source",          {"Arjun Patel": "2026-10-01T14:00:00Z", "Rohan Gupta": "2026-10-01T15:00:00Z", "Elena Rostova": "2026-10-01T06:15:00Z"}, "Elena Rostova"),
        ("Sub-Second Offset",           {"Arjun Patel": "2026-10-01T10:00:00.100Z", "Rohan Gupta": "2026-10-01T10:00:00.200Z", "Elena Rostova": "2026-10-01T10:00:00.300Z"}, "Arjun Patel"),
    ]
    
    perm_results = []
    for label, ts_map, expected_patient_zero in permutation_scenarios:
        test_docs = []
        for d in colluders:
            doc_copy = dict(d)
            doc_copy["timestamp"] = ts_map[d["name"]]
            test_docs.append(doc_copy)
            
        res = compute_cohort_matrix(test_docs, collusion_threshold=30.0)
        assert len(res["collusion_clusters"]) == 1, "Cluster missing in permutation test"
        ring = res["collusion_clusters"][0]
        actual_pz = ring["patient_zero"]
        
        is_correct = (actual_pz == expected_patient_zero)
        print(f"  [{label:30s}] Expected PZ: {expected_patient_zero:15s} | Actual PZ: {actual_pz:15s} | Match: {is_correct}")
        assert is_correct, f"Patient Zero failed under scenario {label}: expected {expected_patient_zero}, got {actual_pz}"
        
        perm_results.append({
            "scenario": label,
            "expected_patient_zero": expected_patient_zero,
            "actual_patient_zero": actual_pz,
            "accuracy": 1.0
        })

    # Test missing timestamps fallback
    docs_no_ts = [dict(d, timestamp=None) for d in colluders]
    res_no_ts = compute_cohort_matrix(docs_no_ts, collusion_threshold=30.0)
    pz_no_ts = res_no_ts["collusion_clusters"][0]["patient_zero"]
    print(f"  [Missing Timestamps Fallback   ] Handled gracefully -> Patient Zero: '{pz_no_ts}'")
    assert pz_no_ts == "Unknown", f"Expected 'Unknown' when timestamps absent, got {pz_no_ts}"

    return perm_results

def benchmark_code_ast_collusion():
    print("\n--- Sub-Benchmark 3C: Code AST Collusion Benchmark ---")
    docs_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..', 'data', 'sample_documents'))
    
    with open(os.path.join(docs_dir, "raft_consensus_patel.py"), "r", encoding="utf-8") as f:
        code_patel = f.read()
    with open(os.path.join(docs_dir, "raft_submission_gupta.py"), "r", encoding="utf-8") as f:
        code_gupta = f.read()
    with open(os.path.join(docs_dir, "raft_elena_final.py"), "r", encoding="utf-8") as f:
        code_elena = f.read()
    with open(os.path.join(docs_dir, "jenkins_raft_impl.py"), "r", encoding="utf-8") as f:
        code_jenkins = f.read()
        
    # Compare Arjun vs Rohan (Identical AST structure, all variables renamed)
    res_arjun_rohan = compare_code_files(code_patel, code_gupta, lang="python")
    print(f"  [Arjun Patel vs Rohan Gupta (Renamed AST Variables)]")
    print(f"    Structural Similarity: {res_arjun_rohan['structural_similarity']}% | Code Clone Flag: {res_arjun_rohan['is_code_clone']}")
    print(f"    Doc A Vars Renamed: {res_arjun_rohan['meta']['doc_a'].get('variables_renamed')} | Doc B Vars Renamed: {res_arjun_rohan['meta']['doc_b'].get('variables_renamed')}")
    assert res_arjun_rohan["is_code_clone"] is True, "Failed to flag Rohan as code clone of Arjun!"
    assert res_arjun_rohan["structural_similarity"] >= 80.0, f"Expected AST similarity >= 80%, got {res_arjun_rohan['structural_similarity']}"

    # Compare Arjun vs Sarah Jenkins (Completely independent codebase)
    res_arjun_jenkins = compare_code_files(code_patel, code_jenkins, lang="python")
    print(f"  [Arjun Patel vs Sarah Jenkins (Independent Implementation)]")
    print(f"    Structural Similarity: {res_arjun_jenkins['structural_similarity']}% | Code Clone Flag: {res_arjun_jenkins['is_code_clone']}")
    assert res_arjun_jenkins["is_code_clone"] is False, "False positive: Sarah Jenkins marked as code clone!"
    assert res_arjun_jenkins["structural_similarity"] < 25.0, f"Expected AST similarity < 25%, got {res_arjun_jenkins['structural_similarity']}"

    # Java Code AST / Heuristic Clone Benchmark
    with open(os.path.join(docs_dir, "DistributedLock_Arjun.java"), "r", encoding="utf-8") as f:
        java_arjun = f.read()
    with open(os.path.join(docs_dir, "DistributedLock_RohanClone.java"), "r", encoding="utf-8") as f:
        java_rohan = f.read()
        
    res_java = compare_code_files(java_arjun, java_rohan, lang="java")
    print(f"  [Java DistributedLock: Arjun vs Rohan Mutex Clone]")
    print(f"    Structural Similarity: {res_java['structural_similarity']}% | Code Clone Flag: {res_java['is_code_clone']}")
    assert res_java["is_code_clone"] is True, "Failed to flag Java code clone!"

    return {
        "python_arjun_vs_rohan": res_arjun_rohan,
        "python_arjun_vs_jenkins": res_arjun_jenkins,
        "java_arjun_vs_rohan": res_java
    }

def run_cohort_suite():
    print("======================================================================")
    print("   ACADEMIC BENCHMARK 3: COHORT COLLUSION & PATIENT ZERO VALIDATION   ")
    print("======================================================================")
    
    matrix_audit = benchmark_cohort_collusion_matrix()
    temporal_audit = benchmark_patient_zero_temporal_permutations()
    ast_audit = benchmark_code_ast_collusion()
    
    print("\n[SUCCESS] Cohort Collusion & Patient Zero Attribution Suite PASSED.")
    return {
        "benchmark": "Cohort Collusion & Patient Zero",
        "matrix_audit": matrix_audit,
        "temporal_audit": temporal_audit,
        "ast_audit": ast_audit
    }

if __name__ == "__main__":
    report = run_cohort_suite()
    print("\n" + json.dumps(report, indent=2))
