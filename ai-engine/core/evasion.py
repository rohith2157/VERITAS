"""
Evasion & Integrity Detection Engine
Detects and neutralizes adversarial attacks designed to bypass plagiarism detection:
- Homoglyph Substitution (e.g., Cyrillic/Greek lookalikes for Latin characters)
- Zero-width and invisible character injection
- Obfuscated whitespace manipulation
"""

import unicodedata
import re
from typing import Dict, List, Tuple

# Common homoglyph mappings (Cyrillic & Greek lookalikes -> Latin equivalents)
HOMOGLYPH_MAP = {
    # Cyrillic lowercase
    "\u0430": "a",  # Cyrillic small letter a
    "\u0441": "c",  # Cyrillic small letter es
    "\u0435": "e",  # Cyrillic small letter ie
    "\u0456": "i",  # Cyrillic small letter byelorussian-ukrainian i
    "\u0458": "j",  # Cyrillic small letter je
    "\u043e": "o",  # Cyrillic small letter o
    "\u0440": "p",  # Cyrillic small letter er
    "\u0455": "s",  # Cyrillic small letter dze
    "\u0443": "y",  # Cyrillic small letter u
    "\u0445": "x",  # Cyrillic small letter ha
    # Cyrillic uppercase
    "\u0410": "A",
    "\u0412": "B",
    "\u0421": "C",
    "\u0415": "E",
    "\u041d": "H",
    "\u0406": "I",
    "\u0408": "J",
    "\u041a": "K",
    "\u041c": "M",
    "\u041e": "O",
    "\u0420": "P",
    "\u0422": "T",
    "\u0425": "X",
    "\u0423": "Y",
    # Greek lookalikes
    "\u03b1": "a",  # alpha
    "\u03bf": "o",  # omicron
    "\u03bd": "v",  # nu
    "\u03c1": "p",  # rho
}

# Invisible / Zero-width characters often used to break shingles
INVISIBLE_CHARS = {
    "\u200b": "Zero-Width Space",
    "\u200c": "Zero-Width Non-Joiner",
    "\u200d": "Zero-Width Joiner",
    "\ufeff": "Zero-Width No-Break Space (BOM)",
    "\u00ad": "Soft Hyphen",
    "\u200e": "Left-To-Right Mark",
    "\u200f": "Right-To-Left Mark",
    "\u2060": "Word Joiner",
}


def sanitize_and_audit(text: str) -> Tuple[str, Dict]:
    """
    Analyzes input text for adversarial tampering techniques and returns:
    1. A normalized clean version of the text for hashing/comparison
    2. An integrity audit report detailing any cheating attempts found
    """
    flags = []
    homoglyphs_detected = []
    invisible_detected = []

    # 1. Audit invisible and zero-width characters
    for char, name in INVISIBLE_CHARS.items():
        count = text.count(char)
        if count > 0:
            invisible_detected.append(
                {"char_name": name, "count": count, "codepoint": f"U+{ord(char):04X}"}
            )

    if invisible_detected:
        flags.append(
            {
                "type": "INVISIBLE_CHARS",
                "severity": "HIGH",
                "description": f"Found {sum(item['count'] for item in invisible_detected)} invisible/zero-width character(s) designed to break word tokenization.",
                "details": invisible_detected,
            }
        )

    # Strip invisible characters
    cleaned_text = "".join(ch for ch in text if ch not in INVISIBLE_CHARS)

    # 2. Audit homoglyphs (script mixing)
    substituted_chars = []
    normalized_chars = []

    for idx, ch in enumerate(cleaned_text):
        if ch in HOMOGLYPH_MAP:
            latin_equivalent = HOMOGLYPH_MAP[ch]
            substituted_chars.append(
                {
                    "original": ch,
                    "replacement": latin_equivalent,
                    "position": idx,
                    "codepoint": f"U+{ord(ch):04X}",
                }
            )
            normalized_chars.append(latin_equivalent)
        else:
            normalized_chars.append(ch)

    if substituted_chars:
        flags.append(
            {
                "type": "HOMOGLYPH_SUBSTITUTION",
                "severity": "CRITICAL",
                "description": f"Detected {len(substituted_chars)} substituted foreign lookalike character(s) (e.g. Cyrillic instead of Latin).",
                "details": substituted_chars[:20],  # sample first 20
            }
        )

    normalized_text = "".join(normalized_chars)

    # Unicode NFKD normalization as a safety net
    normalized_text = unicodedata.normalize("NFKD", normalized_text)

    # 3. Audit excessive whitespace / padding
    excessive_spaces = len(re.findall(r" {5,}", text))
    if excessive_spaces > 3:
        flags.append(
            {
                "type": "EXCESSIVE_WHITESPACE",
                "severity": "MEDIUM",
                "description": f"Detected {excessive_spaces} instances of abnormally wide space padding.",
            }
        )

    integrity_score = 100
    for f in flags:
        if f["severity"] == "CRITICAL":
            integrity_score -= 40
        elif f["severity"] == "HIGH":
            integrity_score -= 20
        elif f["severity"] == "MEDIUM":
            integrity_score -= 10
    integrity_score = max(0, integrity_score)

    report = {
        "integrity_score": integrity_score,
        "is_suspicious": len(flags) > 0,
        "flags_count": len(flags),
        "flags": flags,
        "homoglyph_count": len(substituted_chars),
        "invisible_char_count": sum(item["count"] for item in invisible_detected),
    }

    return normalized_text, report
