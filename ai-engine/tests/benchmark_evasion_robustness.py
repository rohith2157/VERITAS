"""
Benchmark 2: Adversarial Evasion Robustness Validation
Evaluates defense against:
1. Cyrillic & Greek homoglyph substitutions (evasion via character lookalikes)
2. Zero-width & invisible character injection (evasion via token shattering)
3. Disguised paraphrasing & stylistic obfuscation (evasion via syntax restructuring)
"""

import os
import sys
import json
import unicodedata
import random

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from core.evasion import sanitize_and_audit, HOMOGLYPH_MAP, INVISIBLE_CHARS
from core.winnowing import generate_fingerprints
from core.similarity import compare_documents_1to1
from core.ai_forensics import analyze_ai_writing

BASE_CANONICAL_TEXT = (
    "Distributed consensus algorithms ensure that a cluster of nodes can agree on values "
    "despite network partitions. Raft simplifies consensus by decomposing it into leader "
    "election, log replication, and safety guarantees. A leader is elected via randomized "
    "heartbeat timers to prevent split-vote scenarios. Once established, all client state "
    "transitions flow strictly through the leader before being committed to follower logs. "
    "Append-only logs guarantee consistent state machine replication across all participating replicas."
)

def benchmark_homoglyphs():
    print("\n--- Sub-Benchmark 2A: Homoglyph Attack & Neutralization ---")
    
    # 1. Test coverage of all mapped homoglyphs
    all_homoglyphs = list(HOMOGLYPH_MAP.keys())
    test_str = "".join(all_homoglyphs)
    clean, report = sanitize_and_audit(test_str)
    
    detected_count = report["homoglyph_count"]
    total_homoglyphs = len(all_homoglyphs)
    detection_recall = (detected_count / total_homoglyphs) * 100.0
    
    print(f"  Total mapped homoglyphs: {total_homoglyphs} | Detected: {detected_count} ({detection_recall:.1f}%)")
    assert detected_count == total_homoglyphs, f"Expected {total_homoglyphs} detected, got {detected_count}"
    
    # 2. Substitution rate stress test on canonical text
    sub_rates = [0.05, 0.15, 0.30, 0.50, 0.80, 1.00]
    rate_results = []
    
    # Invert mapping to find latin candidates
    latin_to_homo = {}
    for h, l in HOMOGLYPH_MAP.items():
        latin_to_homo.setdefault(l, []).append(h)
        
    for rate in sub_rates:
        random.seed(42)  # Deterministic seed for reproducible academic benchmark
        tampered_chars = []
        replaced_count = 0
        possible_count = 0
        
        for ch in BASE_CANONICAL_TEXT:
            if ch in latin_to_homo:
                possible_count += 1
                if random.random() < rate:
                    chosen_h = random.choice(latin_to_homo[ch])
                    tampered_chars.append(chosen_h)
                    replaced_count += 1
                    continue
            tampered_chars.append(ch)
            
        tampered_text = "".join(tampered_chars)
        
        # Raw winnowing without evasion defense
        raw_fps_orig, _, _ = generate_fingerprints(BASE_CANONICAL_TEXT, k=5, w=4)
        raw_fps_tamp, _, _ = generate_fingerprints(tampered_text, k=5, w=4)
        raw_common = len({f.hash_val for f in raw_fps_orig}.intersection({f.hash_val for f in raw_fps_tamp}))
        raw_containment = (raw_common / len(raw_fps_orig) * 100) if raw_fps_orig else 0.0
        
        # Veritas sanitized comparison
        veritas_result = compare_documents_1to1(BASE_CANONICAL_TEXT, tampered_text, k=5, w=4)
        sanitized_containment = veritas_result["containment_a_in_b"]
        audit = veritas_result["document_stats"]["doc_b"]["integrity"]
        
        rate_results.append({
            "target_rate": rate,
            "injected_homoglyphs": replaced_count,
            "detected_homoglyphs": audit["homoglyph_count"],
            "raw_similarity_bypassed": round(raw_containment, 2),
            "veritas_similarity_recovered": sanitized_containment,
            "recovery_delta": round(sanitized_containment - raw_containment, 2),
            "integrity_score": audit["integrity_score"]
        })
        
        print(f"  Rate {rate*100:5.1f}% | Injected: {replaced_count:3d} | Detected: {audit['homoglyph_count']:3d} | "
              f"Raw Score: {raw_containment:5.1f}% -> Recovered: {sanitized_containment:5.1f}% (Delta +{sanitized_containment - raw_containment:5.1f}%)")
        
        # Academic assert: Sanitized recovery must remain >= 95% regardless of homoglyph injection
        assert sanitized_containment >= 95.0, f"Expected recovered similarity >= 95%, got {sanitized_containment}"
        assert audit["homoglyph_count"] == replaced_count, f"Detection mismatch: injected {replaced_count}, found {audit['homoglyph_count']}"

    return {
        "homoglyph_catalog_size": total_homoglyphs,
        "catalog_recall_pct": detection_recall,
        "stress_test_rates": rate_results
    }

def benchmark_zero_width_spaces():
    print("\n--- Sub-Benchmark 2B: Zero-Width Space & Invisible Character Injection ---")
    
    char_results = []
    
    # 1. Test each of the 8 invisible character types individually
    for ch, name in sorted(INVISIBLE_CHARS.items()):
        # Inject invisible char inside words: "D<ZW>is<ZW>tri<ZW>bu<ZW>ted"
        injected = f"D{ch}is{ch}tri{ch}bu{ch}ted con{ch}sen{ch}sus al{ch}go{ch}rithms"
        clean, report = sanitize_and_audit(injected)
        
        count = report["invisible_char_count"]
        expected = 8
        assert count == expected, f"Expected {expected} {name}, got {count}"
        assert ch not in clean, f"Clean text still contains {name}"
        assert "Distributed consensus algorithms" == clean
        
        char_results.append({
            "name": name,
            "codepoint": f"U+{ord(ch):04X}",
            "injected": expected,
            "detected": count,
            "stripped_cleanly": True
        })
        print(f"  [{name:35s}] Injected: {expected} | Detected: {count} | Sanitized: 100%")

    # 2. Comprehensive token shattering attack on canonical text
    # Insert ZWSP into every word
    shattered_words = []
    total_zw_injected = 0
    for word in BASE_CANONICAL_TEXT.split():
        if len(word) > 3:
            mid = len(word) // 2
            shattered = word[:mid] + "\u200b" + word[mid:]
            total_zw_injected += 1
            shattered_words.append(shattered)
        else:
            shattered_words.append(word)
            
    shattered_text = " ".join(shattered_words)
    
    # Raw comparison without defense
    raw_fps_orig, _, _ = generate_fingerprints(BASE_CANONICAL_TEXT, k=5, w=4)
    raw_fps_shat, _, _ = generate_fingerprints(shattered_text, k=5, w=4)
    raw_common = len({f.hash_val for f in raw_fps_orig}.intersection({f.hash_val for f in raw_fps_shat}))
    raw_score = (raw_common / len(raw_fps_orig) * 100) if raw_fps_orig else 0.0
    
    # Veritas defended comparison
    veritas_comp = compare_documents_1to1(BASE_CANONICAL_TEXT, shattered_text, k=5, w=4)
    recov_score = veritas_comp["containment_a_in_b"]
    audit = veritas_comp["document_stats"]["doc_b"]["integrity"]
    
    print(f"\n  Massive Token-Shattering Attack:")
    print(f"    Injected ZWSP: {total_zw_injected} | Detected: {audit['invisible_char_count']}")
    print(f"    Raw Winnowing (Unprotected): {raw_score:.2f}% (Evasion Succeeded)")
    print(f"    Veritas Winnowing (Protected): {recov_score:.2f}% (Evasion Defeated)")
    print(f"    Integrity Penalty Score: {audit['integrity_score']}/100")
    
    assert raw_score < 30.0, f"Expected raw winnowing to be blinded, got {raw_score}%"
    assert recov_score >= 95.0, f"Expected veritas recovery >= 95%, got {recov_score}%"
    
    return {
        "individual_characters_tested": char_results,
        "token_shattering_attack": {
            "injected_zw_chars": total_zw_injected,
            "detected_zw_chars": audit["invisible_char_count"],
            "unprotected_similarity": round(raw_score, 2),
            "veritas_protected_similarity": recov_score,
            "integrity_score": audit["integrity_score"]
        }
    }

def benchmark_disguised_paraphrasing():
    print("\n--- Sub-Benchmark 2C: Disguised Paraphrasing & Forensic Multi-Modal Analysis ---")
    
    # Read actual paraphrased essay from sample_documents
    sample_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..', 'data', 'sample_documents'))
    paraphrased_path = os.path.join(sample_dir, "Essay_Paraphrased_StudentC.txt")
    with open(paraphrased_path, 'r', encoding='utf-8') as f:
        paraphrased_text = f.read().strip()
        
    levels = [
        ("Level 0: Verbatim Copy", BASE_CANONICAL_TEXT),
        ("Level 1: Light Synonym Swap", 
         BASE_CANONICAL_TEXT.replace("ensure", "guarantee").replace("simplifies", "streamlines").replace("prevent", "avoid")),
        ("Level 2: Structural Clause Reordering",
         "Consensus protocols in distributed systems enable agreement despite network partitions. "
         "Raft eases consensus through leader election, log replication, and safety guarantees. "
         "Randomized heartbeat timers elect leaders to avoid split votes. "
         "Client state transitions flow through leaders before being committed to follower logs. "
         "Append-only logs assure state machine replication across replicas."),
        ("Level 3: Disguised Paraphrase (Student C)", paraphrased_text)
    ]
    
    paraphrase_results = []
    for label, text in levels:
        comp_k3 = compare_documents_1to1(BASE_CANONICAL_TEXT, text, k=3, w=3)
        comp_k5 = compare_documents_1to1(BASE_CANONICAL_TEXT, text, k=5, w=4)
        comp_k7 = compare_documents_1to1(BASE_CANONICAL_TEXT, text, k=7, w=5)
        
        forensics = analyze_ai_writing(text)
        
        entry = {
            "tier": label,
            "winnowing_k3_containment": comp_k3["containment_a_in_b"],
            "winnowing_k5_containment": comp_k5["containment_a_in_b"],
            "winnowing_k7_containment": comp_k7["containment_a_in_b"],
            "forensics_ai_probability": forensics["ai_probability"],
            "forensics_perplexity": forensics["metrics"]["perplexity_index"],
            "forensics_burstiness_cv": forensics["metrics"]["coefficient_of_variation"],
            "forensics_verdict": forensics["verdict"]
        }
        paraphrase_results.append(entry)
        
        print(f"  [{label}]")
        print(f"    Winnowing Containment: k=3: {comp_k3['containment_a_in_b']:5.1f}% | k=5: {comp_k5['containment_a_in_b']:5.1f}% | k=7: {comp_k7['containment_a_in_b']:5.1f}%")
        print(f"    Forensics: AI Prob={forensics['ai_probability']:4.1f}% | Burstiness CV={forensics['metrics']['coefficient_of_variation']:4.2f} | Perplexity={forensics['metrics']['perplexity_index']:4.1f} | Verdict={forensics['verdict']}")

    return paraphrase_results

def run_evasion_suite():
    print("======================================================================")
    print("   ACADEMIC BENCHMARK 2: ADVERSARIAL EVASION ROBUSTNESS AUDIT         ")
    print("======================================================================")
    
    res_a = benchmark_homoglyphs()
    res_b = benchmark_zero_width_spaces()
    res_c = benchmark_disguised_paraphrasing()
    
    print("\n[SUCCESS] All Adversarial Evasion Benchmarks Passed.")
    return {
        "benchmark": "Adversarial Evasion Robustness",
        "homoglyph_audit": res_a,
        "zero_width_audit": res_b,
        "paraphrasing_audit": res_c
    }

if __name__ == "__main__":
    report = run_evasion_suite()
    print("\n" + json.dumps(report, indent=2))
