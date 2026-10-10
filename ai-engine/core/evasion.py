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
    "\u0451": "e",  # Cyrillic small letter io
    "\u0454": "e",  # Cyrillic small letter Ukrainian ie
    "\u0456": "i",  # Cyrillic small letter byelorussian-ukrainian i
    "\u0458": "j",  # Cyrillic small letter je
    "\u043a": "k",  # Cyrillic small letter ka
    "\u043e": "o",  # Cyrillic small letter o
    "\u0440": "p",  # Cyrillic small letter er
    "\u0455": "s",  # Cyrillic small letter dze
    "\u0443": "y",  # Cyrillic small letter u
    "\u0445": "x",  # Cyrillic small letter ha
    "\u0432": "v",  # Cyrillic small letter ve
    # Cyrillic uppercase
    "\u0410": "A",
    "\u0412": "B",
    "\u0421": "C",
    "\u0415": "E",
    "\u0401": "E",
    "\u041d": "H",
    "\u0406": "I",
    "\u0408": "J",
    "\u041a": "K",
    "\u041c": "M",
    "\u041e": "O",
    "\u0420": "P",
    "\u0405": "S",
    "\u0422": "T",
    "\u0425": "X",
    "\u0423": "Y",
    # Greek lookalikes
    "\u03b1": "a",  # alpha
    "\u03bf": "o",  # omicron
    "\u03bd": "v",  # nu
    "\u03c1": "p",  # rho
    "\u03b9": "i",  # iota
    "\u03ba": "k",  # kappa
    "\u03c7": "x",  # chi
    "\u0391": "A",  # Alpha
    "\u0392": "B",  # Beta
    "\u0395": "E",  # Epsilon
    "\u0397": "H",  # Eta
    "\u0399": "I",  # Iota
    "\u039a": "K",  # Kappa
    "\u039c": "M",  # Mu
    "\u039d": "N",  # Nu
    "\u039f": "O",  # Omicron
    "\u03a1": "P",  # Rho
    "\u03a4": "T",  # Tau
    "\u03a7": "X",  # Chi
}

HOMOGLYPH_DESCRIPTIONS = {
    "\u0430": "Cyrillic Small A (\u0430)",
    "\u0441": "Cyrillic Small C (\u0441)",
    "\u0435": "Cyrillic Small E (\u0435)",
    "\u0451": "Cyrillic Small IO (\u0451)",
    "\u0454": "Cyrillic Small IE (\u0454)",
    "\u0456": "Cyrillic Small I (\u0456)",
    "\u0458": "Cyrillic Small J (\u0458)",
    "\u043a": "Cyrillic Small K (\u043a)",
    "\u043e": "Cyrillic Small O (\u043e)",
    "\u0440": "Cyrillic Small P (\u0440)",
    "\u0455": "Cyrillic Small S (\u0455)",
    "\u0443": "Cyrillic Small Y (\u0443)",
    "\u0445": "Cyrillic Small X (\u0445)",
    "\u0410": "Cyrillic Capital A (\u0410)",
    "\u0412": "Cyrillic Capital B (\u0412)",
    "\u0421": "Cyrillic Capital C (\u0421)",
    "\u0415": "Cyrillic Capital E (\u0415)",
    "\u041d": "Cyrillic Capital H (\u041d)",
    "\u0406": "Cyrillic Capital I (\u0406)",
    "\u041e": "Cyrillic Capital O (\u041e)",
    "\u0420": "Cyrillic Capital P (\u0420)",
    "\u0422": "Cyrillic Capital T (\u0422)",
    "\u0425": "Cyrillic Capital X (\u0425)",
}

# Invisible / Zero-width characters often used to break shingles
INVISIBLE_CHARS = {
    "\u200b": "Zero-Width Space (U+200B)",
    "\u200c": "Zero-Width Non-Joiner (U+200C)",
    "\u200d": "Zero-Width Joiner (U+200D)",
    "\ufeff": "Zero-Width No-Break Space (BOM)",
    "\u00ad": "Soft Hyphen (U+00AD)",
    "\u200e": "Left-To-Right Mark (U+200E)",
    "\u200f": "Right-To-Left Mark (U+200F)",
    "\u202a": "Left-To-Right Embedding (U+202A)",
    "\u202b": "Right-To-Left Embedding (U+202B)",
    "\u202c": "Pop Directional Formatting (U+202C)",
    "\u202d": "Left-To-Right Override (U+202D)",
    "\u202e": "Right-To-Left Override (U+202E)",
    "\u2060": "Word Joiner (U+2060)",
    "\u2061": "Function Application (U+2061)",
    "\u2062": "Invisible Times (U+2062)",
    "\u2063": "Invisible Separator (U+2063)",
    "\u2064": "Invisible Plus (U+2064)",
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
    evasion_types_set = set()

    # 1. Audit invisible and zero-width characters
    for char, name in INVISIBLE_CHARS.items():
        count = text.count(char)
        if count > 0:
            invisible_detected.append(
                {"char_name": name, "count": count, "codepoint": f"U+{ord(char):04X}"}
            )
            evasion_types_set.add(name)

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
            desc = HOMOGLYPH_DESCRIPTIONS.get(ch, f"Homoglyph U+{ord(ch):04X} -> {latin_equivalent}")
            evasion_types_set.add(desc)
            substituted_chars.append(
                {
                    "original": ch,
                    "replacement": latin_equivalent,
                    "position": idx,
                    "codepoint": f"U+{ord(ch):04X}",
                    "description": desc,
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

    # Unicode NFKC normalization: canonical decomposition followed by canonical composition
    normalized_text = unicodedata.normalize("NFKC", normalized_text)

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

    zero_width_count = sum(item["count"] for item in invisible_detected)
    homoglyph_count = len(substituted_chars)
    is_suspicious = len(flags) > 0

    threat_level = (
        "HIGH ADVERSARIAL EVASION INTENT"
        if (homoglyph_count > 0 or zero_width_count > 0)
        else "CLEAN"
    )

    report = {
        "integrity_score": integrity_score,
        "is_suspicious": is_suspicious,
        "flags_count": len(flags),
        "flags": flags,
        "homoglyph_count": homoglyph_count,
        "homoglyphs_detected_count": homoglyph_count,
        "invisible_char_count": zero_width_count,
        "zero_width_spaces_stripped_count": zero_width_count,
        "zero_width_spaces_detected": zero_width_count,
        "homoglyphs_detected": homoglyph_count,
        "evasion_types_found": sorted(list(evasion_types_set)),
        "threat_level": threat_level,
        "sanitized_text": normalized_text,
    }

    return normalized_text, report

