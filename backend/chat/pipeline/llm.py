"""
Étape 4 du pipeline : appel au LLM avec le contexte RAG.

Tous les providers retournent maintenant un dict :
{
  "reply"       : str   — réponse finale
  "thinking"    : str   — raisonnement interne (Gemini 2.5 thinking mode)
  "input_tokens": int
  "output_tokens": int
  "latency_ms"  : int
}
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

2. SOURCES : Quand tu utilises des données des documents fournis, indique la source
   entre parenthèses. Ex : (Source : FAO Madagascar 2022)

3. HONNÊTETÉ : Ne jamais inventer de chiffres ou statistiques.
   Préférer "je ne dispose pas de données précises" à une approximation.

4. TRADUCTION : Les documents peuvent être en anglais/français/malgache.
   Traduis et synthétise toujours en français dans ta réponse finale.

5. UNITÉS : Ariary (Ar) pour les prix, hectares (ha), kg/ha ou t/ha pour les rendements.
"""


# ─── Gemini ───────────────────────────────────────────────────────────────────

def call_gemini(messages: list, system: str) -> dict:
    from google import genai
    from google.genai import types

    client = genai.Client(api_key=settings.GEMINI_API_KEY)
    model_name = settings.GEMINI_MODEL  # gemini-2.5-flash

    # Construire le contenu au format google.genai
    # Historique : tous les messages sauf le dernier
    contents = []
    for msg in messages[:-1]:
        role = "model" if msg["role"] == "assistant" else "user"
        contents.append(types.Content(role=role, parts=[types.Part(text=msg["content"])]))

    # Dernier message (question actuelle)
    last_message = messages[-1]["content"]
    contents.append(types.Content(role="user", parts=[types.Part(text=last_message)]))

    # Config de génération avec thinking mode pour gemini-2.5
    thinking_budget = 5000 if ("2.5" in model_name or "2.0" in model_name) else 0

    config = types.GenerateContentConfig(
        system_instruction=system,
        max_output_tokens=2048,
        temperature=1.0,
        thinking_config=types.ThinkingConfig(thinking_budget=thinking_budget),
    )

    t0 = time.time()
    try:
        response = client.models.generate_content(
            model=model_name,
            contents=contents,
            config=config,
        )
        latency = round((time.time() - t0) * 1000)

        # Extraire thinking + reply depuis les parts
        thinking_text = ""
        reply_text = ""

        try:
            for part in response.candidates[0].content.parts:
                if getattr(part, "thought", False):
                    thinking_text += part.text or ""
                else:
                    reply_text += part.text or ""
        except Exception:
            reply_text = response.text or ""

        if not reply_text:
            reply_text = response.text or ""

        # Tokens
        input_tokens  = getattr(response.usage_metadata, "prompt_token_count", 0) or 0
        output_tokens = getattr(response.usage_metadata, "candidates_token_count", 0) or 0

        return {
            "reply": reply_text,
            "thinking": thinking_text,
            "input_tokens": input_tokens,
            "output_tokens": output_tokens,
            "latency_ms": latency,
        }

    except Exception as e:
        error_str = str(e)
        latency = round((time.time() - t0) * 1000)
        logger.error("Erreur Gemini : %s", error_str)

        if "429" in error_str or "quota" in error_str.lower() or "RESOURCE_EXHAUSTED" in error_str:
            logger.warning("Gemini rate limit — attente 60s...")
            time.sleep(60)
            response = client.models.generate_content(
                model=model_name, contents=contents,
                config=types.GenerateContentConfig(system_instruction=system, max_output_tokens=2048),
            )
            return {
                "reply": response.text or "",
                "thinking": "",
                "input_tokens": 0,
                "output_tokens": 0,
                "latency_ms": latency,
            }

        if "blocked" in error_str.lower() or "safety" in error_str.lower():
            return {
                "reply": (
                    "Je ne peux pas répondre à cette question telle qu'elle est formulée. "
                    "Pourriez-vous la reformuler en précisant votre contexte agricole ?"
                ),
                "thinking": "",
                "input_tokens": 0,
                "output_tokens": 0,
                "latency_ms": latency,
            }

        if "503" in error_str or "UNAVAILABLE" in error_str:
            logger.warning("Gemini 503 — fallback gemini-2.0-flash...")
            response = client.models.generate_content(
                model="gemini-2.0-flash",
                contents=contents,
                config=types.GenerateContentConfig(system_instruction=system, max_output_tokens=2048),
            )
            return {
                "reply": response.text or "",
                "thinking": "",
                "input_tokens": 0,
                "output_tokens": 0,
                "latency_ms": latency,
            }

        raise


# ─── Anthropic ────────────────────────────────────────────────────────────────

def call_anthropic(messages: list, system: str) -> dict:
    import anthropic
    t0 = time.time()
    client = anthropic.Anthropic(api_key=settings.ANTHROPIC_API_KEY)
    response = client.messages.create(
        model="claude-opus-4-6",
        max_tokens=2048,
        system=system,
        messages=messages,
    )
    return {
        "reply": response.content[0].text,
        "thinking": "",
        "input_tokens": response.usage.input_tokens,
        "output_tokens": response.usage.output_tokens,
        "latency_ms": round((time.time() - t0) * 1000),
    }


# ─── OpenAI ───────────────────────────────────────────────────────────────────

def call_openai(messages: list, system: str) -> dict:
    from openai import OpenAI
    t0 = time.time()
    client = OpenAI(api_key=settings.OPENAI_API_KEY)
    full_messages = [{"role": "system", "content": system}] + messages
    response = client.chat.completions.create(model="gpt-4o", messages=full_messages, max_tokens=2048)
    return {
        "reply": response.choices[0].message.content,
        "thinking": "",
        "input_tokens": response.usage.prompt_tokens,
        "output_tokens": response.usage.completion_tokens,
        "latency_ms": round((time.time() - t0) * 1000),
    }


# ─── Ollama ───────────────────────────────────────────────────────────────────

def call_ollama(messages: list, system: str) -> dict:
    import httpx
    t0 = time.time()
    full_messages = [{"role": "system", "content": system}] + messages
    response = httpx.post(
        f"{settings.OLLAMA_BASE_URL}/api/chat",
        json={"model": "mistral", "messages": full_messages, "stream": False},
        timeout=120,
    )
    response.raise_for_status()
    data = response.json()
    return {
        "reply": data["message"]["content"],
        "thinking": "",
        "input_tokens": data.get("prompt_eval_count", 0),
        "output_tokens": data.get("eval_count", 0),
        "latency_ms": round((time.time() - t0) * 1000),
    }


# ─── Prompt builder ───────────────────────────────────────────────────────────

def build_prompt(user_message: str, rag_context: str, history: list,
                 confidence_level: str = "high") -> list:
    messages = []
    for msg in history[-20:]:
        messages.append({"role": msg["role"], "content": msg["content"]})

    confidence_instructions = {
        "high": "Tu disposes de données fiables ci-dessous. Base ta réponse sur ces données et cite tes sources.",
        "medium": "Les données disponibles sont partielles. Utilise-les mais signale les limites.",
        "low": "Données générales disponibles. Recommande de consulter un expert local (MAEP/FOFIFA).",
        "none": "IMPORTANT : Pas de données spécifiques. Ne pas inventer de chiffres. Consulter MAEP/FOFIFA.",
    }
    instruction = confidence_instructions.get(confidence_level, confidence_instructions["none"])

    if rag_context:
        user_content = (
            f"{user_message}\n\n---\n"
            f"[Instructions : {instruction}]\n\n"
            f"[Données documentaires — répondre en français]\n{rag_context}\n---"
        )
    else:
        user_content = f"{user_message}\n\n[Instruction : {instruction}]"

    messages.append({"role": "user", "content": user_content})
    return messages


# ─── Point d'entrée principal ─────────────────────────────────────────────────

def generate(pipeline_data: dict, history: list = None) -> dict:
    """Retourne un dict { reply, thinking, input_tokens, output_tokens, latency_ms }."""
    if history is None:
        history = []

    messages = build_prompt(
        user_message=pipeline_data["enriched_text"],
        rag_context=pipeline_data.get("rag_context", ""),
        history=history,
        confidence_level=pipeline_data.get("confidence_level", "none"),
    )

    provider = settings.LLM_PROVIDER
    logger.info("LLM provider : %s", provider)

    try:
        if provider == "gemini":
            return call_gemini(messages, SYSTEM_PROMPT)
        elif provider == "anthropic":
            return call_anthropic(messages, SYSTEM_PROMPT)
        elif provider == "openai":
            return call_openai(messages, SYSTEM_PROMPT)
        elif provider == "ollama":
            return call_ollama(messages, SYSTEM_PROMPT)
        else:
            raise ValueError(f"Provider inconnu : {provider}")
    except Exception as e:
        logger.error("Erreur LLM (%s) : %s", provider, e)
        return {
            "reply": "Désolé, problème technique. Réessayez dans quelques instants.",
            "thinking": "",
            "input_tokens": 0,
            "output_tokens": 0,
            "latency_ms": 0,
        }
