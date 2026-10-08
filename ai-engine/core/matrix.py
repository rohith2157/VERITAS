"""
Intra-Cohort Collusion Matrix & Clustering Engine
Computes NxN similarity heatmaps, discovers collusion rings, and detects
original vs. copycat submitters based on submission timestamps.
"""

from typing import Dict, List, Optional
from core.evasion import sanitize_and_audit
from core.winnowing import generate_fingerprints, Fingerprint
from core.similarity import get_color_tier


def compute_cohort_matrix(
    documents: List[Dict],
    k: int = 5,
    w: int = 4,
    collusion_threshold: float = 25.0,
    exclude_quotes: bool = True,
    exclude_bibliography: bool = True,
) -> Dict:
    """
    Computes an NxN pairwise similarity matrix for a batch of student submissions.

    Each document dict should contain:
    - id: unique identifier
    - name: student or document title
    - text: document string content
    - timestamp: optional ISO timestamp for original author identification

    Returns:
    - matrix: NxN table of similarity percentages
    - documents: summary list of processed items with integrity audits
    - pairs: ranked list of all matching pairs above collusion_threshold
    - collusion_clusters: groups of students sharing significant content
    - summary: high-level classroom statistics
    """
    n = len(documents)
    if n == 0:
        return {"error": "No documents provided for cohort analysis"}

    # 1. Pre-process and fingerprint each document in O(N) time
    processed_docs = []
    for doc in documents:
        doc_id = doc.get("id", f"doc_{len(processed_docs)}")
        doc_name = doc.get("name", f"Document {len(processed_docs) + 1}")
        raw_text = doc.get("text", "")
        timestamp = doc.get("timestamp", None)

        clean_text, audit = sanitize_and_audit(raw_text)
        fps, tokens, exclusions = generate_fingerprints(
            clean_text,
            k=k,
            w=w,
            exclude_quotes=exclude_quotes,
            exclude_bibliography=exclude_bibliography,
        )

        hashes = {fp.hash_val for fp in fps}

        processed_docs.append(
            {
                "id": doc_id,
                "name": doc_name,
                "raw_text": raw_text,
                "timestamp": timestamp,
                "hashes": hashes,
                "fps_count": len(fps),
                "word_count": len(tokens),
                "integrity": audit,
                "exclusions": exclusions,
            }
        )

    # 2. Compute pairwise similarity matrix
    # matrix[i][j] represents containment of document i in document j
    matrix = [[0.0 for _ in range(n)] for _ in range(n)]
    pairs = []

    for i in range(n):
        hashes_i = processed_docs[i]["hashes"]
        len_i = len(hashes_i)

        for j in range(n):
            if i == j:
                matrix[i][j] = 100.0
                continue

            hashes_j = processed_docs[j]["hashes"]
            if len_i == 0 or len(hashes_j) == 0:
                matrix[i][j] = 0.0
                continue

            common = len(hashes_i.intersection(hashes_j))
            # Containment of Doc I inside Doc J
            containment = round((common / len_i) * 100, 2)
            matrix[i][j] = containment

            # Only record pairs in upper triangle to avoid duplicate pairs
            if i < j:
                # Also compute mutual Jaccard
                union_len = len(hashes_i.union(hashes_j))
                jaccard = round((common / union_len * 100), 2) if union_len > 0 else 0.0
                max_score = max(containment, round((common / len(hashes_j)) * 100, 2))

                if max_score >= collusion_threshold:
                    # Determine probable original submitter if timestamps exist
                    ts_i = processed_docs[i]["timestamp"]
                    ts_j = processed_docs[j]["timestamp"]
                    suspected_origin = None
                    if ts_i and ts_j:
                        suspected_origin = (
                            processed_docs[i]["name"]
                            if ts_i <= ts_j
                            else processed_docs[j]["name"]
                        )

                    pairs.append(
                        {
                            "doc_a_id": processed_docs[i]["id"],
                            "doc_a_name": processed_docs[i]["name"],
                            "doc_b_id": processed_docs[j]["id"],
                            "doc_b_name": processed_docs[j]["name"],
                            "similarity_score": max_score,
                            "jaccard_score": jaccard,
                            "containment_a_in_b": containment,
                            "containment_b_in_a": round(
                                (common / len(hashes_j)) * 100, 2
                            ),
                            "color_tier": get_color_tier(max_score),
                            "suspected_original_submitter": suspected_origin,
                        }
                    )

    # Sort pairs by highest similarity descending
    pairs.sort(key=lambda x: x["similarity_score"], reverse=True)

    # 3. Graph clustering to identify Collusion Rings (connected components)
    adjacency: Dict[str, set] = {doc["id"]: set() for doc in processed_docs}
    for p in pairs:
        if p["similarity_score"] >= collusion_threshold:
            adjacency[p["doc_a_id"]].add(p["doc_b_id"])
            adjacency[p["doc_b_id"]].add(p["doc_a_id"])

    visited = set()
    clusters = []
    for doc in processed_docs:
        d_id = doc["id"]
        if d_id not in visited and len(adjacency[d_id]) > 0:
            cluster_members = []
            queue = [d_id]
            visited.add(d_id)

            while queue:
                curr = queue.pop(0)
                curr_doc = next(d for d in processed_docs if d["id"] == curr)
                cluster_members.append(
                    {
                        "id": curr,
                        "name": curr_doc["name"],
                        "timestamp": curr_doc["timestamp"],
                    }
                )
                for neighbor in adjacency[curr]:
                    if neighbor not in visited:
                        visited.add(neighbor)
                        queue.append(neighbor)

            if len(cluster_members) > 1:
                # Sort cluster members by timestamp to find patient zero
                if all(m["timestamp"] for m in cluster_members):
                    cluster_members.sort(key=lambda x: x["timestamp"])

                clusters.append(
                    {
                        "cluster_id": f"ring_{len(clusters) + 1}",
                        "size": len(cluster_members),
                        "members": cluster_members,
                        "patient_zero": cluster_members[0]["name"]
                        if cluster_members[0].get("timestamp")
                        else "Unknown",
                    }
                )

    # 4. Compile high-level stats
    all_scores = [p["similarity_score"] for p in pairs]
    avg_collusion = round(sum(all_scores) / len(all_scores), 2) if all_scores else 0.0

    return {
        "cohort_size": n,
        "document_headers": [
            {"id": d["id"], "name": d["name"]} for d in processed_docs
        ],
        "similarity_matrix": matrix,
        "flagged_pairs": pairs,
        "collusion_clusters": clusters,
        "summary": {
            "total_documents": n,
            "flagged_pair_count": len(pairs),
            "collusion_cluster_count": len(clusters),
            "highest_similarity_pair": pairs[0] if pairs else None,
            "average_flagged_similarity": avg_collusion,
            "collusion_threshold_applied": collusion_threshold,
        },
    }
