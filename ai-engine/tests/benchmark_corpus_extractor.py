"""
Benchmark 1: Test Document Corpora Inspection & Extraction Validation
Audits all files in data/sample_documents (PDF, DOCX, TXT, PY, JAVA).
Verifies extractor fidelity, character counts, word counts, and metadata.
"""

import os
import sys
import json

# Add ai-engine to path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from core.extractor import extract_text_from_file

def run_corpus_audit():
    docs_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..', 'data', 'sample_documents'))
    print(f"=== Auditing Document Corpora at: {docs_dir} ===")
    
    files = sorted(os.listdir(docs_dir))
    results = []
    
    type_counts = {}
    total_bytes = 0
    total_words = 0
    
    for filename in files:
        filepath = os.path.join(docs_dir, filename)
        if os.path.isdir(filepath):
            continue
            
        with open(filepath, 'rb') as fp:
            content = fp.read()
            
        total_bytes += len(content)
        text, meta = extract_text_from_file(filename, content)
        ft = meta.get("file_type", "UNKNOWN")
        type_counts[ft] = type_counts.get(ft, 0) + 1
        total_words += meta.get("word_count", 0)
        
        extracted_snippet = text.replace('\n', ' ')[:80] + ('...' if len(text) > 80 else '')
        
        results.append({
            "filename": filename,
            "file_type": ft,
            "extension": meta.get("extension"),
            "size_bytes": meta.get("size_bytes"),
            "char_count": meta.get("char_count"),
            "word_count": meta.get("word_count"),
            "snippet": extracted_snippet,
            "valid_extraction": len(text) > 20
        })
        
        print(f"  [{ft:4s}] {filename:38s} | {meta.get('size_bytes', 0):6d} B | {meta.get('word_count', 0):3d} words | Valid: {len(text) > 20}")

    print("\n--- Corpus Breakdown ---")
    for ft, count in sorted(type_counts.items()):
        print(f"  {ft}: {count} files")
    print(f"Total Files: {len(results)} | Total Bytes: {total_bytes} | Total Words: {total_words}")
    
    # Assertions for academic validity
    assert len(results) >= 8, f"Expected at least 8 sample documents, got {len(results)}"
    assert type_counts.get("PDF", 0) >= 2, "Expected at least 2 PDF test files"
    assert type_counts.get("DOCX", 0) >= 1, "Expected at least 1 DOCX test file"
    assert type_counts.get("CODE", 0) >= 4, "Expected at least 4 code test files (Python/Java)"
    assert type_counts.get("TEXT", 0) >= 4, "Expected at least 4 essay text files"
    assert all(r["valid_extraction"] for r in results), "All documents must have successful text extraction"
    
    print("\n[SUCCESS] Corpus Inspection & Extractor Audit PASSED.")
    return {
        "status": "PASSED",
        "total_documents": len(results),
        "type_breakdown": type_counts,
        "total_bytes": total_bytes,
        "total_words": total_words,
        "documents": results
    }

if __name__ == "__main__":
    report = run_corpus_audit()
    print(json.dumps(report, indent=2))
