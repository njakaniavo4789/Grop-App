from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import FarmViewSet, CropViewSet, SoilDataViewSet

router = DefaultRouter()
router.register(r'farms', FarmViewSet, basename='farm')
router.register(r'crops', CropViewSet, basename='crop')
router.register(r'soil', SoilDataViewSet, basename='soildata')

urlpatterns = [
    path('', include(router.urls)),
]
