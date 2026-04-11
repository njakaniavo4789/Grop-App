import pytest
from django.contrib.auth import get_user_model

User = get_user_model()


@pytest.fixture
def user(db):
    return User.objects.create_user(email='farmer@test.mg', name='Famer', password='pass1234')


@pytest.mark.django_db
class TestFarmModel:
    def test_create_farm(self, user):
        from crops.models import Farm
        farm = Farm.objects.create(
            owner=user,
            name='Rizière Antsirabe',
            region='vakinankaratra',
            area_hectares=2.5,
        )
        assert farm.pk is not None
        assert str(farm) == 'Rizière Antsirabe (Vakinankaratra) — farmer@test.mg'

    def test_farm_belongs_to_owner(self, user):
        from crops.models import Farm
        Farm.objects.create(owner=user, name='Test Farm', region='analamanga', area_hectares=1.0)
        assert Farm.objects.filter(owner=user).count() == 1


@pytest.mark.django_db
class TestCropModel:
    def test_create_rice_crop(self, user):
        from crops.models import Farm, Crop
        from datetime import date
        farm = Farm.objects.create(owner=user, name='Rizière', region='analamanga', area_hectares=1.0)
        crop = Crop.objects.create(
            farm=farm,
            crop_type='rice',
            soil_type='alluvial',
            planted_at=date(2025, 11, 1),
            expected_harvest=date(2026, 3, 1),
        )
        assert crop.pk is not None
        assert crop.status == 'planned'
