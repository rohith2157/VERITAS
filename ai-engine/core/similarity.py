"""
Similarity & Diff Engine
Calculates Jaccard & Containment metrics, merges contiguous matching spans,
and outputs character-level highlight segments for split-screen comparison.
"""

from typing import Dict, List, Tuple, Optional
from core.evasion import sanitize_and_audit
from core.winnowing import generate_fingerprints, Fingerprint


def get_color_tier(similarity_percentage: float) -> Dict[str, str]:
    """
    Returns the standard 5-level integrity color tier based on similarity percentage.
    """
    if similarity_percentage <= 0.0:
        return {"code": "BLUE", "hex": "#3B82F6", "label": "No Similarity Detected (0%)"}
    elif similarity_percentage < 25.0:
        return {"code": "GREEN", "hex": "#10B981", "label": "Low / Natural Similarity (1-24%)"}
    elif similarity_percentage < 50.0:
        return {"code": "YELLOW", "hex": "#F59E0B", "label": "Moderate Similarity (25-49%)"}
    elif similarity_percentage < 75.0:
        return {"code": "ORANGE", "hex": "#F97316", "label": "Significant Similarity (50-74%)"}
    else:
        return {"code": "RED", "hex": "#EF4444", "label": "High / Critical Similarity (75-100%)"}


def merge_contiguous_spans(matches: List[Dict], max_gap: int = 40) -> List[Dict]:
    """
    Merges matching segments that are adjacent or separated by only a small gap (e.g. stop words)
    into clean, unified highlights for the user interface.
    """
    if not matches:
        return []

    # Sort primarily by source start position
    sorted_matches = sorted(matches, key=lambda x: x["start_a"])
    merged = []
    current = dict(sorted_matches[0])

    for nxt in sorted_matches[1:]:
        # If the next span overlaps or is within max_gap characters in Doc A
        if nxt["start_a"] <= current["end_a"] + max_gap:
            current["end_a"] = max(current["end_a"], nxt["end_a"])
            current["end_b"] = max(current["end_b"], nxt["end_b"])
            current["match_count"] = current.get("match_count", 1) + nxt.get("match_count", 1)
        else:
            merged.append(current)
            current = dict(nxt)

    merged.append(current)
    return merged


def compare_documents_1to1(
    text_a: str,
    text_b: str,
    title_a: str = "Document A",
    title_b: str = "Document B",
    k: int = 5,
    w: int = 4,
    exclude_quotes: bool = True,
    exclude_bibliography: bool = True
) -> Dict:
    """
    Executes a high-precision 1-to-1 comparison between two documents.
    Returns:
    - Overall similarity percentage (Jaccard and Containment)
    - Matched segment coordinates (start and end offsets for both documents)
    - Integrity audit reports for both documents (homoglyphs, invisible chars)
    - Matched text snippets
    """
    # 1. Audit and sanitize both documents against adversarial tricks
    clean_a, audit_a = sanitize_and_audit(text_a)
    clean_b, audit_b = sanitize_and_audit(text_b)

    # 2. Extract winnowing fingerprints
    fps_a, tokens_a, exclusions_a = generate_fingerprints(
        clean_a, k=k, w=w, exclude_quotes=exclude_quotes, exclude_bibliography=exclude_bibliography
    )
    fps_b, tokens_b, exclusions_b = generate_fingerprints(
        clean_b, k=k, w=w, exclude_quotes=exclude_quotes, exclude_bibliography=exclude_bibliography
    )

    hashes_a = {fp.hash_val for fp in fps_a}
    hashes_b = {fp.hash_val for fp in fps_b}

    common_hashes = hashes_a.intersection(hashes_b)

    # 3. Calculate Similarity Metrics
    total_unique_hashes = len(hashes_a.union(hashes_b))
    jaccard_similarity = (len(common_hashes) / total_unique_hashes) if total_unique_hashes > 0 else 0.0

    # Containment: proportion of Doc A found in Doc B
    containment_a_in_b = (len(common_hashes) / len(hashes_a)) if len(hashes_a) > 0 else 0.0
    containment_b_in_a = (len(common_hashes) / len(hashes_b)) if len(hashes_b) > 0 else 0.0

    # Primary similarity score is containment of A in B (standard for submission checking)
    primary_similarity = round(containment_a_in_b * 100, 2)

    # 4. Map matching fingerprints back to character coordinates
    # Index Doc B fingerprints by hash for O(1) lookup
    fps_b_by_hash: Dict[int, List[Fingerprint]] = {}
    for fp in fps_b:
        fps_b_by_hash.setdefault(fp.hash_val, []).append(fp)

    raw_matches = []
    for fp_a in fps_a:
        if fp_a.hash_val in fps_b_by_hash:
            for fp_b in fps_b_by_hash[fp_a.hash_val]:
                raw_matches.append({
                    "start_a": fp_a.start_char,
                    "end_a": fp_a.end_char,
                    "start_b": fp_b.start_char,
                    "end_b": fp_b.end_char,
                    "hash": fp_a.hash_val,
                    "match_count": 1
                })

    # Merge contiguous spans to form clean highlighted segments
    highlight_segments = merge_contiguous_spans(raw_matches, max_gap=50)

    # Attach the actual matched text excerpt from Doc A
    for seg in highlight_segments:
        seg["snippet_a"] = text_a[seg["start_a"]:seg["end_a"]]
        seg["snippet_b"] = text_b[seg["start_b"]:seg["end_b"]]

    color_tier = get_color_tier(primary_similarity)

    return {
        "title_a": title_a,
        "title_b": title_b,
        "similarity_score": primary_similarity,
        "jaccard_score": round(jaccard_similarity * 100, 2),
        "containment_a_in_b": round(containment_a_in_b * 100, 2),
        "containment_b_in_a": round(containment_b_in_a * 100, 2),
        "color_tier": color_tier,
        "total_matches_found": len(highlight_segments),
        "matched_segments": highlight_segments,
        "document_stats": {
            "doc_a": {
                "char_count": len(text_a),
                "word_count": len(tokens_a),
                "fingerprint_count": len(fps_a),
                "integrity": audit_a
            },
            "doc_b": {
                "char_count": len(text_b),
                "word_count": len(tokens_b),
                "fingerprint_count": len(fps_b),
                "integrity": audit_b
            }
        },
        "exclusions": {
            "doc_a": exclusions_a,
            "doc_b": exclusions_b
        }
    }

