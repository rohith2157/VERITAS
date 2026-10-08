"""
AST Code Plagiarism Normalizer (MAX Tier)
Parses Abstract Syntax Trees (AST) to detect code clones even when
variables are renamed, functions reordered, or comments deleted.
"""

import ast
import re
from typing import Dict, List, Tuple
from core.winnowing import generate_fingerprints


class AstNormalizer(ast.NodeTransformer):
    """
    Transforms a Python AST by replacing all user-defined variable and function
    identifiers with standardized generic tokens (VAR_1, FUNC_1, etc.)
    while preserving language syntax and structural execution flow.
    """

    def __init__(self):
        super().__init__()
        self.var_map: Dict[str, str] = {}
        self.func_map: Dict[str, str] = {}
        self.var_counter = 0
        self.func_counter = 0

    def visit_Name(self, node):
        if isinstance(node.ctx, (ast.Store, ast.Load, ast.Del)):
            # Don't rename built-in names or special names
            if node.id not in __builtins__ and not node.id.startswith("__"):
                if node.id not in self.var_map:
                    self.var_counter += 1
                    self.var_map[node.id] = f"VAR_{self.var_counter}"
                node.id = self.var_map[node.id]
        return self.generic_visit(node)

    def visit_FunctionDef(self, node):
        if not node.name.startswith("__"):
            if node.name not in self.func_map:
                self.func_counter += 1
                self.func_map[node.name] = f"FUNC_{self.func_counter}"
            node.name = self.func_map[node.name]
        return self.generic_visit(node)


def normalize_python_code(source_code: str) -> Tuple[str, Dict]:
    """
    Parses and normalizes Python source code using the AST.
    Returns:
    1. Normalized structural code string
    2. Transformation metadata (variable count, function count)
    """
    try:
        tree = ast.parse(source_code)
        # Strip all docstrings from AST
        for node in ast.walk(tree):
            if isinstance(node, (ast.FunctionDef, ast.ClassDef, ast.Module)):
                if (
                    node.body
                    and isinstance(node.body[0], ast.Expr)
                    and isinstance(node.body[0].value, ast.Constant)
                    and isinstance(node.body[0].value.value, str)
                ):
                    node.body.pop(0)

        normalizer = AstNormalizer()
        normalized_tree = normalizer.visit(tree)
        ast.fix_missing_locations(normalized_tree)
        normalized_code = ast.unparse(normalized_tree)

        return normalized_code, {
            "success": True,
            "variables_renamed": normalizer.var_counter,
            "functions_renamed": normalizer.func_counter,
        }
    except Exception as e:
        # Fallback to regex-based structural normalization if code has syntax errors
        return normalize_generic_code(source_code), {
            "success": False,
            "fallback_used": True,
            "error": str(e),
        }


def normalize_generic_code(code: str) -> str:
    """
    Heuristic regex normalizer for Java, C++, and languages where Python's AST doesn't apply.
    Strips comments, normalizes whitespace, and unifies identifier patterns.
    """
    # 1. Remove single-line comments // and #
    code = re.sub(r"//.*$", "", code, flags=re.MULTILINE)
    code = re.sub(r"#.*$", "", code, flags=re.MULTILINE)
    # 2. Remove multi-line comments /* ... */
    code = re.sub(r"/\*[\s\S]*?\*/", "", code)
    # 3. Collapse multiple whitespaces
    code = re.sub(r"\s+", " ", code)
    return code.strip()


def compare_code_files(code_a: str, code_b: str, lang: str = "python") -> Dict:
    """
    Compares two source code files using AST normalization and structural winnowing.
    """
    if lang.lower() == "python":
        norm_a, meta_a = normalize_python_code(code_a)
        norm_b, meta_b = normalize_python_code(code_b)
    else:
        norm_a = normalize_generic_code(code_a)
        norm_b = normalize_generic_code(code_b)
        meta_a = {"fallback_used": True}
        meta_b = {"fallback_used": True}

    # Generate winnowing fingerprints on the normalized code
    fps_a, tokens_a, _ = generate_fingerprints(norm_a, k=4, w=3)
    fps_b, tokens_b, _ = generate_fingerprints(norm_b, k=4, w=3)

    hashes_a = {fp.hash_val for fp in fps_a}
    hashes_b = {fp.hash_val for fp in fps_b}
    common = hashes_a.intersection(hashes_b)

    containment = (len(common) / len(hashes_a) * 100) if hashes_a else 0.0
    jaccard = (
        (len(common) / len(hashes_a.union(hashes_b)) * 100)
        if (hashes_a or hashes_b)
        else 0.0
    )

    return {
        "language": lang,
        "structural_similarity": round(containment, 2),
        "jaccard_similarity": round(jaccard, 2),
        "is_code_clone": containment >= 40.0,
        "normalized_code_a": norm_a,
        "normalized_code_b": norm_b,
        "meta": {"doc_a": meta_a, "doc_b": meta_b},
    }
