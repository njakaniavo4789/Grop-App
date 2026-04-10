"""
Chargeur d'ontologie CropGPT — singleton rdflib.

Fournit :
  - get_domain_keywords()      → dict {lang: [labels]}  pour la validation domaine
  - get_class_tag(label)       → context_tag  (varieties, water_management, …)
  - get_related_concepts(label)→ list de labels liés  (pour expansion FAISS)
  - get_pedigree(label)        → dict pedigree  (parents, génération, code)
  - get_facts_block(label)     → str  prêt à injecter dans le contexte LLM
"""

import logging
from pathlib import Path
from functools import lru_cache

logger = logging.getLogger(__name__)

# ── Namespaces ─────────────────────────────────────────────────────────────────
AGRI = "http://example.org/agri/"
GEN  = "http://example.org/gen/"
RDFS = "http://www.w3.org/2000/01/rdf-schema#"
SKOS = "http://www.w3.org/2004/02/skos/core#"

# ── Mappage classe OWL → context_tag RAG ───────────────────────────────────────
_CLASS_TO_TAG = {
    f"{AGRI}Rice":            "varieties",
    f"{AGRI}CropVariety":     "varieties",
    f"{AGRI}Cereal":          "varieties",
    f"{AGRI}Legume":          "varieties",
    f"{AGRI}Fruit":           "varieties",
    f"{AGRI}RootCrop":        "varieties",
    f"{AGRI}CashCrop":        "varieties",
    f"{AGRI}Irrigation":      "water_management",
    f"{AGRI}WaterManagement": "water_management",
    f"{AGRI}SoilManagement":  "soil_health",
    f"{AGRI}Fertilization":   "soil_health",
    f"{AGRI}SoilType":        "soil_health",
    f"{AGRI}PestManagement":  "pest_disease",
    f"{AGRI}Disease":         "pest_disease",
    f"{AGRI}Pest":            "pest_disease",
    f"{AGRI}Yield":           "yield_prediction",
    f"{AGRI}Production":      "yield_prediction",
    f"{AGRI}Harvesting":      "yield_prediction",
    f"{AGRI}Climate":         "climate",
    f"{AGRI}Season":          "climate",
    f"{AGRI}Market":          "market",
    f"{AGRI}Price":           "market",
    f"{GEN}Hybrid":           "varieties",
    f"{GEN}Cultivar":         "varieties",
    f"{GEN}Variety":          "varieties",
}


# ── Singleton ──────────────────────────────────────────────────────────────────

_graph = None

def _load_graph():
    """Charge tous les .ttl du dossier ontology/ dans un seul Graph rdflib."""
    global _graph
    if _graph is not None:
        return _graph

    try:
        from rdflib import Graph, Namespace
        g = Graph()

        ontology_dir = Path(__file__).resolve().parent.parent / "ontology"
        ttl_files = sorted(ontology_dir.glob("*.ttl"))

        if not ttl_files:
            logger.warning("Aucun fichier .ttl trouvé dans %s", ontology_dir)
            _graph = g
            return _graph

        for ttl in ttl_files:
            try:
                g.parse(str(ttl), format="turtle")
                logger.debug("Ontologie chargée : %s", ttl.name)
            except Exception as e:
                logger.warning("Erreur chargement %s : %s", ttl.name, e)

        logger.info("Graphe ontologique : %d triplets depuis %d fichiers", len(g), len(ttl_files))
        _graph = g

    except ImportError:
        logger.error("rdflib non installé — pip install rdflib")
        _graph = None

    return _graph


def get_graph():
    return _load_graph()


# ── Requêtes utilitaires ───────────────────────────────────────────────────────

@lru_cache(maxsize=1)
def get_domain_keywords() -> dict:
    """
    Retourne tous les labels agricoles du graphe, par langue.
    Format : {"fr": [...], "en": [...], "mg": [...]}
    Remplace le dict AGRICULTURAL_KEYWORDS hardcodé dans ontology.py.
    """
    g = get_graph()
    result = {"fr": [], "en": [], "mg": []}

    if g is None:
        return result

    from rdflib import URIRef, Literal
    from rdflib.namespace import RDFS as RDFS_NS, SKOS as SKOS_NS

    for s, p, o in g:
        if p in (RDFS_NS.label, SKOS_NS.prefLabel, SKOS_NS.altLabel):
            if isinstance(o, Literal) and o.language in result:
                txt = str(o).strip().lower()
                if txt and txt not in result[o.language]:
                    result[o.language].append(txt)

    logger.debug(
        "Keywords ontologie : fr=%d en=%d mg=%d",
        len(result["fr"]), len(result["en"]), len(result["mg"])
    )
    return result


def _find_individual(label: str):
    """
    Cherche un individu (URI) dans le graphe dont un label correspond
    à la chaîne donnée. Deux passes :
    1. Match exact (insensible à la casse)
    2. Match partiel : le label du graphe contient le terme cherché
    """
    g = get_graph()
    if g is None:
        return None

    from rdflib.namespace import RDFS as RDFS_NS, SKOS as SKOS_NS
    from rdflib import Literal

    label_lower = label.strip().lower()
    partial_match = None

    for s, p, o in g:
        if p in (RDFS_NS.label, SKOS_NS.prefLabel) and isinstance(o, Literal):
            graph_label = str(o).strip().lower()
            # Passe 1 : exact
            if graph_label == label_lower:
                return s
            # Passe 2 : le label du graphe commence par le terme cherché
            if partial_match is None and graph_label.startswith(label_lower + ' '):
                partial_match = s

    return partial_match


def get_class_tag(label: str) -> str | None:
    """
    Retourne le context_tag RAG correspondant à l'entité nommée `label`.
    Ex : "Makalioka" → "varieties", "irrigation" → "water_management"
    """
    g = get_graph()
    if g is None:
        return None

    from rdflib.namespace import RDF as RDF_NS

    uri = _find_individual(label)
    if uri is None:
        return None

    for _, _, cls in g.triples((uri, RDF_NS.type, None)):
        tag = _CLASS_TO_TAG.get(str(cls))
        if tag:
            return tag
    return None


def get_related_concepts(label: str) -> list[str]:
    """
    Retourne les labels des concepts liés à `label` dans le graphe :
    - classes parentes (rdfs:subClassOf)
    - individus de même type
    - pratiques associées (gen:isHybridOf siblings)
    Utilisé pour enrichir la requête FAISS.
    """
    g = get_graph()
    if g is None:
        return []

    from rdflib.namespace import RDF as RDF_NS, RDFS as RDFS_NS, SKOS as SKOS_NS
    from rdflib import Literal, URIRef

    uri = _find_individual(label)
    if uri is None:
        return []

    related_uris = set()

    # Types directs de l'individu (pas les super-classes pour éviter les remontées)
    direct_types = set()
    for _, _, cls in g.triples((uri, RDF_NS.type, None)):
        # Ignorer les classes très génériques (owl:Thing, owl:NamedIndividual)
        cls_str = str(cls)
        if 'owl#' in cls_str or 'rdf-syntax' in cls_str:
            continue
        direct_types.add(cls)
        related_uris.add(cls)

    # Parents hybrides
    is_hybrid_of = URIRef(f"{GEN}isHybridOf")
    for _, _, parent in g.triples((uri, is_hybrid_of, None)):
        related_uris.add(parent)

    # Individus du même type direct uniquement (pas des super-classes)
    for cls in direct_types:
        for sibling, _, _ in g.triples((None, RDF_NS.type, cls)):
            if sibling != uri:
                related_uris.add(sibling)

    # Collecter les labels
    labels = []
    for u in related_uris:
        for _, p, o in g.triples((u, None, None)):
            if p in (RDFS_NS.label, SKOS_NS.prefLabel) and isinstance(o, Literal):
                txt = str(o).strip()
                if txt and txt.lower() != label.lower() and txt not in labels:
                    labels.append(txt)

    return labels[:20]  # limite raisonnable


def get_pedigree(label: str) -> dict:
    """
    Retourne les informations de pedigree pour une variété ou race.
    {
      "found": bool,
      "label": str,
      "parents": [str],
      "generation": int | None,
      "pedigree_code": str | None,
      "registration_date": str | None,
      "bred_by": str | None,
      "is_hybrid": bool,
    }
    """
    g = get_graph()
    empty = {"found": False, "label": label, "parents": [], "generation": None,
             "pedigree_code": None, "registration_date": None, "bred_by": None, "is_hybrid": False}

    if g is None:
        return empty

    from rdflib.namespace import RDFS as RDFS_NS, SKOS as SKOS_NS
    from rdflib import Literal, URIRef

    uri = _find_individual(label)
    if uri is None:
        return empty

    GEN_NS = f"{GEN}"

    result = {**empty, "found": True}

    # Parents (gen:isHybridOf)
    is_hybrid_prop = URIRef(f"{GEN}isHybridOf")
    for _, _, parent_uri in g.triples((uri, is_hybrid_prop, None)):
        for _, _, parent_label in g.triples((parent_uri, RDFS_NS.label, None)):
            if isinstance(parent_label, Literal):
                result["parents"].append(str(parent_label))
                break

    result["is_hybrid"] = len(result["parents"]) > 0

    # Génération
    gen_prop = URIRef(f"{GEN}hasGenerationNumber")
    for _, _, val in g.triples((uri, gen_prop, None)):
        try:
            result["generation"] = int(val)
        except (ValueError, TypeError):
            pass

    # Code pedigree
    code_prop = URIRef(f"{GEN}hasPedigreeCode")
    for _, _, val in g.triples((uri, code_prop, None)):
        result["pedigree_code"] = str(val)

    # Date d'enregistrement
    date_prop = URIRef(f"{GEN}hasRegistrationDate")
    for _, _, val in g.triples((uri, date_prop, None)):
        result["registration_date"] = str(val)

    # Développé par
    bred_prop = URIRef(f"{GEN}bredBy")
    for _, _, agent_uri in g.triples((uri, bred_prop, None)):
        # Extraire le nom depuis l'URI ex: .../agents/FOFIFA → FOFIFA
        result["bred_by"] = str(agent_uri).split("/")[-1]

    return result


def get_facts_block(label: str) -> str:
    """
    Retourne un bloc de texte structuré prêt à être injecté dans le contexte LLM.
    Combine pedigree + classe + définition.
    Retourne "" si rien trouvé.
    """
    g = get_graph()
    if g is None:
        return ""

    from rdflib.namespace import RDFS as RDFS_NS, SKOS as SKOS_NS, RDF as RDF_NS
    from rdflib import Literal

    uri = _find_individual(label)
    if uri is None:
        return ""

    lines = [f"[Faits ontologiques — {label}]"]

    # Définition
    for _, p, o in g.triples((uri, SKOS_NS.definition, None)):
        if isinstance(o, Literal) and o.language == "fr":
            lines.append(f"Définition : {o}")
            break

    # Classes
    class_labels = []
    for _, _, cls in g.triples((uri, RDF_NS.type, None)):
        for _, _, cl in g.triples((cls, RDFS_NS.label, None)):
            if isinstance(cl, Literal) and cl.language == "fr":
                class_labels.append(str(cl))
    if class_labels:
        lines.append(f"Catégorie : {', '.join(class_labels)}")

    # Pedigree
    pedigree = get_pedigree(label)
    if pedigree["found"]:
        if pedigree["parents"]:
            lines.append(f"Parents : {', '.join(pedigree['parents'])}")
        if pedigree["generation"] is not None:
            lines.append(f"Génération : F{pedigree['generation']}")
        if pedigree["pedigree_code"]:
            lines.append(f"Code pedigree : {pedigree['pedigree_code']}")
        if pedigree["registration_date"]:
            lines.append(f"Enregistrement : {pedigree['registration_date']}")
        if pedigree["bred_by"]:
            lines.append(f"Développé par : {pedigree['bred_by']}")

    # Concepts liés
    related = get_related_concepts(label)
    if related:
        lines.append(f"Concepts liés : {', '.join(related[:5])}")

    return "\n".join(lines) if len(lines) > 1 else ""
