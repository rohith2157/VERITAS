"""
Veritas Stylometric Author Fingerprinting Module
Calculates the subconscious 'Writeprint' of an author:
1. Yule's K characteristic (Lexical Richness)
2. Punctuation Distribution Vectors
3. Function Word Distribution
4. Sentence Length Burstiness & Variance
5. Student Baseline Anomaly Detection (Contract Cheating Defense)
"""

import math
import re
from typing import Dict, List, Any, Optional
from collections import Counter


# Standard English function words (closed-class words that capture subconscious style)
FUNCTION_WORDS = {
    "the", "and", "a", "to", "of", "in", "i", "is", "that", "it", "on", "you", 
    "this", "for", "but", "with", "are", "have", "be", "at", "or", "as", "was", 
    "so", "if", "out", "not", "we", "they", "my", "all", "he", "she", "his", 
    "her", "their", "our", "which", "by", "from", "up", "about", "into", "than", 
    "then", "can", "only", "other", "its", "also", "after", "use", "two", "how", 
    "our", "work", "first", "well", "way", "even", "new", "want", "because", 
    "any", "these", "give", "day", "most", "us"
}

PUNCTUATION_MARKS = [',', ';', ':', '-', '(', ')', '"', "'", '!', '?']


def calculate_yules_k(words: List[str]) -> float:
    """
    Calculates Yule's K characteristic of lexical richness:
    K = 10^4 * ( (sum_{i} i^2 * V_i) - N ) / N^2
    where N is total word count, and V_i is the number of words occurring exactly i times.
    Stable across varying document lengths.
    """
    n = len(words)
    if n <= 1:
        return 0.0

    counts = Counter(w.lower() for w in words)
    # m1 = sum(counts.values()) which equals n
    # m2 = sum(count^2 for count in counts.values())
    m2 = sum(c * c for c in counts.values())

    # Yule's K formula
    k = 10000.0 * (m2 - n) / (n * n)
    return max(0.0, round(k, 2))


def calculate_punctuation_vector(text: str) -> Dict[str, float]:
    """
    Calculates normalized punctuation frequency per 1000 characters.
    """
    total_chars = max(1, len(text))
    vector = {}
    for mark in PUNCTUATION_MARKS:
        count = text.count(mark)
        # frequency per 1000 chars
        vector[mark] = round((count / total_chars) * 1000.0, 2)
    return vector


def calculate_function_words_vector(words: List[str]) -> Dict[str, float]:
    """
    Calculates normalized frequency of top function words per 1000 words.
    """
    total_words = max(1, len(words))
    counts = Counter(w.lower() for w in words)
    vector = {}
    for fw in sorted(list(FUNCTION_WORDS)[:20]):
        vector[fw] = round((counts.get(fw, 0) / total_words) * 1000.0, 2)
    return vector


def analyze_sentence_burstiness(sentences: List[str]) -> Dict[str, float]:
    """
    Measures sentence length variation (Burstiness):
    Mean length, Standard Deviation, and Coefficient of Variation.
    """
    if not sentences:
        return {"mean_length": 0.0, "std_dev": 0.0, "coefficient_of_variation": 0.0}

    lengths = [len(s.split()) for s in sentences if s.strip()]
    if not lengths:
        return {"mean_length": 0.0, "std_dev": 0.0, "coefficient_of_variation": 0.0}

    mean = sum(lengths) / len(lengths)
    variance = sum((l - mean) ** 2 for l in lengths) / len(lengths)
    std_dev = math.sqrt(variance)
    cv = (std_dev / mean) if mean > 0 else 0.0

    return {
        "mean_length": round(mean, 2),
        "std_dev": round(std_dev, 2),
        "coefficient_of_variation": round(cv, 2)
    }


def extract_writeprint(text: str) -> Dict[str, Any]:
    """
    Extracts the complete subconscious Writeprint feature vector from a text document.
    """
    # Tokenize words
    words = re.findall(r'\b[a-zA-Z]+\b', text)
    # Sentence splitter
    sentences = re.split(r'[.!?]+', text)
    sentences = [s.strip() for s in sentences if len(s.strip()) > 3]

    yules_k = calculate_yules_k(words)
    punct_vec = calculate_punctuation_vector(text)
    fw_vec = calculate_function_words_vector(words)
    burstiness = analyze_sentence_burstiness(sentences)

    # Vocabulary Richness: Type-Token Ratio (TTR)
    unique_words = len(set(w.lower() for w in words))
    ttr = round(unique_words / max(1, len(words)), 3)

    return {
        "word_count": len(words),
        "sentence_count": len(sentences),
        "yules_k": yules_k,
        "type_token_ratio": ttr,
        "burstiness": burstiness,
        "punctuation_vector": punct_vec,
        "top_function_words": fw_vec,
        "composite_fingerprint_hash": f"WP-{yules_k:.1f}-{burstiness['std_dev']:.1f}-{ttr:.2f}"
    }


def detect_stylometric_anomaly(
    current_text: str,
    baseline_submissions: Optional[List[str]] = None
) -> Dict[str, Any]:
    """
    Compares a submitted text against a student's historical baseline profile.
    Flags sudden spikes in lexical diversity, punctuation shift, or syntax variance (Contract Cheating).
    """
    current_wp = extract_writeprint(current_text)

    if not baseline_submissions or len(baseline_submissions) == 0:
        # Default baseline simulation if historical submissions not present
        is_synthetic_suspicious = (
            current_wp['burstiness']['coefficient_of_variation'] < 0.25 and 
            current_wp['type_token_ratio'] > 0.65
        )
        return {
            "current_writeprint": current_wp,
            "has_historical_baseline": False,
            "anomaly_detected": is_synthetic_suspicious,
            "anomaly_confidence": 72.5 if is_synthetic_suspicious else 12.0,
            "anomaly_type": "SYNTHETIC_HOMOGENEITY" if is_synthetic_suspicious else "NONE",
            "explanation": (
                "Document exhibits artificially low sentence variance alongside high lexical density, "
                "characteristic of synthetic paraphrasers." if is_synthetic_suspicious else 
                "No prior baseline provided; within standard organic writing variance."
            )
        }

    # Aggregate baseline Writeprint
    baseline_k_vals = []
    baseline_std_vals = []
    baseline_ttr_vals = []
    baseline_mean_len_vals = []

    for b in baseline_submissions:
        wp = extract_writeprint(b)
        baseline_k_vals.append(wp['yules_k'])
        baseline_std_vals.append(wp['burstiness']['std_dev'])
        baseline_ttr_vals.append(wp['type_token_ratio'])
        baseline_mean_len_vals.append(wp['burstiness']['mean_length'])

    avg_baseline_k = sum(baseline_k_vals) / len(baseline_k_vals)
    avg_baseline_std = sum(baseline_std_vals) / len(baseline_std_vals)
    avg_baseline_ttr = sum(baseline_ttr_vals) / len(baseline_ttr_vals)
    avg_baseline_mean_len = sum(baseline_mean_len_vals) / len(baseline_mean_len_vals)

    # Calculate deviations
    k_diff = abs(current_wp['yules_k'] - avg_baseline_k)
    std_diff = abs(current_wp['burstiness']['std_dev'] - avg_baseline_std)
    ttr_diff = abs(current_wp['type_token_ratio'] - avg_baseline_ttr)
    mean_len_diff = abs(current_wp['burstiness']['mean_length'] - avg_baseline_mean_len)

    # Anomaly score calculation
    anomaly_score = 0.0
    flags = []

    if mean_len_diff > 6.0:
        anomaly_score += 45.0
        flags.append(f"Major shift in sentence length cadence (Δ {mean_len_diff:.1f} words)")
    if ttr_diff > 0.18:
        anomaly_score += 35.0
        flags.append(f"Dramatic vocabulary shift (TTR changed by {ttr_diff:.2f})")
    if k_diff > 20.0:
        anomaly_score += 30.0
        flags.append(f"Sudden shift in Yule's K characteristic (Δ {k_diff:.1f})")
    if std_diff > 3.0:
        anomaly_score += 25.0
        flags.append(f"Major rhythm and burstiness alteration (Δ std dev {std_diff:.1f})")

    anomaly_detected = anomaly_score >= 45.0

    return {
        "current_writeprint": current_wp,
        "baseline_summary": {
            "submissions_analyzed": len(baseline_submissions),
            "avg_yules_k": round(avg_baseline_k, 2),
            "avg_std_dev": round(avg_baseline_std, 2),
            "avg_type_token_ratio": round(avg_baseline_ttr, 3)
        },
        "anomaly_detected": anomaly_detected,
        "anomaly_confidence": min(99.0, round(anomaly_score, 1)),
        "anomaly_type": "CONTRACT_GHOSTWRITING_SUSPECTED" if anomaly_detected else "CONSISTENT_AUTHOR",
        "flags": flags,
        "explanation": (
            f"Submission deviates significantly from student's historical writing habits ({', '.join(flags)})."
            if anomaly_detected else
            "Submission stylistic features are consistent with student's historical profile."
        )
    }
