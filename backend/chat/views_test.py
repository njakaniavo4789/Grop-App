"""
Endpoint de test direct — Qwen2 Local
Utilise le modele Qwen2 charge localement.

Route : POST /api/chat/direct/
"""

import time
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status

from chat.pipeline.llm import generate as llm_generate


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def direct_chat(request):
    """
    POST /api/chat/direct/
    Body : { "message": "ta question" }

    Reponse via Qwen2 local - pas de RAG.
    """
    message = request.data.get("message", "").strip()

    if not message:
        return Response(
            {"error": 'Le champ "message" est requis.'},
            status=status.HTTP_400_BAD_REQUEST,
        )

    if len(message) > 2000:
        return Response(
            {"error": "Message trop long (max 2000 caracteres)."},
            status=status.HTTP_400_BAD_REQUEST,
        )

    try:
        # Appeler le moteur LLM local (Qwen2)
        pipeline_data = {
            "enriched_text": message,
            "rag_context": "",
            "confidence_level": "none",
        }

        result = llm_generate(pipeline_data, history=[])

        return Response(
            {
                "reply": result.get("reply", "Erreur de generation"),
                "meta": {
                    "provider": result.get("provider", "qwen2-local"),
                    "model": result.get("model", "Qwen2-0.5B"),
                    "input_tokens": result.get("input_tokens", 0),
                    "output_tokens": result.get("output_tokens", 0),
                    "latency_ms": result.get("latency_ms", 0),
                    "mode": "direct_no_rag",
                },
            }
        )

    except Exception as e:
        return Response(
            {"error": f"Erreur Qwen2 local: {str(e)}"},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR,
        )
