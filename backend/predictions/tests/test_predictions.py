import pytest
from predictions.ml.rice_model import predict
from predictions.ml.yield_model import predict_yield


class TestRiceModel:
    def test_irrigated_higher_than_rainfed(self):
        irrigated = predict({'region': 'analamanga', 'irrigation': True, 'soil_type': 'alluvial'})
        rainfed = predict({'region': 'analamanga', 'irrigation': False, 'soil_type': 'alluvial'})
        assert irrigated['predicted_yield_kg_ha'] > rainfed['predicted_yield_kg_ha']

    def test_sri_increases_yield(self):
        without_sri = predict({'region': 'analamanga', 'irrigation': True, 'soil_type': 'alluvial', 'sri_method': False})
        with_sri = predict({'region': 'analamanga', 'irrigation': True, 'soil_type': 'alluvial', 'sri_method': True})
        assert with_sri['predicted_yield_kg_ha'] > without_sri['predicted_yield_kg_ha']

    def test_alluvial_better_than_laterite(self):
        alluvial = predict({'region': 'alaotra_mangoro', 'irrigation': True, 'soil_type': 'alluvial'})
        laterite = predict({'region': 'alaotra_mangoro', 'irrigation': True, 'soil_type': 'laterite'})
        assert alluvial['predicted_yield_kg_ha'] > laterite['predicted_yield_kg_ha']

    def test_confidence_score_range(self):
        result = predict({'region': 'default', 'irrigation': False, 'soil_type': 'loam'})
        assert 0.0 <= result['confidence_score'] <= 1.0

    def test_returns_recommendation(self):
        result = predict({'region': 'default', 'irrigation': False, 'soil_type': 'laterite', 'n_fertilizer': 0})
        assert result['recommendation'] != ''

    def test_feature_importance_sums_to_one(self):
        result = predict({'region': 'analamanga', 'irrigation': True, 'soil_type': 'alluvial'})
        total = sum(result['feature_importance'].values())
        assert abs(total - 1.0) < 0.01


class TestYieldModelDispatch:
    def test_dispatches_rice(self):
        result = predict_yield('rice', {'region': 'analamanga', 'irrigation': True, 'soil_type': 'alluvial'})
        assert 'predicted_yield_kg_ha' in result
        assert result['predicted_yield_kg_ha'] is not None

    def test_unsupported_crop_returns_error(self):
        result = predict_yield('quinoa', {})
        assert 'error' in result
        assert result['predicted_yield_kg_ha'] is None
