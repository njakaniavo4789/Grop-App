"""
Étape 1 du pipeline : nettoyage et normalisation du prompt utilisateur.

Input  : texte brut de l'utilisateur
Output : dict { text, language, tokens_estimate }
"""
import re
import unicodedata


LANG_PATTERNS = {
    'mg': re.compile(r'\b(izaho|ianao|izy|ny|dia|amin|fa|tsy|misy|ary|aho|ho)\b', re.IGNORECASE),
    'fr': re.compile(r'\b(le|la|les|un|une|des|je|tu|il|nous|vous|ils|est|sont|avec|pour)\b', re.IGNORECASE),
    'en': re.compile(r'\b(the|a|an|is|are|i|you|he|she|we|they|with|for|and|or)\b', re.IGNORECASE),
}


def detect_language(text: str) -> str:
    scores = {lang: len(pattern.findall(text)) for lang, pattern in LANG_PATTERNS.items()}
    return max(scores, key=scores.get) if any(scores.values()) else 'fr'


def normalize(raw_text: str) -> dict:
    # Normalisation Unicode (accents composés → pré-composés)
    text = unicodedata.normalize('NFC', raw_text)
    # Suppression des espaces multiples
    text = re.sub(r'\s+', ' ', text).strip()
    # Suppression des caractères de contrôle
    text = re.sub(r'[\x00-\x08\x0b\x0c\x0e-\x1f\x7f]', '', text)

    language = detect_language(text)
    tokens_estimate = len(text.split())

    return {
        'text': text,
        'language': language,
        'tokens_estimate': tokens_estimate,
    }
