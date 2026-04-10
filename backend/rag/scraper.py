"""
Module de scraping pour alimenter le vector store RAG.

Supporte : HTML (sites web) + PDF

Usage CLI :
    python -m rag.scraper --all              ← scrape toutes les sources
    python -m rag.scraper --id wikipedia_riziculture_madagascar  ← une seule source
    python -m rag.scraper --test             ← scrape juste 2 sources pour tester

Les documents scrapés sont sauvegardés dans rag/data/documents/
avant d'être indexés par embeddings.py
"""
import json
import logging
import time
from pathlib import Path

logger = logging.getLogger(__name__)

SOURCES_FILE = Path(__file__).parent / 'data' / 'sources.json'
DOCUMENTS_DIR = Path(__file__).parent / 'data' / 'documents'


def load_sources() -> list:
    with open(SOURCES_FILE, encoding='utf-8') as f:
        return json.load(f)


# ─── Extraction HTML ──────────────────────────────────────────────────────────

def extract_html(url: str) -> str:
    """Télécharge une page web et extrait le texte visible."""
    import httpx
    from bs4 import BeautifulSoup

    headers = {
        'User-Agent': 'CropGPT-Research-Bot/1.0 (agricultural research; contact@cropgpt.mg)',
    }
    response = httpx.get(url, headers=headers, timeout=30, follow_redirects=True)
    response.raise_for_status()

    soup = BeautifulSoup(response.text, 'html.parser')

    # Supprimer les balises inutiles (menu, pub, pied de page...)
    for tag in soup(['script', 'style', 'nav', 'header', 'footer', 'aside',
                     'form', 'button', 'iframe', 'noscript']):
        tag.decompose()

    text = soup.get_text(separator=' ', strip=True)

    # Nettoyer les espaces multiples
    import re
    text = re.sub(r' {2,}', ' ', text)
    text = re.sub(r'\n{3,}', '\n\n', text)

    return text[:50000]  # Limite : 50 000 caractères par source


# ─── Extraction PDF ───────────────────────────────────────────────────────────

def extract_pdf(url: str) -> str:
    """
    Télécharge un PDF et extrait son texte.
    Utilise pdfplumber (plus précis que PyPDF2 pour les tableaux).

    Installation : pip install pdfplumber
    """
    try:
        import pdfplumber
        import httpx
        import io

        logger.info("Téléchargement PDF : %s", url)
        response = httpx.get(url, timeout=60, follow_redirects=True)
        response.raise_for_status()

        # Lire le PDF depuis la mémoire (sans sauvegarder le fichier)
        pdf_bytes = io.BytesIO(response.content)

        text_pages = []
        with pdfplumber.open(pdf_bytes) as pdf:
            logger.info("PDF : %d pages détectées", len(pdf.pages))
            # Limiter à 30 pages pour ne pas exploser la mémoire
            for i, page in enumerate(pdf.pages[:30]):
                page_text = page.extract_text()
                if page_text:
                    text_pages.append(f"[Page {i+1}]\n{page_text}")

        full_text = '\n\n'.join(text_pages)
        logger.info("PDF extrait : %d caractères", len(full_text))
        return full_text[:50000]

    except ImportError:
        logger.error("pdfplumber non installé. Lancer : pip install pdfplumber")
        return ''
    except Exception as e:
        logger.error("Erreur extraction PDF %s : %s", url, e)
        return ''


# ─── Scraper principal ────────────────────────────────────────────────────────

def scrape_one(source: dict) -> dict | None:
    """
    Scrape une seule source (HTML ou PDF selon son type).
    Retourne le document ou None si échec.
    """
    url = source['url']
    source_type = source.get('type', 'html')

    logger.info("Scraping [%s] : %s", source_type.upper(), source['title'])

    try:
        # PDF si le type est 'pdf' OU si l'URL se termine par .pdf
        if source_type == 'pdf' or url.lower().endswith('.pdf'):
            content = extract_pdf(url)
        else:
            content = extract_html(url)
    except Exception as e:
        logger.error("Erreur sur %s : %s", url, e)
        content = ''

    if not content or len(content) < 100:
        logger.warning("Contenu trop court ou vide pour : %s", source['title'])
        return None

    doc = {
        'id': source['id'],
        'title': source['title'],
        'url': url,
        'content': content,
        'topics': source['topics'],
        'language': source['language'],
        'type': source_type,
        'char_count': len(content),
    }

    # Sauvegarder dans rag/data/documents/
    DOCUMENTS_DIR.mkdir(parents=True, exist_ok=True)
    doc_path = DOCUMENTS_DIR / f"{source['id']}.json"
    with open(doc_path, 'w', encoding='utf-8') as f:
        json.dump(doc, f, ensure_ascii=False, indent=2)

    logger.info("Sauvegardé : %s (%d caractères)", source['id'], len(content))
    return doc


def scrape_all(delay_seconds: float = 2.0) -> list:
    """Scrape toutes les sources du fichier sources.json."""
    sources = load_sources()
    documents = []

    for source in sources:
        doc = scrape_one(source)
        if doc:
            documents.append(doc)
        time.sleep(delay_seconds)  # Être poli avec les serveurs

    logger.info("Total : %d/%d sources scrapées avec succès", len(documents), len(sources))
    return documents


def scrape_by_id(source_id: str) -> dict | None:
    """Scrape une seule source par son id."""
    sources = load_sources()
    for source in sources:
        if source['id'] == source_id:
            return scrape_one(source)
    logger.error("Source introuvable : %s", source_id)
    return None


def scrape_test(n: int = 2) -> list:
    """
    Scrape seulement les N premières sources — pour tester rapidement
    sans attendre le scraping complet.
    """
    sources = load_sources()[:n]
    documents = []
    for source in sources:
        doc = scrape_one(source)
        if doc:
            documents.append(doc)
        time.sleep(1)
    return documents


# ─── CLI ──────────────────────────────────────────────────────────────────────

if __name__ == '__main__':
    import argparse
    logging.basicConfig(
        level=logging.INFO,
        format='%(asctime)s [%(levelname)s] %(message)s',
    )

    parser = argparse.ArgumentParser(description='CropGPT RAG Scraper')
    parser.add_argument('--all', action='store_true', help='Scraper toutes les sources')
    parser.add_argument('--id', type=str, help='Scraper une source spécifique par son id')
    parser.add_argument('--test', action='store_true', help='Scraper 2 sources pour tester')
    args = parser.parse_args()

    if args.all:
        docs = scrape_all()
        print(f"\n✓ {len(docs)} documents scrapés et sauvegardés dans rag/data/documents/")

    elif args.id:
        doc = scrape_by_id(args.id)
        if doc:
            print(f"\n✓ Document sauvegardé : {doc['id']} ({doc['char_count']} caractères)")
            print(f"  Aperçu : {doc['content'][:200]}...")
        else:
            print(f"\n✗ Échec du scraping pour : {args.id}")

    elif args.test:
        docs = scrape_test(n=2)
        print(f"\n✓ Test : {len(docs)} documents scrapés")
        for doc in docs:
            print(f"  - {doc['id']} : {doc['char_count']} caractères")
            print(f"    Aperçu : {doc['content'][:150]}...\n")

    else:
        parser.print_help()
