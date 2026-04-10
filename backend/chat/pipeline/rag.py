"""
Étape 3 du pipeline : récupération de documents pertinents (RAG).

Gère 3 cas :
  - Score élevé  (> 0.70) : données fiables trouvées
  - Score moyen  (0.40-0.70) : données partielles
  - Score faible (< 0.40) : rien de pertinent → fallback + disclaimer

Input  : dict enrichi de l'ontologie { enriched_text, context_tags, … }
Output : dict { retrieved_docs, rag_context, confidence_level, has_data }
"""
import logging
from pathlib import Path

from django.conf import settings

logger = logging.getLogger(__name__)

# Seuils de confiance basés sur la distance L2 FAISS
# Distance L2 faible = vecteurs proches = contenu similaire
SCORE_HIGH   = 0.70   # Données très pertinentes
SCORE_MEDIUM = 0.40   # Données partiellement pertinentes
# En dessous de SCORE_MEDIUM → données non fiables


def _load_vector_store():
    """Charge le vector store FAISS s'il existe, sinon retourne None."""
    try:
        import faiss
        import pickle

        store_path = Path(settings.RAG_VECTOR_STORE_PATH)
        if not store_path.exists():
            logger.warning("Vector store introuvable : %s", store_path)
            return None, None

        index = faiss.read_index(str(store_path / 'index.faiss'))
        with open(store_path / 'metadata.pkl', 'rb') as f:
            metadata = pickle.load(f)
        return index, metadata
    except ImportError:
        logger.warning("FAISS non installé — RAG désactivé.")
        return None, None


def _distance_to_score(distance: float) -> float:
    """Convertit une distance L2 FAISS en score de similarité [0-1]."""
    return float(1 / (1 + distance))


def retrieve(ontology_result: dict, top_k: int = None) -> dict:
    """
    Récupère les documents pertinents et évalue leur confiance.

    Returns:
        dict avec :
          retrieved_docs    : liste des documents trouvés
          rag_context       : texte à injecter dans le prompt LLM
          confidence_level  : 'high' | 'medium' | 'low' | 'none'
          has_data          : bool — si des données utilisables ont été trouvées
          disclaimer        : message à afficher à l'utilisateur si nécessaire
    """
    if top_k is None:
        top_k = settings.RAG_TOP_K

    # Question hors domaine → déjà bloquée par l'ontologie
    if not ontology_result.get('is_valid'):
        return _empty_result()

    index, metadata = _load_vector_store()

    # Vector store non disponible (dev sans index)
    if index is None:
        return _fallback_static(ontology_result.get('context_tags', []))

    try:
        from sentence_transformers import SentenceTransformer
        import numpy as np

        model = SentenceTransformer(
            'sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2'
        )
        query_vec = model.encode([ontology_result['enriched_text']])
        query_vec = np.array(query_vec, dtype='float32')

        # Récupérer plus de candidats pour filtrer ensuite
        n_candidates = min(top_k * 3, index.ntotal)
        distances, indices = index.search(query_vec, n_candidates)

        docs = []
        for dist, idx in zip(distances[0], indices[0]):
            if idx < 0 or idx >= len(metadata):
                continue
            score = _distance_to_score(dist)
            doc = metadata[idx].copy()
            doc['score'] = score
            docs.append(doc)

        # Trier par score décroissant
        docs.sort(key=lambda d: d['score'], reverse=True)

        # Garder seulement top_k
        docs = docs[:top_k]

        return _build_result(docs, ontology_result.get('context_tags', []))

    except Exception as e:
        logger.error("Erreur RAG retrieval : %s", e)
        return _fallback_static(ontology_result.get('context_tags', []))


def _build_result(docs: list, context_tags: list) -> dict:
    """
    Évalue la qualité des résultats et construit la réponse appropriée.
    C'est ici que se gère le cas "rien trouvé" ou "données insuffisantes".
    """
    if not docs:
        return _no_data_result(context_tags)

    best_score = docs[0]['score']

    # ── CAS 1 : Données de haute qualité ──────────────────────────────
    if best_score >= SCORE_HIGH:
        # Filtrer pour ne garder que les docs au-dessus du seuil moyen
        good_docs = [d for d in docs if d['score'] >= SCORE_MEDIUM]
        rag_context = _format_context(good_docs)
        return {
            'retrieved_docs': good_docs,
            'rag_context': rag_context,
            'confidence_level': 'high',
            'has_data': True,
            'disclaimer': None,
        }

    # ── CAS 2 : Données partiellement pertinentes ──────────────────────
    if best_score >= SCORE_MEDIUM:
        rag_context = _format_context(docs)
        return {
            'retrieved_docs': docs,
            'rag_context': rag_context,
            'confidence_level': 'medium',
            'has_data': True,
            'disclaimer': (
                "⚠️ Les informations disponibles dans ma base de données sont "
                "partiellement liées à votre question. Je réponds du mieux possible "
                "mais je vous recommande de vérifier auprès d'un technicien MAEP local."
            ),
        }

    # ── CAS 3 : Score faible — rien de pertinent ──────────────────────
    return _no_data_result(context_tags)


def _no_data_result(context_tags: list) -> dict:
    """
    Gère le cas où le RAG ne trouve rien d'utile.
    Tente le fallback sur la knowledge base statique.
    """
    logger.info("Score RAG trop faible — fallback knowledge base statique")
    fallback = _fallback_static(context_tags)

    if fallback['has_data']:
        # On a des données générales dans le fallback
        fallback['confidence_level'] = 'low'
        fallback['disclaimer'] = (
            "ℹ️ Je n'ai pas trouvé de données spécifiques à votre question dans ma base. "
            "Je réponds avec des informations générales sur la riziculture malgache. "
            "Pour des conseils précis à votre situation, consultez le MAEP ou un technicien FOFIFA."
        )
        return fallback

    # Vraiment rien — retourner un résultat vide avec instructions au LLM
    return {
        'retrieved_docs': [],
        'rag_context': '',
        'confidence_level': 'none',
        'has_data': False,
        'disclaimer': (
            "⚠️ Je n'ai pas de données spécifiques sur ce sujet dans ma base de connaissances. "
            "Je vais répondre avec mes connaissances générales, mais cette réponse "
            "doit être vérifiée auprès d'experts locaux (MAEP, FOFIFA, techniciens agricoles)."
        ),
    }


def _empty_result() -> dict:
    return {
        'retrieved_docs': [],
        'rag_context': '',
        'confidence_level': 'none',
        'has_data': False,
        'disclaimer': None,
    }


def _format_context(docs: list) -> str:
    """Formate les documents récupérés en texte pour le LLM."""
    parts = []
    for doc in docs:
        source_label = doc.get('title', 'Source inconnue')
        score_pct = int(doc.get('score', 0) * 100)
        parts.append(
            f"[Source: {source_label} — pertinence {score_pct}%]\n"
            f"{doc.get('content', '')}"
        )
    return '\n\n---\n\n'.join(parts)


def _fallback_static(context_tags: list) -> dict:
    """
    Contexte statique de secours basé sur les tags ontologiques.
    Utilisé quand FAISS n'est pas disponible ou le score est trop faible.
    Ces données viennent de la knowledge base intégrée dans le code
    (dernière ligne de défense avant "je ne sais pas").
    """
    fallbacks = {
        'yield_prediction': (
            "Rendements moyens du riz à Madagascar (données MAEP/FAO 2022) : "
            "2,5 t/ha en moyenne nationale. Culture irriguée : 3,0-4,5 t/ha selon la région. "
            "Culture pluviale : 1,5-2,5 t/ha. Avec méthode SRI : jusqu'à 6-8 t/ha possible. "
            "Meilleures régions : Alaotra-Mangoro (4,0-5,0 t/ha), Boeny (3,0-4,0 t/ha)."
        ),
        'varieties': (
            "Variétés recommandées par le FOFIFA : FOFIFA 154 (hautes terres, résistante pyriculariose), "
            "FOFIFA 161 (haut rendement, bas-fonds), FOFIFA 3069 (côtes, cycle court 105j), "
            "Makalioka (traditionnelle, qualité gustative), NERICA 4 (pluviale, tanety)."
        ),
        'soil_health': (
            "Sols de Madagascar : majoritairement latéritiques (ferralitiques) avec pH 4,5-6,0. "
            "Bas-fonds : sols alluviaux plus fertiles, idéaux pour le riz irrigué. "
            "Apport recommandé : compost 5-10 t/ha + NPK 11-22-16 à 200 kg/ha. "
            "Carence en zinc fréquente sur hautes terres : apporter ZnSO4 à 20 kg/ha."
        ),
        'water_management': (
            "Riziculture irriguée : 40% des superficies malgaches. "
            "Méthode SRI : irrigation alternée (mouillage-séchage), économie d'eau de 30-50%. "
            "Plaines irrigables principales : Alaotra, Marovoay (Boeny), Dabara (Menabe). "
            "Besoin en eau : 900-1200mm/cycle pour riz irrigué."
        ),
        'pest_disease': (
            "Principale maladie : pyriculariose (blast), favorisée par temps frais et humide. "
            "Traitement : fongicides triazoles. Prévention : variétés résistantes FOFIFA 154/161. "
            "Ravageurs : foreur des tiges (Scirpophaga), rats des rizières (Alaotra). "
            "Surveillance critique : épiaison = période la plus vulnérable."
        ),
        'climate': (
            "Saison des pluies (Novembre-Avril) : période principale de riziculture pluviale. "
            "Saison sèche (Mai-Octobre) : riziculture irriguée possible dans l'ouest et le nord. "
            "Risques climatiques : cyclones (côte est, Jan-Mars), sécheresse (sud et ouest). "
            "Température optimale pour le riz : 25-30°C le jour, >15°C la nuit."
        ),
        'market': (
            "Prix du riz paddy à Madagascar (2023) : 500-800 Ar/kg selon la région et la saison. "
            "Prix pic : soudure (Oct-Nov). Prix bas : post-récolte (Avril-Mai). "
            "Marchés principaux : Analakely (Tana), Toamasina, Mahajanga. "
            "Filière exportation : quasi inexistante, Madagascar importe du riz en soudure."
        ),
    }

    context_parts = [fallbacks[tag] for tag in context_tags if tag in fallbacks]

    if not context_parts:
        # Aucun tag ne correspond → contexte très général
        context_parts = [
            "Madagascar est le pays africain avec la plus grande consommation de riz par habitant "
            "(~130 kg/an). La riziculture emploie plus de 70% de la population rurale. "
            "Superficie rizicole totale : ~1,3 million d'hectares. "
            "Production annuelle : ~3,5 millions de tonnes de paddy."
        ]
        return {
            'retrieved_docs': [],
            'rag_context': '\n\n'.join(context_parts),
            'confidence_level': 'low',
            'has_data': True,
            'disclaimer': None,
            'source': 'static_general',
        }

    return {
        'retrieved_docs': [],
        'rag_context': '\n\n'.join(context_parts),
        'confidence_level': 'medium',
        'has_data': True,
        'disclaimer': None,
        'source': 'static_fallback',
    }
