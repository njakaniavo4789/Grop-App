"""
Étape 2 du pipeline : validation ontologique et enrichissement du contexte.

- Vérifie que la question est dans le domaine agricole (guardrail)
- Enrichit le prompt avec des concepts clés liés à la riziculture malgache
- Retourne le contexte structuré pour le RAG

Input  : dict normalisé { text, language, … }
Output : dict { is_valid, domain, context_tags, enriched_text, rejection_reason }
"""

# Termes du domaine agricole (mots-clés déclencheurs — extensible)
AGRICULTURAL_KEYWORDS = {
    'fr': [
        'riz', 'rizière', 'culture', 'récolte', 'sol', 'semis', 'engrais', 'irrigation',
        'rendement', 'agriculture', 'plante', 'maladie', 'insecte', 'ravageur', 'variété',
        'paddy', 'riziculture', 'parcelle', 'saison', 'pluie', 'sécheresse', 'fertilisant',
        'herbicide', 'pesticide', 'compost', 'labour', 'terrain', 'eau', 'digue', 'grenier',
        'fofifa', 'tanety', 'bas-fond', 'tavy', 'manioc', 'maïs', 'vanille', 'girofle',
    ],
    'mg': [
        'vary', 'tanimbary', 'fambolena', 'jinja', 'tany', 'orana', 'ahitra', 'aretina',
        'zezika', 'famokarana', 'rano', 'tanety', 'lemaka', 'fasika',
    ],
    'en': [
        'rice', 'paddy', 'crop', 'harvest', 'soil', 'seed', 'fertilizer', 'irrigation',
        'yield', 'agriculture', 'plant', 'disease', 'pest', 'variety', 'farming',
        'cultivation', 'drought', 'rainfall', 'compost', 'field',
    ],
}

# Tags ontologiques pour enrichir le RAG
TOPIC_TAGS = {
    'water_management': ['irrigation', 'rano', 'digue', 'eau', 'inondation', 'sécheresse'],
    'soil_health': ['sol', 'tany', 'engrais', 'zezika', 'compost', 'ph', 'azote'],
    'pest_disease': ['maladie', 'ravageur', 'insecte', 'aretina', 'fungus', 'blight'],
    'varieties': ['variété', 'fofifa', 'semence', 'hybride', 'traditionnel'],
    'yield_prediction': ['rendement', 'production', 'famokarana', 'kg', 'tonne'],
    'climate': ['pluie', 'orana', 'température', 'saison', 'cyclone', 'sécheresse'],
    'market': ['prix', 'vente', 'marché', 'exportation', 'commercialisation'],
}


def validate_and_enrich(normalized: dict) -> dict:
    text_lower = normalized['text'].lower()
    lang = normalized['language']

    keywords = AGRICULTURAL_KEYWORDS.get(lang, AGRICULTURAL_KEYWORDS['fr'])
    matched_keywords = [kw for kw in keywords if kw in text_lower]

    if not matched_keywords:
        # Vérifier dans toutes les langues (question multilingue possible)
        all_keywords = [kw for kws in AGRICULTURAL_KEYWORDS.values() for kw in kws]
        matched_keywords = [kw for kw in all_keywords if kw in text_lower]

    is_valid = len(matched_keywords) > 0

    if not is_valid:
        return {
            'is_valid': False,
            'rejection_reason': (
                "Cette question semble hors du domaine agricole. "
                "Je suis spécialisé en agriculture malgache (riziculture, cultures, sol, etc.)."
            ),
            'domain': None,
            'context_tags': [],
            'enriched_text': normalized['text'],
        }

    # Détection des tags ontologiques
    context_tags = []
    for tag, tag_keywords in TOPIC_TAGS.items():
        if any(kw in text_lower for kw in tag_keywords):
            context_tags.append(tag)

    # Enrichissement : ajouter contexte riziculture malgache si pertinent
    enrichment_notes = []
    if 'rice' in matched_keywords or 'riz' in matched_keywords or 'vary' in matched_keywords:
        enrichment_notes.append(
            "Contexte: riziculture malgache, focus variétés FOFIFA, "
            "système SRI (Système de Riziculture Intensive), bas-fonds et tanety."
        )
    if 'yield_prediction' in context_tags:
        enrichment_notes.append(
            "Contexte rendement: données historiques Madagascar 2.5-4t/ha en pluvial, "
            "jusqu'à 6-8t/ha en irrigué avec SRI."
        )

    enriched_text = normalized['text']
    if enrichment_notes:
        enriched_text += '\n[Contexte ontologique: ' + ' | '.join(enrichment_notes) + ']'

    return {
        'is_valid': True,
        'domain': 'agriculture',
        'context_tags': context_tags,
        'enriched_text': enriched_text,
        'matched_keywords': matched_keywords,
        'rejection_reason': None,
    }
