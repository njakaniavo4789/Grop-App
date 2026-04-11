from rest_framework import serializers
from .models import Prediction, MLModelVersion


class MLModelVersionSerializer(serializers.ModelSerializer):
    class Meta:
        model = MLModelVersion
        fields = ['id', 'name', 'version', 'crop_type', 'metrics', 'is_active', 'created_at']


class PredictionSerializer(serializers.ModelSerializer):
    crop_type = serializers.CharField(source='crop.crop_type', read_only=True)
    farm_name = serializers.CharField(source='farm.name', read_only=True)
    region = serializers.CharField(source='farm.region', read_only=True)

    class Meta:
        model = Prediction
        fields = [
            'id', 'farm', 'farm_name', 'crop', 'crop_type', 'region',
            'predicted_yield_kg_ha', 'confidence_score',
            'feature_importance', 'recommendation', 'created_at',
        ]
        read_only_fields = ('id', 'created_at')


class PredictRequestSerializer(serializers.Serializer):
    crop_id = serializers.IntegerField()
    irrigation = serializers.BooleanField(default=False)
    sri_method = serializers.BooleanField(default=False)
    rainfall_mm = serializers.FloatField(default=1200, min_value=0)
    temp_avg_c = serializers.FloatField(default=24, min_value=10, max_value=40)
    n_fertilizer = serializers.FloatField(default=0, min_value=0)
    p_fertilizer = serializers.FloatField(default=0, min_value=0)
