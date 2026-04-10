"""
Importe un fichier PDF ou TXT local dans la knowledge base RAG.
Utile pour les documents téléchargés manuellement depuis Google.

Usage :
    python -m rag.import_local --file "C:/Downloads/rapport_fofifa.pdf" \
                               --id "fofifa_rapport_rendement_2022" \
                               --title "FOFIFA — Rapport rendement riz 2022" \
                               --language fr \
                               --topics yield_prediction varieties

    python -m rag.import_local --file "C:/Downloads/irri_blast.pdf" \
                               --id "irri_pyriculariose_en" \
                               --title "IRRI — Rice Blast Disease Management" \
                               --language en \
                               --topics pest_disease
"""
import json
import logging
import argparse
from pathlib import Path

logger = logging.getLogger(__name__)

KNOWLEDGE_BASE_DIR = Path(__file__).parent / 'data' / 'knowledge_base'
VALID_TOPICS = [
    'yield_prediction', 'varieties', 'soil_health',
    'water_management', 'pest_disease', 'climate', 'market',
]


def extract_text_from_pdf(file_path: Path) -> str:
    """Extrait le texte d'un PDF local avec pdfplumber."""
    try:
        import pdfplumber
        text_pages = []
        with pdfplumber.open(file_path) as pdf:
            print(f"  PDF détecté : {len(pdf.pages)} pages")
            for i, page in enumerate(pdf.pages[:50]):  # max 50 pages
                page_text = page.extract_text()
                if page_text and page_text.strip():
                    text_pages.append(f"[Page {i+1}]\n{page_text.strip()}")
        return '\n\n'.join(text_pages)
    except ImportError:
        print("ERREUR : pdfplumber non installé. Lancer : pip install pdfplumber")
        return ''


def extract_text_from_txt(file_path: Path) -> str:
    """Lit un fichier texte brut."""
    return file_path.read_text(encoding='utf-8', errors='replace')


def import_file(file_path: str, doc_id: str, title: str,
                language: str, topics: list, source_url: str = '') -> bool:
    """
    Importe un fichier local dans la knowledge base.
    Retourne True si succès.
    """
    path = Path(file_path)

    if not path.exists():
        print(f"ERREUR : fichier introuvable → {file_path}")
        return False

    # Extraction du texte selon le type de fichier
    ext = path.suffix.lower()
    print(f"Traitement : {path.name} ({ext})")

    if ext == '.pdf':
        content = extract_text_from_pdf(path)
    elif ext in ('.txt', '.md'):
        content = extract_text_from_txt(path)
    else:
        print(f"ERREUR : format non supporté ({ext}). Utiliser .pdf ou .txt")
        return False

    if not content or len(content) < 50:
        print("ERREUR : contenu extrait trop court ou vide")
        return False

    # Limiter à 60 000 caractères
    if len(content) > 60000:
        print(f"  Tronqué : {len(content)} → 60 000 caractères")
        content = content[:60000]

    # Créer le document JSON
    doc = {
        'id': doc_id,
        'title': title,
        'url': source_url,
        'source': 'knowledge_base_local',
        'language': language,
        'topics': topics,
        'char_count': len(content),
        'content': content,
    }

    # Sauvegarder dans knowledge_base/
    KNOWLEDGE_BASE_DIR.mkdir(parents=True, exist_ok=True)
    output_path = KNOWLEDGE_BASE_DIR / f"{doc_id}.json"
    with open(output_path, 'w', encoding='utf-8') as f:
        json.dump(doc, f, ensure_ascii=False, indent=2)

    print(f"\n✓ Importé avec succès !")
    print(f"  Fichier  : {output_path}")
    print(f"  Contenu  : {len(content)} caractères")
    print(f"  Aperçu   : {content[:200]}...")
    print(f"\nProchaine étape : python -m rag.embeddings --build")
    return True


if __name__ == '__main__':
    logging.basicConfig(level=logging.WARNING)

    parser = argparse.ArgumentParser(
        description='CropGPT — Importer un document local dans le RAG'
    )
    parser.add_argument('--file',     required=True,  help='Chemin vers le PDF ou TXT')
    parser.add_argument('--id',       required=True,  help='Identifiant unique (ex: fofifa_riz_2022)')
    parser.add_argument('--title',    required=True,  help='Titre lisible du document')
    parser.add_argument('--language', required=True,  choices=['fr', 'en', 'mg'])
    parser.add_argument('--topics',   required=True,  nargs='+', choices=VALID_TOPICS,
                        help=f'Un ou plusieurs topics parmi : {VALID_TOPICS}')
    parser.add_argument('--url',      default='',     help='URL source originale (optionnel)')

    args = parser.parse_args()
    import_file(args.file, args.id, args.title, args.language, args.topics, args.url)
