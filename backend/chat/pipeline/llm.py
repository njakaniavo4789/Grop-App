"""
Étape 4 du pipeline : appel au LLM avec le contexte RAG.

Providers supportés :
  - gemini    : Google Gemini API (FREE tier disponible) ← défaut
  - anthropic : Claude (Anthropic)
  - openai    : GPT-4o
  - ollama    : modèle local (Mistral, LLaMA…)

Input  : dict complet du pipeline { enriched_text, rag_context, confidence_level, … }
Output : str — réponse de l'assistant en français
"""
import logging
import time
from django.conf import settings

logger = logging.getLogger(__name__)

SYSTEM_PROMPT = """Tu es CropGPT, un assistant agricole expert spécialisé dans l'agriculture malgache,
en particulier la riziculture. Tu aides les agriculteurs et chercheurs à :
- Optimiser leurs rendements (riz, manioc, maïs, vanille, girofle, café)
- Diagnostiquer les maladies et ravageurs des cultures
- Gérer l'eau et la fertilité des sols
- Comprendre les conditions climatiques et leurs impacts
- Identifier les opportunités agricoles par région de Madagascar

RÈGLES ABSOLUES :
1. LANGUE : Réponds TOUJOURS en français, même si les documents de contexte sont en anglais.
   Si l'utilisateur écrit en malgache, réponds en malgache.
   Ne jamais répondre en anglais sauf si explicitement demandé.

2. SOURCES : Quand tu utilises des données des documents fournis, indique la source
   entre parenthèses. Ex : (Source : FAO Madagascar 2022)
   Si la donnée vient de ta connaissance générale, écris (connaissance générale).

3. HONNÊTETÉ : Si tu n'as pas d'information certaine sur Madagascar spécifiquement,
   dis-le clairement. Ne jamais inventer de chiffres ou statistiques.
   Préférer "je ne dispose pas de données précises sur ce point" à une approximation.

4. TRADUCTION : Les documents de contexte peuvent être en anglais, français ou malgache.
   Tu lis et comprends toutes ces langues. Traduis et synthétise toujours en français
   dans ta réponse finale.

5. UNITÉS : Utiliser les unités malgaches : Ariary (Ar) pour les prix,
   hectares (ha) pour les surfaces, kg/ha ou t/ha pour les rendements.
"""


# ─── Gemini ───────────────────────────────────────────────────────────────────

def call_gemini(messages: list, system: str) -> str:
    """
    Appelle Google Gemini API.
    Gère automatiquement le rate limit du free tier (15 RPM).
    """
    import google.generativeai as genai

    genai.configure(api_key=settings.GEMINI_API_KEY)

    model = genai.GenerativeModel(
        model_name=settings.GEMINI_MODEL,        # gemini-2.0-flash par défaut
        system_instruction=system,
    )

    # Convertir l'historique au format Gemini
    # Gemini utilise : role = 'user' | 'model'  (pas 'assistant')
    gemini_history = []
    for msg in messages[:-1]:  # tout sauf le dernier message
        gemini_role = 'model' if msg['role'] == 'assistant' else 'user'
        gemini_history.append({
            'role': gemini_role,
            'parts': [msg['content']],
        })

    # Démarrer une session de chat avec l'historique
    chat = model.start_chat(history=gemini_history)

    # Envoyer le dernier message (la question actuelle)
    last_message = messages[-1]['content']

    try:
        response = chat.send_message(last_message)
        return response.text

    except Exception as e:
        error_str = str(e)

        # Rate limit atteint (429) → attendre et réessayer une fois
        if '429' in error_str or 'quota' in error_str.lower():
            logger.warning("Gemini rate limit atteint — attente 60s...")
            time.sleep(60)
            try:
                response = chat.send_message(last_message)
                return response.text
            except Exception as retry_error:
                logger.error("Gemini retry échoué : %s", retry_error)
                raise

        # Contenu bloqué par le filtre de sécurité Gemini
        if 'blocked' in error_str.lower() or 'safety' in error_str.lower():
            logger.warning("Gemini safety filter déclenché")
            return (
                "Je ne peux pas répondre à cette question telle qu'elle est formulée. "
                "Pourriez-vous la reformuler en précisant votre contexte agricole ?"
            )

        raise


# ─── Anthropic (Claude) ───────────────────────────────────────────────────────

def call_anthropic(messages: list, system: str) -> str:
    import anthropic
    client = anthropic.Anthropic(api_key=settings.ANTHROPIC_API_KEY)
    response = client.messages.create(
        model='claude-opus-4-6',
        max_tokens=2048,
        system=system,
        messages=messages,
    )
    return response.content[0].text


# ─── OpenAI ───────────────────────────────────────────────────────────────────

def call_openai(messages: list, system: str) -> str:
    from openai import OpenAI
    client = OpenAI(api_key=settings.OPENAI_API_KEY)
    full_messages = [{'role': 'system', 'content': system}] + messages
    response = client.chat.completions.create(
        model='gpt-4o',
        messages=full_messages,
        max_tokens=2048,
    )
    return response.choices[0].message.content


# ─── Ollama (local) ───────────────────────────────────────────────────────────

def call_ollama(messages: list, system: str) -> str:
    import httpx
    full_messages = [{'role': 'system', 'content': system}] + messages
    response = httpx.post(
        f"{settings.OLLAMA_BASE_URL}/api/chat",
        json={'model': 'mistral', 'messages': full_messages, 'stream': False},
        timeout=120,
    )
    response.raise_for_status()
    return response.json()['message']['content']


# ─── Prompt builder ───────────────────────────────────────────────────────────

def build_prompt(user_message: str, rag_context: str, history: list,
                 confidence_level: str = 'high') -> list:
    """
    Construit la liste de messages pour le LLM.
    Adapte les instructions selon la confiance des données RAG.
    """
    messages = []

    # Historique de la conversation (max 20 derniers messages)
    for msg in history[-20:]:
        messages.append({'role': msg['role'], 'content': msg['content']})

    # Instructions au LLM selon le niveau de confiance RAG
    confidence_instructions = {
        'high': (
            "Tu disposes de données fiables et pertinentes ci-dessous. "
            "Base ta réponse principalement sur ces données et cite tes sources."
        ),
        'medium': (
            "Les données disponibles sont partiellement pertinentes. "
            "Utilise-les mais signale explicitement les limites de ta réponse."
        ),
        'low': (
            "Les données disponibles sont générales. Réponds avec ces informations "
            "mais précise que des données spécifiques manquent "
            "et recommande de consulter un expert local (MAEP/FOFIFA)."
        ),
        'none': (
            "IMPORTANT : Tu n'as pas de données spécifiques pour cette question. "
            "Réponds uniquement avec ce que tu sais de façon certaine. "
            "Ne pas inventer de chiffres. "
            "Recommande de consulter un expert local (MAEP/FOFIFA)."
        ),
    }

    instruction = confidence_instructions.get(confidence_level, confidence_instructions['none'])

    if rag_context:
        user_content = (
            f"{user_message}\n\n"
            f"---\n"
            f"[Instructions : {instruction}]\n\n"
            f"[Données documentaires — lire en anglais si nécessaire, répondre en français]\n"
            f"{rag_context}\n"
            f"---"
        )
    else:
        user_content = (
            f"{user_message}\n\n"
            f"[Instruction : {instruction}]"
        )

    messages.append({'role': 'user', 'content': user_content})
    return messages


# ─── Point d'entrée principal ─────────────────────────────────────────────────

def generate(pipeline_data: dict, history: list = None) -> str:
    """
    Choisit le provider LLM selon LLM_PROVIDER dans .env
    et génère la réponse.
    """
    if history is None:
        history = []

    messages = build_prompt(
        user_message=pipeline_data['enriched_text'],
        rag_context=pipeline_data.get('rag_context', ''),
        history=history,
        confidence_level=pipeline_data.get('confidence_level', 'none'),
    )

    provider = settings.LLM_PROVIDER
    logger.info("LLM provider : %s", provider)

    try:
        if provider == 'gemini':
            return call_gemini(messages, SYSTEM_PROMPT)
        elif provider == 'anthropic':
            return call_anthropic(messages, SYSTEM_PROMPT)
        elif provider == 'openai':
            return call_openai(messages, SYSTEM_PROMPT)
        elif provider == 'ollama':
            return call_ollama(messages, SYSTEM_PROMPT)
        else:
            raise ValueError(f"Provider LLM inconnu : {provider}. "
                             f"Valeurs valides : gemini, anthropic, openai, ollama")

    except Exception as e:
        logger.error("Erreur LLM (%s) : %s", provider, e)
        return (
            "Désolé, je rencontre un problème technique avec le service IA. "
            "Veuillez réessayer dans quelques instants."
        )
