from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import chat, ConversationViewSet

router = DefaultRouter()
router.register(r'conversations', ConversationViewSet, basename='conversation')

urlpatterns = [
    path('', chat, name='chat'),
    path('', include(router.urls)),
]
