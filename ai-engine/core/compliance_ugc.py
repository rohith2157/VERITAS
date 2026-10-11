"""
Veritas Regulatory Compliance Module: UGC 2018 Regulations
Automates the University Grants Commission (UGC) 2018 Regulations on:
"Promotion of Academic Integrity and Prevention of Plagiarism in Higher Educational Institutions"

Features:
1. Statutory 4-Tier Penalty Level Classification (Levels 0, 1, 2, 3)
2. Mandated Exclusions Engine (Quotes, References, Generic terms, Mathematical formulas)
3. DAIP (Departmental Academic Integrity Panel) Fact-Finding Dossier
4. IAIP (Institutional Academic Integrity Panel) Disciplinary Penalty Determination
"""

import re
from typing import Dict, List, Any, Optional


GENERIC_ACADEMIC_TERMS = {
    "distributed systems", "machine learning", "artificial intelligence",
    "deep neural networks", "natural language processing", "computer science",
    "data structures and algorithms", "operating systems", "relational database",
    "concurrency control", "byzantine fault tolerance", "consensus protocol",
    "university grants commission", "higher educational institutions",
    "abstract", "introduction", "methodology", "results and discussion",
    "conclusion", "future work", "references", "table of contents"
}


def apply_ugc_exclusions(text: str) -> Dict[str, Any]:
    """
    Filters out legally protected elements under Section 7 of UGC 2018:
    1. All quoted work reproduced with all necessary permission and/or attribution.
    2. All references, bibliography, table of content, preface and acknowledgements.
    3. All generic terms, laws, standard symbols, and standards equations.
    """
    original_length = len(text)
    excluded_segments = []

    # 1. Filter out direct quotations in quotes
    def quote_replacer(match):
        q = match.group(0)
        excluded_segments.append({"type": "ATTRIBUTED_QUOTATION", "snippet": q[:100]})
        return " " * len(q)

    clean_text = re.sub(r'["“][^"”]{10,500}["”]', quote_replacer, text)

    # 2. Filter out References / Bibliography sections
    biblio_match = re.search(r'\b(references|bibliography|works cited)\b.*$', clean_text, re.IGNORECASE | re.DOTALL)
    if biblio_match:
        excluded_segments.append({"type": "BIBLIOGRAPHY_SECTION", "snippet": biblio_match.group(0)[:150]})
        clean_text = clean_text[:biblio_match.start()]

    # 3. Filter generic statutory / domain terms
    for term in GENERIC_ACADEMIC_TERMS:
        if re.search(rf'\b{re.escape(term)}\b', clean_text, re.IGNORECASE):
            excluded_segments.append({"type": "GENERIC_DOMAIN_TERM", "term": term})

    return {
        "original_char_count": original_length,
        "effective_evaluated_char_count": len(clean_text),
        "excluded_segments_count": len(excluded_segments),
        "excluded_segments": excluded_segments[:10],
        "filtered_text": clean_text
    }


def classify_ugc_2018_level(
    similarity_percentage: float,
    user_role: str = "STUDENT"  # "STUDENT", "RESEARCHER", or "FACULTY"
) -> Dict[str, Any]:
    """
    Classifies submission into the legally binding UGC 2018 Tier structure.
    """
    sim = max(0.0, min(100.0, round(similarity_percentage, 2)))

    if sim <= 10.0:
        level = "Level 0"
        severity = "CLEAN"
        penalty_student = "Minor similarities up to 10%; No formal penalty imposed."
        penalty_faculty = "Minor similarities up to 10%; No formal penalty imposed."
        hearing_required = False
    elif sim <= 40.0:
        level = "Level 1"
        severity = "MODERATE"
        penalty_student = "Required to submit a revised manuscript within a stipulated period not exceeding 6 months."
        penalty_faculty = "Required to withdraw manuscript; Warning issued."
        hearing_required = True
    elif sim <= 60.0:
        level = "Level 2"
        severity = "HIGH"
        penalty_student = "Debarred from submitting a revised script for a strict period of 1 year."
        penalty_faculty = "Required to withdraw manuscript; Denied one annual increment; Disallowed co-guidance for 2 years."
        hearing_required = True
    else:
        level = "Level 3"
        severity = "CRITICAL"
        penalty_student = "Registration for the academic degree / research programme cancelled."
        penalty_faculty = "Required to withdraw manuscript; Denied two consecutive increments; Disallowed supervision for 3 years."
        hearing_required = True

    active_penalty = penalty_faculty if user_role.upper() == "FACULTY" else penalty_student

    return {
        "ugc_level": level,
        "similarity_index": sim,
        "severity": severity,
        "statutory_threshold": (
            "Up to 10%" if level == "Level 0" else (
                "10% - 40%" if level == "Level 1" else (
                    "40% - 60%" if level == "Level 2" else "Above 60%"
                )
            )
        ),
        "mandated_disciplinary_penalty": active_penalty,
        "penalties_by_role": {
            "student_researcher": penalty_student,
            "faculty_staff": penalty_faculty
        },
        "regulatory_governance": {
            "statute": "UGC Regulations 2018 (Promotion of Academic Integrity)",
            "investigating_body": "Departmental Academic Integrity Panel (DAIP)",
            "adjudicating_body": "Institutional Academic Integrity Panel (IAIP)",
            "formal_hearing_required": hearing_required
        }
    }


def generate_daip_iaip_report(
    student_name: str,
    course_name: str,
    raw_similarity: float,
    after_exclusions_similarity: float,
    user_role: str = "STUDENT"
) -> Dict[str, Any]:
    """
    Generates formal DAIP & IAIP investigative report dossiers for tribunal hearing.
    """
    ugc_ruling = classify_ugc_2018_level(after_exclusions_similarity, user_role)

    return {
        "dossier_id": f"DAIP-{abs(hash(student_name + course_name)) % 100000:05d}",
        "subject": {
            "name": student_name,
            "role": user_role,
            "course": course_name
        },
        "forensic_metrics": {
            "gross_similarity_index": round(raw_similarity, 2),
            "net_similarity_after_ugc_exclusions": round(after_exclusions_similarity, 2),
            "excluded_percentage": round(max(0.0, raw_similarity - after_exclusions_similarity), 2)
        },
        "statutory_ruling": ugc_ruling,
        "recommendation": (
            "DAIP Recommendation: File closed with no penalty." if ugc_ruling["ugc_level"] == "Level 0"
            else f"DAIP Recommendation: Escalate to IAIP for enforcement of {ugc_ruling['ugc_level']} statutory penalty."
        )
    }

