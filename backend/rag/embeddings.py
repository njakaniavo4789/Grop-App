"""
Génération des embeddings et construction du vector store FAISS.

Usage CLI :
    python -m rag.embeddings --build
    (après avoir scrappé les documents avec scraper.py)
"""
import json
import logging
import pickle
from pathlib import Path

logger = logging.getLogger(__name__)

DOCUMENTS_DIR = Path(__file__).parent / 'data' / 'documents'
KNOWLEDGE_BASE_DIR = Path(__file__).parent / 'data' / 'knowledge_base'
VECTOR_STORE_DIR = Path(__file__).parent / 'data' / 'vector_store'

# Modèle multilingue adapté fr/mg/en
EMBEDDING_MODEL = 'sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2'

# Taille des chunks pour l'indexation
CHUNK_SIZE = 512
CHUNK_OVERLAP = 64


def chunk_text(text: str, chunk_size: int = CHUNK_SIZE, overlap: int = CHUNK_OVERLAP) -> list:
    """Découpe un texte en chunks avec chevauchement."""
    words = text.split()
    chunks = []
    start = 0
    while start < len(words):
        end = start + chunk_size
        chunk = ' '.join(words[start:end])
        chunks.append(chunk)
        start += chunk_size - overlap
    return chunks


def build_index(documents: list = None) -> None:
    """
    Construit le vector store FAISS à partir des documents.

    Args:
        documents : liste de dicts ou None (charge depuis DOCUMENTS_DIR)
    """
    try:
        import faiss
        import numpy as np
        from sentence_transformers import SentenceTransformer
    except ImportError as e:
        logger.error("Dépendances manquantes : %s. Installer avec requirements/production.txt", e)
        return

    if documents is None:
        documents = []
        # 1. Documents scrapés depuis le web
        for doc_file in DOCUMENTS_DIR.glob('*.json'):
            with open(doc_file, encoding='utf-8') as f:
                documents.append(json.load(f))
        # 2. Knowledge base locale (priorité haute — toujours incluse)
        if KNOWLEDGE_BASE_DIR.exists():
            for doc_file in KNOWLEDGE_BASE_DIR.glob('*.json'):
                with open(doc_file, encoding='utf-8') as f:
                    kb_doc = json.load(f)
                    kb_doc['source'] = kb_doc.get('source', 'knowledge_base')
                    documents.append(kb_doc)
            logger.info("Knowledge base : %d documents chargés", len(list(KNOWLEDGE_BASE_DIR.glob('*.json'))))

    if not documents:
        logger.warning("Aucun document trouvé dans %s ni dans %s", DOCUMENTS_DIR, KNOWLEDGE_BASE_DIR)
        return

    logger.info("Chargement du modèle d'embeddings : %s", EMBEDDING_MODEL)
    model = SentenceTransformer(EMBEDDING_MODEL)

    all_chunks = []
    metadata = []

    for doc in documents:
        chunks = chunk_text(doc.get('content', ''))
        for i, chunk in enumerate(chunks):
            all_chunks.append(chunk)
            metadata.append({
                'doc_id': doc['id'],
                'title': doc['title'],
                'url': doc.get('url', ''),
                'content': chunk,
                'chunk_index': i,
                'topics': doc.get('topics', []),
            })

    logger.info("Encodage de %d chunks…", len(all_chunks))
    embeddings = model.encode(all_chunks, show_progress_bar=True, batch_size=32)
    embeddings = np.array(embeddings, dtype='float32')

    # Création de l'index FAISS (L2)
    dimension = embeddings.shape[1]
    index = faiss.IndexFlatL2(dimension)
    index.add(embeddings)

    # Sauvegarde
    VECTOR_STORE_DIR.mkdir(parents=True, exist_ok=True)
    faiss.write_index(index, str(VECTOR_STORE_DIR / 'index.faiss'))
    with open(VECTOR_STORE_DIR / 'metadata.pkl', 'wb') as f:
        pickle.dump(metadata, f)

    logger.info("Index FAISS créé : %d vecteurs de dimension %d", index.ntotal, dimension)


if __name__ == '__main__':
    import argparse
    logging.basicConfig(level=logging.INFO)

    parser = argparse.ArgumentParser(description='CropGPT RAG Index Builder')
    parser.add_argument('--build', action='store_true', help='Construire le vector store')
    args = parser.parse_args()

    if args.build:
        build_index()
