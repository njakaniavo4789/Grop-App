import time
from rest_framework import status, viewsets, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response

from .models import Conversation, Message
from .serializers import ConversationSerializer, ChatRequestSerializer
from .pipeline import normalizer, ontology, rag, llm


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def chat(request):
    """
    POST /api/chat/
    Exécute le pipeline complet : normalizer → ontologie → RAG → LLM
    """
    serializer = ChatRequestSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)

    user_message = serializer.validated_data['message']
    conversation_id = serializer.validated_data.get('conversation_id')

    # Récupérer ou créer la conversation
    if conversation_id:
        try:
            conversation = Conversation.objects.get(pk=conversation_id, user=request.user)
        except Conversation.DoesNotExist:
            return Response({'error': 'Conversation introuvable.'}, status=status.HTTP_404_NOT_FOUND)
    else:
        title = user_message[:60] + ('…' if len(user_message) > 60 else '')
        conversation = Conversation.objects.create(user=request.user, title=title)

    # Historique de la conversation pour le LLM
    history = list(
        conversation.messages.values('role', 'content').order_by('created_at')
    )

    # === Pipeline ===
    t0 = time.time()

    # 1. Normalisation
    normalized = normalizer.normalize(user_message)

    # 2. Ontologie
    onto_result = ontology.validate_and_enrich(normalized)

    thinking = ''

    if not onto_result['is_valid']:
        # Guardrail : question hors domaine
        bot_reply = onto_result['rejection_reason']
        pipeline_meta = {'guardrail': True, 'latency_ms': round((time.time() - t0) * 1000)}
        rag_result = {'retrieved_docs': [], 'rag_context': ''}
    else:
        # 3. RAG
        rag_result = rag.retrieve(onto_result)

        # 4. LLM
        full_context = {**onto_result, **rag_result}
        llm_result  = llm.generate(full_context, history=history)
        bot_reply   = llm_result["reply"]
        thinking    = llm_result.get("thinking", "")
        input_tok   = llm_result.get("input_tokens", 0)
        output_tok  = llm_result.get("output_tokens", 0)
        llm_latency = llm_result.get("latency_ms", 0)
        quota       = llm_result.get("quota", {})

        # Si disclaimer RAG → l'ajouter en tête de la réponse
        disclaimer = rag_result.get('disclaimer')
        if disclaimer:
            bot_reply = f"{disclaimer}\n\n{bot_reply}"

        pipeline_meta = {
            'guardrail': False,
            'context_tags': onto_result.get('context_tags', []),
            'rag_source': rag_result.get('source', 'none'),
            'confidence_level': rag_result.get('confidence_level', 'none'),
            'has_data': rag_result.get('has_data', False),
            'docs_retrieved': len(rag_result.get('retrieved_docs', [])),
            'language': normalized['language'],
            'latency_ms': round((time.time() - t0) * 1000),
            'input_tokens': input_tok,
            'output_tokens': output_tok,
            'llm_latency_ms': llm_latency,
        }

    # Sauvegarder les messages
    Message.objects.create(
        conversation=conversation,
        role=Message.ROLE_USER,
        content=user_message,
        pipeline_meta={},
    )
    Message.objects.create(
        conversation=conversation,
        role=Message.ROLE_ASSISTANT,
        content=bot_reply,
        sources=[d.get('url', '') for d in rag_result.get('retrieved_docs', [])],
        pipeline_meta=pipeline_meta,
    )

    return Response({
        'conversation_id': conversation.pk,
        'reply': bot_reply,
        'thinking': thinking,
        'sources': rag_result.get('retrieved_docs', []),
        'meta': pipeline_meta,
        'quota': quota,
    })


class ConversationViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = ConversationSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Conversation.objects.filter(user=self.request.user).prefetch_related('messages')
