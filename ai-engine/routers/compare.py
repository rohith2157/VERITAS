"""
API Router for Document Comparison & Forensics
Exposes endpoints for all 4 Universal Comparison Operators and forensic tools.
"""

from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from pydantic import BaseModel, Field
from typing import List, Optional, Dict
import json

from core.similarity import compare_documents_1to1
from core.matrix import compute_cohort_matrix
from core.extractor import extract_text_from_file
from core.ast_code import compare_code_files, normalize_python_code
from core.ai_forensics import analyze_ai_writing
from core.evasion import sanitize_and_audit

router = APIRouter(prefix="/api/v1", tags=["Comparison & Forensics"])


# --- Pydantic Request Schemas ---


class Compare1to1Request(BaseModel):
    text_a: str = Field(..., description="Content of Document A")
    text_b: str = Field(..., description="Content of Document B")
    title_a: Optional[str] = "Document A"
    title_b: Optional[str] = "Document B"
    k: Optional[int] = 5
    w: Optional[int] = 4
    k_gram_size: Optional[int] = None
    window_size: Optional[int] = None
    sanitize_homoglyphs: Optional[bool] = True
    exclude_quotes: Optional[bool] = True
    exclude_bibliography: Optional[bool] = True


class DocumentItem(BaseModel):
    id: str
    name: str
    text: str
    timestamp: Optional[str] = None


class CohortMatrixRequest(BaseModel):
    documents: List[DocumentItem]
    k: Optional[int] = 5
    w: Optional[int] = 4
    collusion_threshold: Optional[float] = 25.0
    exclude_quotes: Optional[bool] = True
    exclude_bibliography: Optional[bool] = True


class OneToManyRequest(BaseModel):
    query_document: DocumentItem
    corpus: List[DocumentItem]
    k: Optional[int] = 5
    w: Optional[int] = 4
    exclude_quotes: Optional[bool] = True
    exclude_bibliography: Optional[bool] = True


class ManyToOneRequest(BaseModel):
    documents: List[DocumentItem]
    reference_document: DocumentItem
    k: Optional[int] = 5
    w: Optional[int] = 4
    exclude_quotes: Optional[bool] = True
    exclude_bibliography: Optional[bool] = True


class AiForensicsRequest(BaseModel):
    text: str
    title: Optional[str] = "Document"


class CodeCompareRequest(BaseModel):
    code_a: str
    code_b: str
    language: Optional[str] = "python"


class AstNormalizeRequest(BaseModel):
    code_a: Optional[str] = ""
    code_b: Optional[str] = ""
    code: Optional[str] = ""
    language: Optional[str] = "python"


class SanitizeRequest(BaseModel):
    text: str


# --- Endpoints ---


@router.post("/compare/one-to-one")
async def api_compare_one_to_one(payload: Compare1to1Request):
    """
    FLASH & BASE: 1-to-1 Document Comparison
    Returns Jaccard, Containment, matched passage coordinates, and integrity flags.
    """
    try:
        k_val = payload.k_gram_size if payload.k_gram_size is not None else (payload.k or 5)
        w_val = payload.window_size if payload.window_size is not None else (payload.w or 4)
        result = compare_documents_1to1(
            text_a=payload.text_a,
            text_b=payload.text_b,
            title_a=payload.title_a,
            title_b=payload.title_b,
            k=k_val,
            w=w_val,
            exclude_quotes=payload.exclude_quotes,
            exclude_bibliography=payload.exclude_bibliography,
            sanitize_homoglyphs=payload.sanitize_homoglyphs if payload.sanitize_homoglyphs is not None else True,
        )
        return result

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Comparison failed: {str(e)}")


@router.post("/compare/upload-one-to-one")
async def api_upload_one_to_one(
    file_a: UploadFile = File(...),
    file_b: UploadFile = File(...),
    exclude_quotes: bool = Form(True),
    exclude_bibliography: bool = Form(True),
):
    """Multipart upload variant for direct file-to-file comparison (PDF, Word, TXT, Code)."""
    content_a = await file_a.read()
    content_b = await file_b.read()

    text_a, meta_a = extract_text_from_file(file_a.filename, content_a)
    text_b, meta_b = extract_text_from_file(file_b.filename, content_b)

    result = compare_documents_1to1(
        text_a=text_a,
        text_b=text_b,
        title_a=file_a.filename,
        title_b=file_b.filename,
        exclude_quotes=exclude_quotes,
        exclude_bibliography=exclude_bibliography,
    )
    result["file_meta"] = {"doc_a": meta_a, "doc_b": meta_b}
    return result


@router.post("/compare/many-to-many")
async def api_compare_many_to_many(payload: CohortMatrixRequest):
    """
    PRO TIER: Intra-Cohort Collusion Matrix
    Computes NxN similarity matrix, finds collusion rings, and detects original author.
    """
    raw_docs = [d.dict() for d in payload.documents]
    result = compute_cohort_matrix(
        documents=raw_docs,
        k=payload.k,
        w=payload.w,
        collusion_threshold=payload.collusion_threshold,
        exclude_quotes=payload.exclude_quotes,
        exclude_bibliography=payload.exclude_bibliography,
    )
    return result


@router.post("/compare/one-to-many")
async def api_compare_one_to_many(payload: OneToManyRequest):
    """
    MAX TIER: One-to-Many Institutional Archive Search
    Compares 1 query document against an entire corpus and returns ranked matches.
    """
    results = []
    for item in payload.corpus:
        comp = compare_documents_1to1(
            text_a=payload.query_document.text,
            text_b=item.text,
            title_a=payload.query_document.name,
            title_b=item.name,
            k=payload.k,
            w=payload.w,
            exclude_quotes=payload.exclude_quotes,
            exclude_bibliography=payload.exclude_bibliography,
        )
        results.append(
            {
                "target_id": item.id,
                "target_name": item.name,
                "similarity_score": comp["similarity_score"],
                "jaccard_score": comp["jaccard_score"],
                "color_tier": comp["color_tier"],
                "matches_count": comp["total_matches_found"],
            }
        )

    results.sort(key=lambda x: x["similarity_score"], reverse=True)
    return {
        "query_document": {
            "id": payload.query_document.id,
            "name": payload.query_document.name,
        },
        "total_targets_scanned": len(payload.corpus),
        "top_matches": results,
    }


@router.post("/compare/many-to-one")
async def api_compare_many_to_one(payload: ManyToOneRequest):
    """
    MAX TIER: Many-to-One Master Solution Key Audit
    Compares multiple student submissions against 1 reference answer/prompt.
    """
    scores = []
    for doc in payload.documents:
        comp = compare_documents_1to1(
            text_a=doc.text,
            text_b=payload.reference_document.text,
            title_a=doc.name,
            title_b=payload.reference_document.name,
            k=payload.k,
            w=payload.w,
            exclude_quotes=payload.exclude_quotes,
            exclude_bibliography=payload.exclude_bibliography,
        )
        scores.append(
            {
                "document_id": doc.id,
                "document_name": doc.name,
                "similarity_against_reference": comp["similarity_score"],
                "color_tier": comp["color_tier"],
                "matches_count": comp["total_matches_found"],
            }
        )

    scores.sort(key=lambda x: x["similarity_against_reference"], reverse=True)
    return {
        "reference_document": {
            "id": payload.reference_document.id,
            "name": payload.reference_document.name,
        },
        "total_submissions_audited": len(payload.documents),
        "results": scores,
    }


@router.post("/detect/ai-forensics")
async def api_detect_ai_forensics(payload: AiForensicsRequest):
    """
    ULTRA TIER: AI Writing Forensics
    Calculates perplexity, burstiness, and sentence-level AI probabilities.
    """
    return analyze_ai_writing(payload.text)


@router.post("/detect/code-ast")
async def api_detect_code_ast(payload: CodeCompareRequest):
    """
    MAX TIER: Code Plagiarism Detection
    AST-based structural comparison for Python, Java, and C++.
    """
    return compare_code_files(payload.code_a, payload.code_b, lang=payload.language)


@router.post("/ast/normalize")
async def api_ast_normalize(payload: AstNormalizeRequest):
    """
    AST Code Structural Normalization & Clone Detection
    Direct endpoint for Developer Workstation API Wire Playground.
    """
    code_a = payload.code_a or payload.code or ""
    code_b = payload.code_b or ""
    lang = payload.language or "python"

    if code_b:
        return compare_code_files(code_a, code_b, lang=lang)
    else:
        if lang.lower() == "python":
            norm, meta = normalize_python_code(code_a)
        else:
            from core.ast_code import normalize_java_code
            norm, meta = normalize_java_code(code_a)
        return {
            "status": "success",
            "language": lang,
            "ast_equivalence_percentage": 100.0,
            "ast_nodes_count": meta.get("node_count", len(code_a.split())),
            "normalized_code": norm,
            "meta": meta,
        }


@router.post("/sanitize/homoglyphs")
async def api_sanitize_homoglyphs(payload: SanitizeRequest):
    """
    Cyrillic Homoglyph & Zero-Width Sanitizer
    Direct endpoint for Developer Workstation API Wire Playground.
    """
    normalized_text, audit = sanitize_and_audit(payload.text)
    return {
        "status": "success",
        "sanitized_text": normalized_text,
        "homoglyphs_detected_count": audit.get("homoglyphs_detected_count", 0),
        "zero_width_spaces_stripped_count": audit.get("zero_width_spaces_stripped_count", 0),
        "evasion_types_found": audit.get("evasion_types_found", []),
        "threat_level": audit.get("threat_level", "CLEAN"),
        "integrity_score": audit.get("integrity_score", 100),
        "audit_report": audit,
    }



@router.post("/extract-text")
async def api_extract_text(file: UploadFile = File(...)):
    """Universal text extraction endpoint for PDF, DOCX, TXT, and Code files."""
    content = await file.read()
    text, meta = extract_text_from_file(file.filename, content)
    return {"metadata": meta, "text": text}
