"""
Script de test rapide pour vérifier que Gemini API fonctionne.
Lancer depuis backend/ :
    python test_gemini.py
"""
import os
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings.development')

# Charger la clé depuis .env si présent
from pathlib import Path
env_file = Path(__file__).parent / '.env'
if env_file.exists():
    for line in env_file.read_text().splitlines():
        if '=' in line and not line.startswith('#'):
            key, _, value = line.partition('=')
            os.environ.setdefault(key.strip(), value.strip())

GEMINI_API_KEY = os.environ.get('GEMINI_API_KEY', '')
GEMINI_MODEL   = os.environ.get('GEMINI_MODEL', 'gemini-2.0-flash')

if not GEMINI_API_KEY:
    print("ERREUR : GEMINI_API_KEY non défini dans .env")
    print("→ Copier .env.example en .env et remplir GEMINI_API_KEY")
    exit(1)

print(f"Modèle utilisé : {GEMINI_MODEL}")
print(f"Clé API        : {GEMINI_API_KEY[:10]}...")
print("Test en cours...\n")

try:
    import google.generativeai as genai

    genai.configure(api_key=GEMINI_API_KEY)
    model = genai.GenerativeModel(
        model_name=GEMINI_MODEL,
        system_instruction=(
            "Tu es CropGPT, un assistant agricole malgache. "
            "Réponds toujours en français."
        ),
    )

    response = model.generate_content(
        "En une phrase, quel est le rendement moyen du riz irrigué à Madagascar ?"
    )

    print("✓ Gemini répond correctement !\n")
    print(f"Réponse : {response.text}")
    print("\n→ L'intégration est fonctionnelle. Tu peux démarrer le serveur.")

except ImportError:
    print("ERREUR : google-generativeai non installé")
    print("→ Lancer : pip install google-generativeai")

except Exception as e:
    print(f"ERREUR : {e}")
    if '403' in str(e):
        print("→ Clé API invalide ou non activée sur aistudio.google.com")
    elif '429' in str(e):
        print("→ Rate limit atteint — attendre 1 minute")
