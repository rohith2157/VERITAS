"""
Benchmark 4: Winnowing False-Positive and False-Negative Rate Academic Validator
Rigorously evaluates the Schleimer-Wilkerson-Aiken (2003) winnowing implementation:
1. FPR and FNR across shingle sizes k in [3, 4, 5, 7, 10] and window sizes w in [2, 4, 8, 12]
2. Threshold sensitivity analysis (theta in 15%, 25%, 40%, 60%, 75%)
3. Domain terminology false-positive stress test (independently authored papers on the same topic)
4. Academic exclusion filter efficacy (quotation & bibliography masking)
"""

import os
import sys
import json
import math

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from core.similarity import compare_documents_1to1
from core.winnowing import generate_fingerprints

# Ground Truth Benchmark Dataset Construction
BENCHMARK_PAIRS = [
    # --- POSITIVE PAIRS (True Plagiarism / Collusion: y = 1) ---
    {
        "id": "POS_01_Verbatim",
        "label": 1,
        "type": "Verbatim Duplicate",
        "doc_a": "Distributed consensus algorithms ensure node clusters reach agreement despite network partitions. Raft decomposes consensus into leader election, log replication, and safety guarantees.",
        "doc_b": "Distributed consensus algorithms ensure node clusters reach agreement despite network partitions. Raft decomposes consensus into leader election, log replication, and safety guarantees.",
    },
    {
        "id": "POS_02_HighOverlap",
        "label": 1,
        "type": "High Overlap (80%)",
        "doc_a": "Distributed consensus algorithms ensure that a cluster of nodes can agree on values despite network partitions. Raft simplifies consensus by decomposing it into leader election, log replication, and safety guarantees. A leader is elected via randomized heartbeat timers.",
        "doc_b": "Distributed consensus algorithms ensure that a cluster of nodes can agree on values despite network partitions. Raft simplifies consensus by decomposing it into leader election, log replication, and safety guarantees. A leader is chosen through timers.",
    },
    {
        "id": "POS_03_HomoglyphCheat",
        "label": 1,
        "type": "Homoglyph Obfuscated",
        "doc_a": "A leader is elected via randomized heartbeat timers to prevent split-vote scenarios. Once established, all client state transitions flow strictly through the leader before being committed to follower logs.",
        "doc_b": "A l\u0435ad\u0435r is \u0435l\u0435ct\u0435d via r\u0430ndomiz\u0435d h\u0435artb\u0435at tim\u0435rs to pr\u0435v\u0435nt split-vot\u0435 sc\u0435n\u0430rios. Onc\u0435 \u0435st\u0430blish\u0435d, \u0430ll cli\u0435nt st\u0430t\u0435 tr\u0430nsitions flow strictly through th\u0435 l\u0435ad\u0435r b\u0435for\u0435 b\u0435ing committ\u0435d to follow\u0435r logs.",
    },
    {
        "id": "POS_04_ZeroWidthInjection",
        "label": 1,
        "type": "Zero-Width Space Injection",
        "doc_a": "Append-only logs guarantee consistent state machine replication across all participating replicas in the distributed cluster.",
        "doc_b": "App\u200bend-on\u200bly lo\u200bgs guar\u200bantee cons\u200bistent sta\u200bte mach\u200bine repl\u200bication acr\u200boss a\u200bll parti\u200bcipating repl\u200bicas in the dist\u200bributed clus\u200bter.",
    },
    {
        "id": "POS_05_CollageSpliced",
        "label": 1,
        "type": "Spliced / Patchwork Plagiarism",
        "doc_a": "Distributed consensus algorithms ensure that a cluster of nodes can agree on values despite network partitions. Raft simplifies consensus by decomposing it into leader election, log replication, and safety guarantees. A leader is elected via randomized heartbeat timers to prevent split-vote scenarios.",
        "doc_b": "In modern data architecture, reliability is paramount. Distributed consensus algorithms ensure that a cluster of nodes can agree on values despite network partitions. Network engineering plays a vital role. A leader is elected via randomized heartbeat timers to prevent split-vote scenarios.",
    },
    {
        "id": "POS_06_LightParaphrase",
        "label": 1,
        "type": "Light Synonym Paraphrase",
        "doc_a": "Distributed systems enable horizontal scaling by dividing compute workloads across multiple nodes. Consensus algorithms like Raft and Paxos ensure fault tolerance and data consistency across networks. Each node maintains an append-only log of state transitions.",
        "doc_b": "Distributed systems enable horizontal scaling by dividing compute workloads across multiple nodes. Consensus protocols like Raft and Paxos assure fault tolerance and data consistency across networks. Each node maintains an append-only log of state transitions.",
    },

    # --- NEGATIVE PAIRS (True Independent / Different: y = 0) ---
    {
        "id": "NEG_01_SameDomainIndependent",
        "label": 0,
        "type": "Same Domain Independent (Raft vs Paxos)",
        "doc_a": "Raft is an understandable consensus algorithm designed by Ongaro and Ousterhout. It relies on a strong leader to manage log replication, employing randomized timers for election timeouts to prevent split votes.",
        "doc_b": "Leslie Lamport formulated the Paxos algorithm based on synod decree consensus. The protocol progresses in two discrete stages consisting of Prepare requests followed by Accept rounds without designated persistent leaders.",
    },
    {
        "id": "NEG_02_SameTopicDifferentAuthors",
        "label": 0,
        "type": "Same Topic Independent (Both about Raft)",
        "doc_a": "Raft achieves fault tolerance through five core states: follower, candidate, and leader. When a follower suspects failure due to missing heartbeats, it transitions to candidate, increments term, and requests votes.",
        "doc_b": "Log compaction in Raft prevents unbounded storage growth on cluster members. Nodes periodically snapshot their state machine state, truncating superseded committed entries up through the snapshot index.",
    },
    {
        "id": "NEG_03_CrossDomainOrthogonal",
        "label": 0,
        "type": "Cross Domain (Distributed Systems vs Biology)",
        "doc_a": "Distributed consensus algorithms ensure that a cluster of nodes can agree on values despite network partitions. Raft simplifies consensus by decomposing it into leader election, log replication, and safety guarantees.",
        "doc_b": "Photosynthesis represents the biological mechanism where photosynthetic organisms convert solar irradiance into chemical energy. Chlorophyll molecules capture photon wavelengths within thylakoid membranes.",
    },
    {
        "id": "NEG_04_DifferentDiscipline",
        "label": 0,
        "type": "Different Discipline (Quantum Computing vs Economics)",
        "doc_a": "Quantum computing utilizes superposition and entanglement across superconducting qubits to achieve computational advantages over classical von Neumann computer architectures.",
        "doc_b": "Microeconomic market equilibrium occurs at the intersection of aggregate consumer demand curves and marginal cost supply curves in competitive commodity exchanges.",
    },
    {
        "id": "NEG_05_IndependentCodeTheory",
        "label": 0,
        "type": "Independent CS Theory (Compilers vs Graphics)",
        "doc_a": "Context-free grammars specify syntactic structure through production rules. Shift-reduce LR parsers maintain execution stacks to resolve shift-reduce conflicts efficiently.",
        "doc_b": "Ray tracing algorithms calculate global illumination by simulating photon trajectory interactions through bidirectional scattering distribution functions.",
    },
    {
        "id": "NEG_06_QuotedAcademicCitations",
        "label": 0,
        "type": "Cited Quotations & References Section",
        "doc_a": "Originality in distributed architecture is crucial. As stated in literature: \"Distributed consensus algorithms ensure that a cluster of nodes can agree on values despite network partitions.\" We explore this further.\n\nReferences:\n1. Ongaro, D. and Ousterhout, J., In Search of an Understandable Consensus Algorithm, USENIX ATC 2014.",
        "doc_b": "Recent research emphasizes protocol clarity. The seminal paper notes: \"Distributed consensus algorithms ensure that a cluster of nodes can agree on values despite network partitions.\" Our analysis investigates performance.\n\nReferences:\n1. Ongaro, D. and Ousterhout, J., In Search of an Understandable Consensus Algorithm, USENIX ATC 2014.",
    }
]

def evaluate_classifier_metrics(pairs, k=5, w=4, threshold=30.0, exclude_quotes=True, exclude_bibliography=True):
    tp = 0
    fp = 0
    tn = 0
    fn = 0
    
    pair_details = []
    for p in pairs:
        res = compare_documents_1to1(
            p["doc_a"], p["doc_b"], 
            k=k, w=w, 
            exclude_quotes=exclude_quotes, 
            exclude_bibliography=exclude_bibliography
        )
        score = res["similarity_score"]
        pred = 1 if score >= threshold else 0
        actual = p["label"]
        
        if pred == 1 and actual == 1:
            tp += 1
            verdict = "TP"
        elif pred == 1 and actual == 0:
            fp += 1
            verdict = "FP"
        elif pred == 0 and actual == 0:
            tn += 1
            verdict = "TN"
        else:
            fn += 1
            verdict = "FN"
            
        pair_details.append({
            "id": p["id"],
            "type": p["type"],
            "actual": actual,
            "predicted": pred,
            "similarity_score": score,
            "verdict": verdict
        })
        
    total_pos = tp + fn
    total_neg = tn + fp
    
    fpr = (fp / total_neg) if total_neg > 0 else 0.0
    fnr = (fn / total_pos) if total_pos > 0 else 0.0
    precision = (tp / (tp + fp)) if (tp + fp) > 0 else 1.0
    recall = (tp / (tp + fn)) if (tp + fn) > 0 else 0.0
    specificity = (tn / total_neg) if total_neg > 0 else 1.0
    accuracy = (tp + tn) / len(pairs)
    f1 = (2 * precision * recall / (precision + recall)) if (precision + recall) > 0 else 0.0
    
    return {
        "k": k,
        "w": w,
        "threshold": threshold,
        "exclude_quotes": exclude_quotes,
        "exclude_bibliography": exclude_bibliography,
        "tp": tp,
        "fp": fp,
        "tn": tn,
        "fn": fn,
        "FPR": round(fpr, 4),
        "FNR": round(fnr, 4),
        "precision": round(precision, 4),
        "recall": round(recall, 4),
        "specificity": round(specificity, 4),
        "accuracy": round(accuracy, 4),
        "f1_score": round(f1, 4),
        "pair_details": pair_details
    }

def benchmark_parameter_grid():
    print("\n--- Sub-Benchmark 4A: Winnowing Parameter Grid (k in [3..10], w in [2..12]) ---")
    k_values = [3, 4, 5, 7, 10]
    w_values = [2, 4, 8, 12]
    threshold = 30.0
    
    grid_results = []
    print(f"{'k':>3} {'w':>3} | {'TP':>3} {'FP':>3} {'TN':>3} {'FN':>3} | {'FPR':>7} {'FNR':>7} | {'Precision':>9} {'Recall':>7} {'F1':>7} {'Accuracy':>8}")
    print("-" * 75)
    
    for k in k_values:
        for w in w_values:
            m = evaluate_classifier_metrics(BENCHMARK_PAIRS, k=k, w=w, threshold=threshold)
            grid_results.append(m)
            print(f"{k:3d} {w:3d} | {m['tp']:3d} {m['fp']:3d} {m['tn']:3d} {m['fn']:3d} | {m['FPR']*100:6.1f}% {m['FNR']*100:6.1f}% | {m['precision']*100:8.1f}% {m['recall']*100:6.1f}% {m['f1_score']:6.3f} {m['accuracy']*100:7.1f}%")

    # Verify that default config (k=5, w=4) achieves optimal balance:
    default_res = next(r for r in grid_results if r["k"] == 5 and r["w"] == 4)
    assert default_res["FPR"] == 0.0, f"Expected 0% FPR for default k=5, w=4, got {default_res['FPR']}"
    assert default_res["FNR"] == 0.0, f"Expected 0% FNR for default k=5, w=4, got {default_res['FNR']}"
    assert default_res["accuracy"] == 1.0, f"Expected 100% accuracy, got {default_res['accuracy']}"
    
    return grid_results

def benchmark_threshold_sensitivity():
    print("\n--- Sub-Benchmark 4B: Detection Threshold Sensitivity (theta in [15%..75%]) ---")
    thresholds = [15.0, 25.0, 40.0, 50.0, 60.0, 75.0]
    thresh_results = []
    
    print(f"{'Threshold':>10} | {'TP':>3} {'FP':>3} {'TN':>3} {'FN':>3} | {'FPR':>7} {'FNR':>7} | {'Precision':>9} {'Recall':>7} {'F1':>7}")
    print("-" * 65)
    
    for th in thresholds:
        m = evaluate_classifier_metrics(BENCHMARK_PAIRS, k=5, w=4, threshold=th)
        thresh_results.append(m)
        print(f"{th:9.1f}% | {m['tp']:3d} {m['fp']:3d} {m['tn']:3d} {m['fn']:3d} | {m['FPR']*100:6.1f}% {m['FNR']*100:6.1f}% | {m['precision']*100:8.1f}% {m['recall']*100:6.1f}% {m['f1_score']:6.3f}")

    return thresh_results

def benchmark_exclusion_filters():
    print("\n--- Sub-Benchmark 4C: Academic Exclusions Efficacy (Quotes & Bibliography) ---")
    quoted_pair = [p for p in BENCHMARK_PAIRS if p["id"] == "NEG_06_QuotedAcademicCitations"]
    
    # 1. With Exclusions (Veritas Default)
    with_exc = evaluate_classifier_metrics(quoted_pair, k=5, w=4, threshold=20.0, exclude_quotes=True, exclude_bibliography=True)
    score_with = with_exc["pair_details"][0]["similarity_score"]
    
    # 2. Without Exclusions (Naive Detection)
    without_exc = evaluate_classifier_metrics(quoted_pair, k=5, w=4, threshold=20.0, exclude_quotes=False, exclude_bibliography=False)
    score_without = without_exc["pair_details"][0]["similarity_score"]
    
    print(f"  Quoted Citation & References Pair:")
    print(f"    Without Exclusions (Naive): Similarity={score_without:.1f}% -> Verdict: {without_exc['pair_details'][0]['verdict']} (False Positive Triggered!)")
    print(f"    With Exclusions (Veritas): Similarity={score_with:.1f}% -> Verdict: {with_exc['pair_details'][0]['verdict']} (Clean Pass - True Negative!)")
    
    assert without_exc["fp"] == 1, "Expected naive detector to generate false positive on unmasked citation"
    assert with_exc["fp"] == 0, "Expected Veritas exclusion filters to eliminate quotation false positive"
    assert with_exc["tn"] == 1, "Expected True Negative classification with exclusions"

    return {
        "quoted_pair_score_without_exclusions": score_without,
        "quoted_pair_score_with_exclusions": score_with,
        "false_positive_eliminated": True
    }

def run_winnowing_rates_suite():
    print("======================================================================")
    print("   ACADEMIC BENCHMARK 4: WINNOWING FPR & FNR DETECTION RATES          ")
    print("======================================================================")
    
    grid = benchmark_parameter_grid()
    sensitivity = benchmark_threshold_sensitivity()
    exclusions = benchmark_exclusion_filters()
    
    print("\n[SUCCESS] Winnowing False-Positive and False-Negative Rate Benchmark PASSED.")
    return {
        "benchmark": "Winnowing FPR & FNR Detection Rates",
        "optimal_configuration": {
            "k": 5,
            "w": 4,
            "threshold": 30.0,
            "FPR": 0.0,
            "FNR": 0.0,
            "precision": 1.0,
            "recall": 1.0,
            "f1_score": 1.0,
            "accuracy": 1.0
        },
        "parameter_grid": grid,
        "threshold_sensitivity": sensitivity,
        "exclusions_impact": exclusions
    }

if __name__ == "__main__":
    report = run_winnowing_rates_suite()
    print("\n" + json.dumps(report, indent=2))
