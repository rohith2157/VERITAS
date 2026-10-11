"""
Veritas Enterprise Architecture Endpoints Router
Implements the full technical specification from the
VERITAS Enterprise Integrity Architecture Guide:
1. Semantic Vectorization (SBERT & Cosine Overlap)
2. GPU Vector Indexing (FAISS IVF-Flat with SDMA Memory Manager)
3. Stylometric Author Fingerprinting (Writeprint, Yule's K, Ghostwriting Detection)
4. Optical Character Recognition (OCR Document Capture Layer)
5. Regulatory Compliance: UGC 2018 Statutory Classification & Panel Reports
6. Regulatory Compliance: DPDP Act 2023 Age-Gating & Right to Erasure
"""

from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional

from core.semantic_vector import (
    generate_sentence_embedding,
    compute_cosine_similarity,
    semantic_document_compare
)
from core.vector_index import global_vector_index
from core.stylometry import extract_writeprint, detect_stylometric_anomaly
from core.ocr_capture import process_document_ocr
from core.compliance_ugc import (
    apply_ugc_exclusions,
    classify_ugc_2018_level,
    generate_daip_iaip_report
)
from core.compliance_dpdp import global_dpdp_manager


router = APIRouter(prefix="/api/v1", tags=["Enterprise Architecture Guide Endpoints"])


# ==================== 1. SBERT SEMANTIC VECTORIZATION ====================

class VectorizeRequest(BaseModel):
    text: str = Field(..., description="Text sequence to vectorize via SBERT")
    dimension: int = Field(384, description="Embedding dimension (default 384)")

@router.post("/semantic/vectorize")
def vectorize_text(req: VectorizeRequest):
    """Generates high-dimensional dense embedding using SBERT mean-pooled attention."""
    embedding = generate_sentence_embedding(req.text, req.dimension)
    return {
        "status": "success",
        "model": "Sentence-BERT (SBERT)",
        "dimension": len(embedding),
        "embedding": embedding[:16],  # Preview first 16 dimensions
        "embedding_full": embedding,
        "l2_norm": 1.0
    }

class SemanticCompareRequest(BaseModel):
    text_a: str = Field(..., description="Document A text")
    text_b: str = Field(..., description="Document B text")
    lexical_winnowing_score: float = Field(0.0, description="Optional baseline lexical score")

@router.post("/semantic/compare")
def compare_semantics(req: SemanticCompareRequest):
    """Calculates Cosine Similarity and Hybrid Semantic Plagiarism score."""
    result = semantic_document_compare(req.text_a, req.text_b, req.lexical_winnowing_score)
    return {
        "status": "success",
        "result": result
    }


# ==================== 2. FAISS IVF-FLAT & SDMA VECTOR INDEXING ====================

class IndexDocumentRequest(BaseModel):
    doc_id: str = Field(..., description="Unique document ID")
    text: str = Field(..., description="Document text content")
    metadata: Optional[Dict[str, Any]] = None

@router.post("/vector/index")
def index_document(req: IndexDocumentRequest):
    """Indexes document vector into nearest Voronoi cluster with SDMA slab allocation."""
    res = global_vector_index.add_document(req.doc_id, req.text, req.metadata)
    return res

class VectorSearchRequest(BaseModel):
    query: str = Field(..., description="Query text to search across corpus")
    n_probe: int = Field(3, description="Number of Voronoi centroid clusters to probe")
    top_k: int = Field(5, description="Top-K nearest neighbors")
    threshold: float = Field(50.0, description="Similarity threshold cutoff")

@router.post("/vector/search")
def search_vector_corpus(req: VectorSearchRequest):
    """Performs sub-second approximate nearest neighbor search via IVF-Flat SDMA."""
    res = global_vector_index.search(
        query_text=req.query,
        n_probe=req.n_probe,
        top_k=req.top_k,
        threshold=req.threshold
    )
    return res

@router.delete("/vector/document/{doc_id}")
def delete_vector_document(doc_id: str):
    """Performs O(1) SDMA non-blocking bitmap tombstone deletion."""
    res = global_vector_index.delete_document(doc_id)
    return res


# ==================== 3. STYLOMETRIC AUTHOR FINGERPRINTING ====================

class StylometryRequest(BaseModel):
    text: str = Field(..., description="Document text to analyze")
    historical_submissions: Optional[List[str]] = Field(None, description="Student's prior papers")

@router.post("/stylometry/analyze")
def analyze_writeprint(req: StylometryRequest):
    """Extracts subconscious Writeprint and flags contract cheating anomalies."""
    res = detect_stylometric_anomaly(req.text, req.historical_submissions)
    return {
        "status": "success",
        "stylometric_analysis": res
    }


# ==================== 4. OCR DOCUMENT CAPTURE LAYER ====================

class OcrCaptureRequest(BaseModel):
    filename: str = Field(..., description="Uploaded file name (image or scan PDF)")
    base64_data: Optional[str] = Field(None, description="Optional raw base64 data")

@router.post("/ocr/extract")
def extract_ocr(req: OcrCaptureRequest):
    """Extracts text from flattened images or scanned PDFs defeating format obfuscation."""
    res = process_document_ocr(filename=req.filename, base64_data=req.base64_data)
    return res


# ==================== 5. UGC 2018 STATUTORY COMPLIANCE ====================

class UgcComplianceRequest(BaseModel):
    text: str = Field(..., description="Submitted text")
    raw_similarity: float = Field(..., description="Raw computed similarity percentage")
    student_name: str = Field("Student Candidate", description="Student name")
    course_name: str = Field("CS 401", description="Course name")
    user_role: str = Field("STUDENT", description="STUDENT, RESEARCHER, or FACULTY")

@router.post("/compliance/ugc-2018")
def evaluate_ugc_compliance(req: UgcComplianceRequest):
    """Evaluates text under Section 7 exclusions and classifies under UGC 2018 Tiers."""
    exclusions = apply_ugc_exclusions(req.text)
    # Exclusions reduce net similarity proportionately
    reduction = (exclusions["excluded_segments_count"] * 1.5)
    net_similarity = max(0.0, req.raw_similarity - reduction)

    dossier = generate_daip_iaip_report(
        student_name=req.student_name,
        course_name=req.course_name,
        raw_similarity=req.raw_similarity,
        after_exclusions_similarity=net_similarity,
        user_role=req.user_role
    )

    return {
        "status": "success",
        "exclusions_applied": exclusions,
        "ugc_dossier": dossier
    }


# ==================== 6. DPDP ACT 2023 PRIVACY & ERASURE ====================

class DpdpConsentRequest(BaseModel):
    student_id: str = Field(..., description="Student ID")
    age: int = Field(..., description="Student age in years")
    parental_consent_token: Optional[str] = Field(None, description="Consent token if under 18")

@router.post("/compliance/dpdp/consent")
def register_dpdp_consent(req: DpdpConsentRequest):
    """Enforces Section 9 Minor Age-Gating and parental consent verification."""
    res = global_dpdp_manager.register_consent(req.student_id, req.age, req.parental_consent_token)
    return res

class DpdpErasureRequest(BaseModel):
    student_id: str = Field(..., description="Student ID")
    document_id: str = Field(..., description="Document ID to erase")

@router.post("/compliance/dpdp/erasure")
def execute_dpdp_erasure(req: DpdpErasureRequest):
    """Enforces Section 12 Right to Erasure / Right to be Forgotten."""
    res = global_dpdp_manager.execute_right_to_erasure(req.student_id, req.document_id)
    return res
