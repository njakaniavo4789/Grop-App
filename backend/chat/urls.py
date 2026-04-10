from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import chat, ConversationViewSet
from .views_test import direct_chat

router = DefaultRouter()
router.register(r'conversations', ConversationViewSet, basename='conversation')

urlpatterns = [
    path('direct/', direct_chat, name='chat-direct'),   # ← test sans RAG
    path('', chat, name='chat'),                         # ← pipeline complet
    path('', include(router.urls)),
]
