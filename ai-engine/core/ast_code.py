"""
AST Code Plagiarism Normalizer (MAX Tier)
Parses Abstract Syntax Trees (AST) for Python and Java to detect code clones even when
variables are renamed, functions reordered, or comments deleted.
"""

import ast
import builtins
import re
from typing import Dict, List, Tuple, Optional
from core.winnowing import generate_fingerprints

BUILTIN_NAMES = set(dir(builtins))


class PythonAstNormalizer(ast.NodeTransformer):
    """
    Transforms a Python AST by replacing user-defined identifiers (variables, arguments,
    function names, class names) with canonical tokens (VAR_1, FUNC_1, CLASS_1)
    while stripping type annotations and docstrings.
    """

    def __init__(self):
        super().__init__()
        self.var_map: Dict[str, str] = {}
        self.func_map: Dict[str, str] = {}
        self.class_map: Dict[str, str] = {}
        self.attr_map: Dict[str, str] = {}
        self.var_counter = 0
        self.func_counter = 0
        self.class_counter = 0
        self.attr_counter = 0
        self.node_count = 0

    def visit(self, node):
        self.node_count += 1
        return super().visit(node)

    def visit_Name(self, node):
        if isinstance(node.ctx, (ast.Store, ast.Load, ast.Del)):
            if node.id not in BUILTIN_NAMES and not node.id.startswith("__") and node.id not in ("self", "cls"):
                if node.id not in self.var_map:
                    self.var_counter += 1
                    self.var_map[node.id] = f"VAR_{self.var_counter}"
                node.id = self.var_map[node.id]
        return self.generic_visit(node)

    def visit_arg(self, node):
        if not node.arg.startswith("__") and node.arg not in ("self", "cls"):
            if node.arg not in self.var_map:
                self.var_counter += 1
                self.var_map[node.arg] = f"VAR_{self.var_counter}"
            node.arg = self.var_map[node.arg]
        node.annotation = None
        return self.generic_visit(node)

    def visit_FunctionDef(self, node):
        if not node.name.startswith("__"):
            if node.name not in self.func_map:
                self.func_counter += 1
                self.func_map[node.name] = f"FUNC_{self.func_counter}"
            node.name = self.func_map[node.name]
        node.returns = None
        return self.generic_visit(node)

    def visit_AsyncFunctionDef(self, node):
        if not node.name.startswith("__"):
            if node.name not in self.func_map:
                self.func_counter += 1
                self.func_map[node.name] = f"FUNC_{self.func_counter}"
            node.name = self.func_map[node.name]
        node.returns = None
        return self.generic_visit(node)

    def visit_ClassDef(self, node):
        if not node.name.startswith("__"):
            if node.name not in self.class_map:
                self.class_counter += 1
                self.class_map[node.name] = f"CLASS_{self.class_counter}"
            node.name = self.class_map[node.name]
        return self.generic_visit(node)

    def visit_Attribute(self, node):
        if not node.attr.startswith("__"):
            if node.attr not in self.attr_map:
                self.attr_counter += 1
                self.attr_map[node.attr] = f"ATTR_{self.attr_counter}"
            node.attr = self.attr_map[node.attr]
        return self.generic_visit(node)

    def visit_AnnAssign(self, node):
        # Convert annotated assignment into a normal assignment
        if node.value is not None:
            new_node = ast.Assign(targets=[node.target], value=node.value)
            return self.visit(new_node)
        return None


def normalize_python_code(source_code: str) -> Tuple[str, Dict]:
    """
    Parses and normalizes Python source code using the AST.
    Strips docstrings, renames variables/functions, removes annotations,
    and returns canonical unparsed code.
    """
    try:
        tree = ast.parse(source_code)
        # Strip all docstrings from AST
        for node in ast.walk(tree):
            if isinstance(node, (ast.FunctionDef, ast.AsyncFunctionDef, ast.ClassDef, ast.Module)):
                if (
                    node.body
                    and isinstance(node.body[0], ast.Expr)
                    and isinstance(node.body[0].value, ast.Constant)
                    and isinstance(node.body[0].value.value, str)
                ):
                    node.body.pop(0)

        normalizer = PythonAstNormalizer()
        normalized_tree = normalizer.visit(tree)
        ast.fix_missing_locations(normalized_tree)
        normalized_code = ast.unparse(normalized_tree)

        return normalized_code, {
            "success": True,
            "node_count": normalizer.node_count,
            "variables_renamed": normalizer.var_counter,
            "functions_renamed": normalizer.func_counter,
            "classes_renamed": normalizer.class_counter,
            "attributes_renamed": normalizer.attr_counter,
            "var_map": normalizer.var_map,
            "func_map": normalizer.func_map,
            "class_map": normalizer.class_map,
            "attr_map": normalizer.attr_map,
        }
    except Exception as e:
        # Fallback to regex-based structural normalization if code has syntax errors
        return normalize_generic_code(source_code), {
            "success": False,
            "fallback_used": True,
            "node_count": len(source_code.split()),
            "error": str(e),
            "var_map": {},
            "func_map": {},
            "class_map": {},
        }


def normalize_java_code(source_code: str) -> Tuple[str, Dict]:
    """
    Parses and normalizes Java source code using javalang AST parser.
    Normalizes class declarations, method names, variable names, and control structures.
    """
    try:
        import javalang

        try:
            tree = javalang.parse.parse(source_code)
        except Exception:
            # Wrap snippet in class if it's a naked method or block
            wrapped = "public class __SnippetWrapper__ {\n" + source_code + "\n}"
            tree = javalang.parse.parse(wrapped)

        var_map, func_map, class_map = {}, {}, {}
        var_c, func_c, class_c = 0, 0, 0
        node_count = 0

        for path, node in tree:
            node_count += 1
            if isinstance(node, javalang.tree.ClassDeclaration):
                if node.name != "__SnippetWrapper__" and node.name not in class_map:
                    class_c += 1
                    class_map[node.name] = f"CLASS_{class_c}"
            elif isinstance(node, (javalang.tree.MethodDeclaration, javalang.tree.ConstructorDeclaration)):
                if node.name not in func_map:
                    func_c += 1
                    func_map[node.name] = f"FUNC_{func_c}"
            elif isinstance(node, (javalang.tree.FormalParameter, javalang.tree.VariableDeclarator)):
                if node.name not in var_map:
                    var_c += 1
                    var_map[node.name] = f"VAR_{var_c}"

        tokens = list(javalang.tokenizer.tokenize(source_code))
        norm_tokens = []
        for tok in tokens:
            val = tok.value
            if isinstance(tok, javalang.tokenizer.Identifier):
                if val in var_map:
                    val = var_map[val]
                elif val in func_map:
                    val = func_map[val]
                elif val in class_map:
                    val = class_map[val]
            norm_tokens.append(val)

        normalized_code = " ".join(norm_tokens)
        return normalized_code, {
            "success": True,
            "node_count": node_count,
            "variables_renamed": var_c,
            "functions_renamed": func_c,
            "classes_renamed": class_c,
            "var_map": var_map,
            "func_map": func_map,
            "class_map": class_map,
        }
    except Exception as e:
        return normalize_generic_code(source_code), {
            "success": False,
            "fallback_used": True,
            "node_count": len(source_code.split()),
            "error": str(e),
            "var_map": {},
            "func_map": {},
            "class_map": {},
        }


def normalize_generic_code(code: str) -> str:
    """
    Heuristic regex normalizer for C++, JavaScript, and languages where full AST doesn't apply.
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
    Returns equivalence percentage, node counts, variable mappings, and structural verdict.
    """
    lang_lower = lang.lower().strip()
    if lang_lower in ["python", "py"]:
        norm_a, meta_a = normalize_python_code(code_a)
        norm_b, meta_b = normalize_python_code(code_b)
    elif lang_lower in ["java"]:
        norm_a, meta_java_a = normalize_java_code(code_a)
        norm_b, meta_java_b = normalize_java_code(code_b)
        meta_a, meta_b = meta_java_a, meta_java_b
    else:
        norm_a = normalize_generic_code(code_a)
        norm_b = normalize_generic_code(code_b)
        meta_a = {"fallback_used": True, "node_count": len(code_a.split()), "var_map": {}, "func_map": {}}
        meta_b = {"fallback_used": True, "node_count": len(code_b.split()), "var_map": {}, "func_map": {}}

    # Cross-map variables and functions from Code B to Code A
    variable_mappings: Dict[str, str] = {}
    var_map_a = meta_a.get("var_map", {})
    var_map_b = meta_b.get("var_map", {})
    rev_var_a = {v: k for k, v in var_map_a.items()}
    for k, v in var_map_b.items():
        if v in rev_var_a and rev_var_a[v] != k:
            variable_mappings[k] = rev_var_a[v]

    func_map_a = meta_a.get("func_map", {})
    func_map_b = meta_b.get("func_map", {})
    rev_func_a = {v: k for k, v in func_map_a.items()}
    for k, v in func_map_b.items():
        if v in rev_func_a and rev_func_a[v] != k:
            variable_mappings[k] = rev_func_a[v]

    # Generate winnowing fingerprints on the normalized code
    fps_a, tokens_a, _ = generate_fingerprints(norm_a, k=4, w=3)
    fps_b, tokens_b, _ = generate_fingerprints(norm_b, k=4, w=3)

    hashes_a = {fp.hash_val for fp in fps_a}
    hashes_b = {fp.hash_val for fp in fps_b}
    common = hashes_a.intersection(hashes_b)

    # If normalized representations are identical strings, guarantee 100%
    if norm_a.strip() == norm_b.strip() and norm_a.strip():
        containment = 100.0
        jaccard = 100.0
    else:
        containment = (len(common) / len(hashes_a) * 100) if hashes_a else 0.0
        jaccard = (
            (len(common) / len(hashes_a.union(hashes_b)) * 100)
            if (hashes_a or hashes_b)
            else 0.0
        )

    ast_nodes_count = max(
        meta_a.get("node_count", 0),
        meta_b.get("node_count", 0),
        len(tokens_a),
        len(tokens_b),
    )

    is_clone = containment >= 40.0

    if containment >= 85.0:
        verdict = "IDENTICAL CODE CLONE DETECTED (Variable Renaming Evasion)"
    elif containment >= 40.0:
        verdict = "PARTIAL STRUCTURAL CODE CLONE DETECTED"
    else:
        verdict = "UNIQUE LOGIC STRUCTURE (NO CLONE DETECTED)"

    return {
        "status": "success",
        "language": lang,
        "structural_similarity": round(containment, 2),
        "jaccard_similarity": round(jaccard, 2),
        "ast_equivalence_percentage": round(containment, 2),
        "is_code_clone": is_clone,
        "ast_nodes_count": ast_nodes_count,
        "variable_mappings": variable_mappings,
        "structural_verdict": verdict,
        "normalized_code_a": norm_a,
        "normalized_code_b": norm_b,
        "meta": {"doc_a": meta_a, "doc_b": meta_b},
    }

