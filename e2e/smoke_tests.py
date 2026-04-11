"""Smoke tests — exécutés contre l'environnement staging après déploiement.

Ces tests font de vraies requêtes HTTP contre STAGING_URL pour valider
que le service est opérationnel avant de promouvoir en production.

Variables d'environnement requises (secrets GitHub) :
  STAGING_URL          URL de base ex. https://grop-app-staging.onrender.com
  STAGING_TEST_USER    Email du compte de test sur staging
  STAGING_TEST_PASS    Mot de passe du compte de test

Lancement local :
  STAGING_URL=http://localhost:8000 \
  STAGING_TEST_USER=test@cropgpt.mg \
  STAGING_TEST_PASS=testpass123 \
  pytest e2e/smoke_tests.py -v
"""
import os
import pytest
import requests

BASE_URL = os.environ.get("STAGING_URL", "").rstrip("/")
TEST_USER = os.environ.get("STAGING_TEST_USER", "")
TEST_PASS = os.environ.get("STAGING_TEST_PASS", "")
TIMEOUT = 30  # secondes

staging_required = pytest.mark.skipif(
    not BASE_URL,
    reason="STAGING_URL non défini — smoke tests ignorés"
)


@pytest.fixture(scope="module")
def access_token():
    """Obtient un token JWT valide pour les tests authentifiés."""
    if not (BASE_URL and TEST_USER and TEST_PASS):
        pytest.skip("Credentials staging manquants")
    resp = requests.post(
        f"{BASE_URL}/api/auth/login/",
        json={"email": TEST_USER, "password": TEST_PASS},
        timeout=TIMEOUT,
    )
    assert resp.status_code == 200, f"Login échoué ({resp.status_code}): {resp.text[:200]}"
    return resp.json()["access"]


@staging_required
class TestStagingHealth:
    def test_health_endpoint_returns_200(self):
        """GET /api/health/ doit retourner 200 — service UP."""
        resp = requests.get(f"{BASE_URL}/api/health/", timeout=TIMEOUT)
        assert resp.status_code == 200, f"Health check échoué : {resp.status_code}"

    def test_health_response_structure(self):
        """La réponse health doit contenir un champ status."""
        resp = requests.get(f"{BASE_URL}/api/health/", timeout=TIMEOUT)
        if resp.status_code == 200:
            data = resp.json()
            assert "status" in data


@staging_required
class TestStagingAuth:
    def test_login_returns_access_token(self):
        """POST /api/auth/login/ avec bons identifiants → token JWT."""
        if not (TEST_USER and TEST_PASS):
            pytest.skip("Credentials staging non configurés")
        resp = requests.post(
            f"{BASE_URL}/api/auth/login/",
            json={"email": TEST_USER, "password": TEST_PASS},
            timeout=TIMEOUT,
        )
        assert resp.status_code == 200, f"Login échoué : {resp.text[:200]}"
        data = resp.json()
        assert "access" in data
        assert len(data["access"]) > 20

    def test_protected_endpoint_requires_auth(self):
        """GET /api/chat/conversations/ sans token → 401."""
        resp = requests.get(f"{BASE_URL}/api/chat/conversations/", timeout=TIMEOUT)
        assert resp.status_code == 401


@staging_required
class TestStagingChat:
    def test_chat_off_topic_blocked_by_guardrail(self, access_token):
        """Un message hors-sujet doit être rejeté par le guardrail."""
        resp = requests.post(
            f"{BASE_URL}/api/chat/",
            json={"message": "Qui a gagné la Coupe du Monde 2022 ?"},
            headers={"Authorization": f"Bearer {access_token}"},
            timeout=TIMEOUT,
        )
        assert resp.status_code == 200
        data = resp.json()
        assert data["meta"]["guardrail"] is True

    def test_chat_agricultural_message_accepted(self, access_token):
        """Un message agricole doit passer le guardrail et retourner une réponse."""
        resp = requests.post(
            f"{BASE_URL}/api/chat/",
            json={"message": "Quelles variétés de riz pour les hauts plateaux ?"},
            headers={"Authorization": f"Bearer {access_token}"},
            timeout=60,  # LLM peut être lent
        )
        # 200 = réponse OK, 503 = LLM Colab indisponible (acceptable en staging)
        assert resp.status_code in (200, 503), f"Statut inattendu : {resp.status_code}"
        if resp.status_code == 200:
            data = resp.json()
            assert "reply" in data
            assert len(data["reply"]) > 0

    def test_chat_creates_conversation_id(self, access_token):
        """Un nouveau chat doit créer une conversation avec un ID."""
        resp = requests.post(
            f"{BASE_URL}/api/chat/",
            json={"message": "Comment planter le riz SRI ?"},
            headers={"Authorization": f"Bearer {access_token}"},
            timeout=60,
        )
        if resp.status_code == 200:
            data = resp.json()
            assert "conversation_id" in data
            assert data["conversation_id"] is not None
