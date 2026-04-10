"""
Endpoint de test direct — bypasse complètement le pipeline RAG.
Envoie le message directement à Gemini et retourne la réponse.

Route : POST /api/chat/direct/
Utilité : tester que Gemini répond depuis le chat UI, sans RAG, sans ontologie.
"""
import time
from django.conf import settings
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status

SYSTEM_PROMPT_TEST = """Tu es CropGPT, un assistant agricole spécialisé dans l'agriculture malgache.
Réponds toujours en français, de façon concise et utile.
Si la question n'est pas liée à l'agriculture, rappelle poliment ton rôle."""


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def direct_chat(request):
    """
    POST /api/chat/direct/
    Body : { "message": "ta question" }

    Test simple : message → Gemini → réponse
    Aucun RAG, aucune ontologie, aucune base de données de connaissances.
    """
    message = request.data.get('message', '').strip()

    if not message:
        return Response(
            {'error': 'Le champ "message" est requis.'},
            status=status.HTTP_400_BAD_REQUEST,
        )

    if len(message) > 2000:
        return Response(
            {'error': 'Message trop long (max 2000 caractères).'},
            status=status.HTTP_400_BAD_REQUEST,
        )

    t0 = time.time()

    try:
        import google.generativeai as genai

        genai.configure(api_key=settings.GEMINI_API_KEY)

        model = genai.GenerativeModel(
            model_name=settings.GEMINI_MODEL,
            system_instruction=SYSTEM_PROMPT_TEST,
        )

        response = model.generate_content(message)
        reply = response.text
        latency = round((time.time() - t0) * 1000)

        return Response({
            'reply': reply,
            'meta': {
                'provider': 'gemini',
                'model': settings.GEMINI_MODEL,
                'latency_ms': latency,
                'mode': 'direct_no_rag',
            }
        })

    except ImportError:
        return Response(
            {'error': 'google-generativeai non installé. Lancer : pip install google-generativeai'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR,
        )
    except Exception as e:
        error_str = str(e)
        if '429' in error_str:
            return Response(
                {'error': 'Limite Gemini atteinte (15 req/min). Réessayer dans 1 minute.'},
                status=status.HTTP_429_TOO_MANY_REQUESTS,
            )
        if '403' in error_str or 'API_KEY' in error_str:
            return Response(
                {'error': 'Clé Gemini invalide. Vérifier GEMINI_API_KEY dans .env'},
                status=status.HTTP_403_FORBIDDEN,
            )
        return Response(
            {'error': f'Erreur Gemini : {error_str}'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR,
        )
