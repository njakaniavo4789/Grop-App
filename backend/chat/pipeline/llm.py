"""
Étienne 4 du pipeline : appel au LLM Qwen2 local.

TOUT EST EN LOCAL - Pas d'API externe.
"""

import logging
import time
import os
import gc
from pathlib import Path

logger = logging.getLogger(__name__)

# ─── Configuration ───────────────────────────────────────────────────────────────────
BASE_DIR = Path(__file__).resolve().parent.parent.parent
MODEL_PATH = BASE_DIR / "models"

# Inference config
MAX_NEW_TOKENS = 512  # Reduit pour test plus rapide
TEMPERATURE = 0.7
TOP_P = 0.9
TOP_K = 50
REPETITION_PENALTY = 1.1
DEVICE = "cuda"  # GPU acceleration

# Model charge une seule fois
_qwen2_model = None
_qwen2_tokenizer = None
_load_attempted = False

# ─── Imports ───────────────────────────────────────────────────────────────────
import torch
from transformers import AutoModelForCausalLM, AutoTokenizer

SYSTEM_PROMPT = """Tu es CropGPT, un assistant agricole expert specialise en agriculture malgache.
Tu reponds UNIQUEMENT aux questions agricoles (cultures, sols, maladies, rendements, irrigation, varietes, meteo, prix agricoles).

═══════════════════════════════════════
REGLES DE FORMAT — OBLIGATOIRES
═══════════════════════════════════════

Chaque reponse DOIT suivre cette structure Markdown :

## [Titre court du sujet]

Phrase d'introduction concise (1-2 lignes maximum).

### [Sous-section si necessaire]

- Point 1
- Point 2
- Point 3

1. Etape 1
2. Etape 2
3. Etape 3

| Colonne A | Colonne B | Colonne C |
|-----------|-----------|-----------|
| valeur    | valeur    | valeur    |

> **Note importante :** information critique ici.

═══════════════════════════════════════
REGLES DE CONTENU — OBLIGATOIRES
═══════════════════════════════════════

1. LANGUE : Toujours en francais. En malgache si l'utilisateur ecrit en malgache.

2. STRUCTURE : Toujours utiliser dans l'ordre :
   - Un titre ## principal
   - Une introduction courte (1-2 phrases)
   - Des sous-sections ### si le sujet a plusieurs aspects
   - Des listes a puces pour les enumerations
   - Des listes numerotees pour les etapes sequentielles
   - Un tableau si tu compares plusieurs elements
   - Une note finale > **Note :** si necessaire

3. GRAS : Utiliser **gras** uniquement pour :
   - Les noms de varietes (ex: **FOFIFA 154**, **Makalioka**)
   - Les chiffres cles (ex: **3.5 t/ha**)
   - Les avertissements importants

4. SOURCES : Toujours citer entre parentheses.
   Ex : (Source : FOFIFA 2022) ou (Source : FAO Madagascar 2023)

5. HONNETETEE : Ne jamais inventer de chiffres. Ecrire "donnees non disponibles" si necessaire.

6. UNITES : Ariary (Ar), hectares (ha), kg/ha, t/ha.

7. REPONSE UNIQUE : Une seule reponse directe. Pas de faux dialogue. Pas de continuation apres la fin.

EXEMPLE DE BONNE REPONSE :

## Variétés de riz recommandées à Madagascar

Les principales variétés cultivées à Madagascar sont adaptées aux différentes zones climatiques.

### Variétés des Hauts Plateaux

- **FOFIFA 154** — rendement moyen **3,5 t/ha**, adaptée aux altitudes > 1000 m
- **Makalioka** — variété traditionnelle, qualité gustative supérieure
- **NERICA 4** — variété améliorée, résistante à la sécheresse

### Comparaison des rendements

| Variété | Rendement (t/ha) | Altitude | Résistance |
|---------|-----------------|----------|------------|
| FOFIFA 154 | 3,5 | > 1000 m | Bonne |
| Makalioka | 2,8 | 800-1200 m | Moyenne |
| NERICA 4 | 4,0 | < 800 m | Très bonne |

> **Note :** Ces rendements sont obtenus avec la méthode SRI et une bonne gestion de l'eau. (Source : FOFIFA 2022)
"""

# Sequences qui indiquent la fin de la generation (le modele simule un nouveau tour)
_STOP_SEQUENCES = [
    "<|user|>", "<|end|>", "<|assistant|>",
    "\nHuman:", "\nUser:", "\nUtilisateur:",
    "\nMachine Learning Model:", "\nAssistant:",
    "Human:", "User :", "Machine Learning",
]


# ─── Chargement du modele ───────────────────────────────────────────────────


def load_qwen2_model():
    """Charge le modele Qwen2 une seule fois."""
    global _qwen2_model, _qwen2_tokenizer, _load_attempted

    if _load_attempted and _qwen2_model is not None:
        return _qwen2_tokenizer, _qwen2_model

    _load_attempted = True

    try:
        model_path_str = str(MODEL_PATH)

        if not MODEL_PATH.exists():
            logger.error("Modele non trouve: %s", MODEL_PATH)
            raise FileNotFoundError(f"Dossier modele introuvable: {MODEL_PATH}")

        logger.info("Chargement du modele depuis: %s", model_path_str)

        # Chargement du tokenizer
        _qwen2_tokenizer = AutoTokenizer.from_pretrained(
            model_path_str, trust_remote_code=True
        )

        # Verification que le tokenizer a le bos_token_id
        if _qwen2_tokenizer.pad_token is None:
            _qwen2_tokenizer.pad_token = _qwen2_tokenizer.eos_token

        # Chargement du modele sur GPU avec FP16 pour acceleration
        _qwen2_model = AutoModelForCausalLM.from_pretrained(
            model_path_str,
            low_cpu_mem_usage=True,
            trust_remote_code=True,
        )
        # Deplacer sur GPU
        _qwen2_model = _qwen2_model.to(DEVICE)

        _qwen2_model.eval()  # Mode evaluation

        _qwen2_model.eval()  # Mode evaluation

        logger.info("Modele charge avec succes!")

        # Info memoire
        try:
            import torch

            mem_params = sum(
                p.numel() * p.element_size() for p in _qwen2_model.parameters()
            ) / (1024**2)
            logger.info("Memoire modele: %.1f MB", mem_params)
        except Exception:
            pass

        return _qwen2_tokenizer, _qwen2_model

    except Exception as e:
        logger.error("Erreur chargement modele: %s", e)
        raise


def get_model_info():
    """Retourne les infos sur le modele."""
    try:
        tokenizer, model = load_qwen2_model()
        import torch

        num_params = sum(p.numel() for p in model.parameters())
        mem_params = sum(p.numel() * p.element_size() for p in model.parameters()) / (
            1024**2
        )

        return {
            "model_type": model.config.model_type if model.config else "unknown",
            "num_parameters": num_params,
            "memory_mb": round(mem_params, 1),
            "device": str(next(model.parameters()).device),
        }
    except Exception as e:
        return {"error": str(e)}


# ─── Streaming Inference ────────────────────────────────────────────


def _post_process(text: str) -> str:
    """
    Nettoie la reponse generee :
    - Coupe au premier marqueur de faux dialogue
    - Supprime les prefixes de role
    - Supprime les caracteres non-latin parasites
    """
    import re

    # Couper des la premiere sequence de stop
    for seq in _STOP_SEQUENCES:
        idx = text.find(seq)
        if idx > 0:
            text = text[:idx]

    # Supprimer les lignes qui ressemblent a des marqueurs de role
    lines = []
    for line in text.splitlines():
        stripped = line.strip()
        skip = any(
            stripped.startswith(m) for m in [
                "Human:", "User:", "Utilisateur:", "Machine Learning",
                "Assistant:", "<|", "Human :", "User :",
            ]
        )
        if not skip:
            lines.append(line)
    text = "\n".join(lines)

    # Supprimer les blocs de caracteres CJK (chinois/japonais/coreen parasites)
    text = re.sub(r'[\u4e00-\u9fff\u3000-\u303f\uff00-\uffef]+', '', text)

    return text.strip()


def stream_generate(prompt: str):
    """Generator qui yield chaque token pour streaming avec detection des stop sequences."""
    import torch

    tokenizer, model = load_qwen2_model()

    input_ids = tokenizer(prompt, return_tensors="pt")["input_ids"].to(model.device)
    attention_mask = torch.ones_like(input_ids)

    max_tokens = MAX_NEW_TOKENS
    accumulated = ""  # Texte accumule pour detecter les stop sequences multi-tokens

    for token_idx in range(max_tokens):
        with torch.no_grad():
            outputs = model.generate(
                input_ids=input_ids,
                attention_mask=attention_mask,
                max_new_tokens=1,
                temperature=TEMPERATURE,
                top_p=TOP_P,
                top_k=TOP_K,
                repetition_penalty=REPETITION_PENALTY,
                do_sample=True,
                pad_token_id=tokenizer.pad_token_id,
                eos_token_id=tokenizer.eos_token_id,
                use_cache=True,
            )

        if outputs.shape[1] <= input_ids.shape[1]:
            break

        new_token_id = outputs[0, -1].item()
        token_text = tokenizer.decode([new_token_id], skip_special_tokens=False)

        # Detecter EOS ou tokens speciaux de fin
        if new_token_id == tokenizer.eos_token_id:
            yield {"token": "", "done": True, "progress": 100}
            break

        # Decoder sans tokens speciaux pour le texte visible
        clean_token = tokenizer.decode([new_token_id], skip_special_tokens=True)

        # Update pour la prochaine iteration
        input_ids = outputs
        attention_mask = torch.ones_like(outputs)

        # Accumuler et verifier les stop sequences
        accumulated += clean_token
        stop_hit = False
        for seq in _STOP_SEQUENCES:
            if seq in accumulated:
                # Couper et arreter
                cut_idx = accumulated.find(seq)
                # Si on a du texte avant, on l'a deja envoye token par token
                stop_hit = True
                break

        if stop_hit:
            yield {"token": "", "done": True, "progress": 100}
            break

        if clean_token:
            progress = min(int(((token_idx + 1) / max_tokens) * 100), 99)
            yield {"token": clean_token, "done": False, "progress": progress}

    yield {"token": "", "done": True, "progress": 100}


# ─── Inference Qwen2 ────────────────────────────────────────────────────────


def call_qwen2(prompt: str) -> dict:
    """Genere une reponse avec Qwen2 local."""
    t0 = time.time()

    tokenizer, model = load_qwen2_model()

    # Tokenization
    inputs = tokenizer(
        prompt,
        return_tensors="pt",
        padding=True,
        truncation=True,
        max_length=2048,
    )

    # Deplacer sur device
    inputs = {k: v.to(model.device) for k, v in inputs.items()}

    # Generation
    with torch.no_grad():
        outputs = model.generate(
            **inputs,
            max_new_tokens=MAX_NEW_TOKENS,
            temperature=TEMPERATURE,
            top_p=TOP_P,
            top_k=TOP_K,
            repetition_penalty=REPETITION_PENALTY,
            do_sample=True,
            pad_token_id=tokenizer.pad_token_id,
            eos_token_id=tokenizer.eos_token_id,
            use_cache=True,
        )

    # Decoder seulement la nouvelle partie (pas le prompt)
    input_len = inputs["input_ids"].shape[1]
    generated_tokens = outputs[0][input_len:]
    response = tokenizer.decode(generated_tokens, skip_special_tokens=True)
    response = _post_process(response)

    latency = round((time.time() - t0) * 1000)

    # Compter les tokens
    input_tokens = inputs["input_ids"].shape[1]
    output_tokens = len(generated_tokens)

    # Tokens par seconde
    tps = round(output_tokens / (latency / 1000), 1) if latency > 0 else 0

    return {
        "reply": response,
        "thinking": "",  # Pas de thinking mode en local (memoire limitee)
        "input_tokens": input_tokens,
        "output_tokens": output_tokens,
        "latency_ms": latency,
        "tokens_per_second": tps,
    }


# ─── Prompt builder ───────────────────────────────────────────────────────────


def build_prompt(
    user_message: str, rag_context: str, history: list, confidence_level: str = "high"
) -> str:
    """Construit le prompt pour Qwen2."""

    # System prompt
    full_prompt = f"<|system|>\n{SYSTEM_PROMPT}\n<|end|>\n"

    # Historique (max 10 echanges)
    for msg in history[-20:]:
        if msg["role"] == "user":
            full_prompt += f"<|user|>\n{msg['content']}\n<|end|>\n"
        else:
            full_prompt += f"<|assistant|>\n{msg['content']}\n<|end|>\n"

    # Instructions de confiance
    confidence_instructions = {
        "high": "Tu disposes de donnees fiables ci-dessous. Base ta reponse sur ces donnees et cite tes sources.",
        "medium": "Les donnees disponibles sont partielles. Utilise-les mais signale les limites.",
        "low": "Donnees generales disponibles. Recommande de consulter un expert local (MAEP/FOFIFA).",
        "none": "IMPORTANT : Pas de donnees specifiques. Ne pas inventer de chiffres. Consulter MAEP/FOFIFA.",
    }
    instruction = confidence_instructions.get(
        confidence_level, confidence_instructions["none"]
    )

    # Contexte RAG
    if rag_context:
        user_content = (
            f"{user_message}\n\n---\n"
            f"[Instructions : {instruction}]\n\n"
            f"[Donnees documentaires — repondre en francais]\n{rag_context}\n---"
        )
    else:
        user_content = f"{user_message}\n\n[Instruction : {instruction}]"

    full_prompt += f"<|user|>\n{user_content}\n<|end|>\n"
    full_prompt += "<|assistant|>\n"

    return full_prompt


# ─── Point d'entree principal ─────────────────────────────────────────────────


def generate(pipeline_data: dict, history: list = None) -> dict:
    """Retourne un dict { reply, thinking, input_tokens, output_tokens, latency_ms }."""

    if history is None:
        history = []

    try:
        # Construire le prompt
        full_prompt = build_prompt(
            user_message=pipeline_data["enriched_text"],
            rag_context=pipeline_data.get("rag_context", ""),
            history=history,
            confidence_level=pipeline_data.get("confidence_level", "none"),
        )

        # Generation
        result = call_qwen2(full_prompt)

        # Ajouter infos supplementaires
        result["provider"] = "qwen2-local"
        result["model"] = "Qwen2-0.5B-Instruct"
        result["max_tokens"] = MAX_NEW_TOKENS
        result["temperature"] = TEMPERATURE

        return result

    except Exception as e:
        logger.error("Erreur Qwen2 local: %s", e)
        return {
            "reply": "Desole, probleme technique avec le modele local. Redemarrage du serveur peut etre necessaire.",
            "thinking": "",
            "input_tokens": 0,
            "output_tokens": 0,
            "latency_ms": 0,
            "error": str(e),
        }


# ─── Utilities ────────────────────────────────────────────────────────


def clear_cache():
    """Libere la memoire GPU/CPU."""
    global _qwen2_model, _qwen2_tokenizer

    try:
        import torch

        torch.cuda.empty_cache() if torch.cuda.is_available() else None
    except Exception:
        pass

    gc.collect()
    logger.info("Cache libere")


def reload_model():
    """Recharge le modele (pour mise a jour)."""
    global _qwen2_model, _qwen2_tokenizer, _load_attempted

    _qwen2_model = None
    _qwen2_tokenizer = None
    _load_attempted = False

    clear_cache()
    load_qwen2_model()

    return {"status": "Modele recharge"}
