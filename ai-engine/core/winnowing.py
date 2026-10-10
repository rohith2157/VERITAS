"""
Winnowing Algorithm & Document Fingerprinting Engine
Implements Schleimer, Wilkerson & Aiken (2003) local document fingerprinting
with character-span tracking for precise split-screen highlighting.
"""

import hashlib
import re
from typing import List, Dict, Tuple, Set, Optional


class TokenSpan:
    def __init__(self, token: str, start: int, end: int, index: int):
        self.token = token
        self.start = start
        self.end = end
        self.index = index

    def __repr__(self):
        return f"TokenSpan({self.token}, {self.start}:{self.end})"


class Fingerprint:
    def __init__(
        self,
        hash_val: int,
        start_char: int,
        end_char: int,
        token_start: int,
        token_end: int,
    ):
        self.hash_val = hash_val
        self.start_char = start_char
        self.end_char = end_char
        self.token_start = token_start
        self.token_end = token_end

    def to_dict(self):
        return {
            "hash": self.hash_val,
            "start": self.start_char,
            "end": self.end_char,
            "token_start": self.token_start,
            "token_end": self.token_end,
        }


def strip_exclusions(
    text: str, exclude_quotes: bool = True, exclude_bibliography: bool = True
) -> Tuple[str, List[Dict]]:
    """
    Identifies and masks excluded sections (quotes, references/bibliography)
    so they don't produce false positive plagiarism matches.
    Returns:
    1. processed_text (with excluded portions blanked to preserve exact character indices)
    2. list of excluded segment metadata
    """
    excluded_segments = []
    chars = list(text)

    # 1. Exclude bibliography / references section (typically from header to end of file)
    if exclude_bibliography:
        biblio_pattern = re.compile(
            r"(?im)^(?:\s*(?:references|bibliography|works cited|literature cited)\s*[:.]?\s*)$",
            re.MULTILINE,
        )
        match = biblio_pattern.search(text)
        if match:
            start_pos = match.start()
            excluded_segments.append(
                {
                    "type": "BIBLIOGRAPHY",
                    "start": start_pos,
                    "end": len(text),
                    "text": text[start_pos : start_pos + 100] + "...",
                }
            )
            for i in range(start_pos, len(text)):
                if chars[i] != "\n":
                    chars[i] = " "

    intermediate_text = "".join(chars)

    # 2. Exclude direct quotes in quotation marks ("..." or “...”)
    if exclude_quotes:
        quote_patterns = [
            re.compile(r"\"([^\"]{10,})\""),
            re.compile(r"“([^”]{10,})”"),
            re.compile(r"«([^»]{10,})»"),
        ]
        for pattern in quote_patterns:
            for m in pattern.finditer(intermediate_text):
                start_pos = m.start()
                end_pos = m.end()
                excluded_segments.append(
                    {
                        "type": "QUOTATION",
                        "start": start_pos,
                        "end": end_pos,
                        "text": text[start_pos:end_pos],
                    }
                )
                for i in range(start_pos, end_pos):
                    if chars[i] != "\n":
                        chars[i] = " "

    return "".join(chars), excluded_segments


def tokenize_with_spans(text: str) -> List[TokenSpan]:
    """
    Tokenizes text into words while keeping exact character start and end offsets.
    Converts tokens to lowercase for case-insensitive matching.
    """
    token_spans = []
    # Match alphanumeric words
    word_regex = re.compile(r"\b[a-zA-Z0-9_\u00C0-\u017F]+\b")
    for idx, match in enumerate(word_regex.finditer(text)):
        word = match.group(0).lower()
        token_spans.append(
            TokenSpan(token=word, start=match.start(), end=match.end(), index=idx)
        )
    return token_spans


# Karp-Rabin polynomial parameters (64-bit modulus)
KR_BASE = 10007
KR_MOD = 1 << 64


def hash_kgram(tokens: List[str]) -> int:
    """
    Computes a 64-bit integer hash for a sequence of tokens.
    Uses MD5 64-bit prefix for single lookups or validation.
    """
    joined = " ".join(tokens)
    return int(hashlib.md5(joined.encode("utf-8")).hexdigest()[:16], 16)


def compute_kgram_rolling_hashes(
    token_spans: List[TokenSpan], k: int
) -> List[Dict]:
    """
    Computes 64-bit Karp-Rabin rolling hashes across token spans in O(N) time.
    Each sliding step executes in O(1) time.
    """
    n = len(token_spans)
    if n < k or k <= 0:
        return []

    # Pre-hash individual tokens into 64-bit integers
    token_hashes = [
        int(hashlib.md5(t.token.encode("utf-8")).hexdigest()[:16], 16)
        for t in token_spans
    ]

    b_k_minus_1 = pow(KR_BASE, k - 1, KR_MOD)

    # Initial window hash
    curr_hash = 0
    for i in range(k):
        curr_hash = (curr_hash * KR_BASE + token_hashes[i]) % KR_MOD

    kgram_hashes = [
        {
            "hash": curr_hash,
            "start_char": token_spans[0].start,
            "end_char": token_spans[k - 1].end,
            "token_start": 0,
            "token_end": k - 1,
            "index": 0,
        }
    ]

    # Roll through the remainder of the token sequence in O(1) per step
    for i in range(n - k):
        # Remove outgoing token, multiply by base, add incoming token
        curr_hash = (
            (curr_hash - token_hashes[i] * b_k_minus_1) * KR_BASE
            + token_hashes[i + k]
        ) % KR_MOD

        kgram_hashes.append(
            {
                "hash": curr_hash,
                "start_char": token_spans[i + 1].start,
                "end_char": token_spans[i + k].end,
                "token_start": i + 1,
                "token_end": i + k,
                "index": i + 1,
            }
        )

    return kgram_hashes


def generate_fingerprints(
    text: str,
    k: int = 5,
    w: int = 4,
    exclude_quotes: bool = False,
    exclude_bibliography: bool = False,
) -> Tuple[List[Fingerprint], List[TokenSpan], List[Dict]]:
    """
    Applies Schleimer, Wilkerson & Aiken (2003) Winnowing algorithm with
    Karp-Rabin rolling hash to extract robust document fingerprints.

    Parameters:
    - k: Size of token n-gram / shingle (default: 5 tokens)
    - w: Window size for winnowing (default: 4 shingles)
    - exclude_quotes: Mask out text inside quotation marks
    - exclude_bibliography: Mask out bibliography/references section

    Returns:
    - fingerprints: List of selected Fingerprint objects
    - token_spans: List of TokenSpan objects for offset reference
    - excluded_meta: List of excluded ranges
    """
    clean_text, exclusions = strip_exclusions(
        text, exclude_quotes, exclude_bibliography
    )
    token_spans = tokenize_with_spans(clean_text)

    if not token_spans:
        return [], token_spans, exclusions

    # Clamp k if text has fewer tokens than requested k
    effective_k = max(1, min(k, len(token_spans)))

    # 1. Generate all k-grams using O(1) Karp-Rabin rolling hash
    kgram_hashes = compute_kgram_rolling_hashes(token_spans, effective_k)
    num_hashes = len(kgram_hashes)

    if num_hashes == 0:
        return [], token_spans, exclusions

    # 2. Winnowing algorithm: sliding window of size w
    effective_w = max(1, min(w, num_hashes))
    fingerprints: List[Fingerprint] = []
    min_selected_idx = -1

    if num_hashes <= effective_w:
        # If document produces fewer hashes than window size, pick the minimum hash
        min_item = min(kgram_hashes, key=lambda x: x["hash"])
        fingerprints.append(
            Fingerprint(
                min_item["hash"],
                min_item["start_char"],
                min_item["end_char"],
                min_item["token_start"],
                min_item["token_end"],
            )
        )
        return fingerprints, token_spans, exclusions

    for i in range(num_hashes - effective_w + 1):
        window = kgram_hashes[i : i + effective_w]
        # In case of tie, pick the rightmost occurrence of min value
        min_in_window = window[0]
        for item in window[1:]:
            if item["hash"] <= min_in_window["hash"]:
                min_in_window = item

        if min_in_window["index"] != min_selected_idx:
            min_selected_idx = min_in_window["index"]
            fingerprints.append(
                Fingerprint(
                    min_in_window["hash"],
                    min_in_window["start_char"],
                    min_in_window["end_char"],
                    min_in_window["token_start"],
                    min_in_window["token_end"],
                )
            )

    return fingerprints, token_spans, exclusions

