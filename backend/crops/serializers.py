from rest_framework import serializers
from .models import Farm, Crop, SoilData


class SoilDataSerializer(serializers.ModelSerializer):
    class Meta:
        model = SoilData
        fields = '__all__'
        read_only_fields = ('id',)


class CropSerializer(serializers.ModelSerializer):
    crop_type_display = serializers.CharField(source='get_crop_type_display', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)

    class Meta:
        model = Crop
        fields = '__all__'
        read_only_fields = ('id', 'created_at')


class FarmSerializer(serializers.ModelSerializer):
    region_display = serializers.CharField(source='get_region_display', read_only=True)
    crops = CropSerializer(many=True, read_only=True)
    owner_email = serializers.EmailField(source='owner.email', read_only=True)

    class Meta:
        model = Farm
        fields = '__all__'
        read_only_fields = ('id', 'owner', 'created_at', 'updated_at')

    def create(self, validated_data):
        validated_data['owner'] = self.context['request'].user
        return super().create(validated_data)
