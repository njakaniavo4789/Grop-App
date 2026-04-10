from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import predict, PredictionViewSet

router = DefaultRouter()
router.register(r'history', PredictionViewSet, basename='prediction')

urlpatterns = [
    path('predict/', predict, name='predict'),
    path('', include(router.urls)),
]
