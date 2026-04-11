from rest_framework import viewsets, permissions
from .models import Farm, Crop, SoilData
from .serializers import FarmSerializer, CropSerializer, SoilDataSerializer


class FarmViewSet(viewsets.ModelViewSet):
    serializer_class = FarmSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Farm.objects.filter(owner=self.request.user).prefetch_related('crops')


class CropViewSet(viewsets.ModelViewSet):
    serializer_class = CropSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Crop.objects.filter(farm__owner=self.request.user).select_related('farm')


class SoilDataViewSet(viewsets.ModelViewSet):
    serializer_class = SoilDataSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return SoilData.objects.filter(farm__owner=self.request.user).select_related('farm')
