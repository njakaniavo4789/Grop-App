"""Tests du LLM hébergé sur Google Colab.

Ces tests sont SKIPÉS automatiquement si COLAB_LLM_URL n'est pas défini
(ex : en CI sans secret configuré). Ils nécessitent que le notebook Colab
soit actif et que l'URL ngrok soit à jour dans .env.
"""
import os
import pytest

COLAB_URL = os.environ.get("COLAB_LLM_URL", "").rstrip("/")
colab_required = pytest.mark.skipif(
    not COLAB_URL,
    reason="COLAB_LLM_URL non défini — notebook Colab inactif ou secret manquant"
)


@colab_required
class TestColabLLMHealth:
    def test_health_endpoint_returns_ok(self):
        """GET /health doit retourner status=ok et le device CUDA."""
        import requests
        resp = requests.get(f"{COLAB_URL}/health", timeout=10)
        assert resp.status_code == 200
        data = resp.json()
        assert data.get('status') == 'ok'
        assert 'device' in data

    def test_health_response_has_model_info(self):
        """Le health check doit indiquer le chemin du modèle."""
        import requests
        resp = requests.get(f"{COLAB_URL}/health", timeout=10)
        assert resp.status_code == 200
        data = resp.json()
        assert 'model_path' in data


@colab_required
class TestColabLLMGenerate:
    def test_blocking_generate_returns_text(self):
        """_call_colab_blocking doit retourner du texte non vide."""
        import django
        if not os.environ.get('DJANGO_SETTINGS_MODULE'):
            os.environ['DJANGO_SETTINGS_MODULE'] = 'config.settings.development'
            django.setup()
        from chat.pipeline.llm import _call_colab_blocking
        result = _call_colab_blocking("Bonjour, donne-moi un conseil pour le riz.")
        assert isinstance(result, str)
        assert len(result) > 10, f"Réponse trop courte : '{result}'"

    def test_stream_yields_at_least_one_token(self):
        """stream_generate doit yielder au moins un token avant done=True."""
        import django
        if not os.environ.get('DJANGO_SETTINGS_MODULE'):
            os.environ['DJANGO_SETTINGS_MODULE'] = 'config.settings.development'
            django.setup()
        from chat.pipeline.llm import stream_generate
        tokens = []
        for chunk in stream_generate("Quel est le meilleur engrais pour le riz ?"):
            if chunk.get('token'):
                tokens.append(chunk['token'])
            if chunk.get('done'):
                break
        assert len(tokens) > 0, "Aucun token reçu du stream Colab"

    def test_generate_full_pipeline(self):
        """generate() doit retourner un dict complet avec reply non vide."""
        import django
        if not os.environ.get('DJANGO_SETTINGS_MODULE'):
            os.environ['DJANGO_SETTINGS_MODULE'] = 'config.settings.development'
            django.setup()
        from chat.pipeline.llm import generate
        result = generate({
            'enriched_text': 'Quelles variétés de riz pour les hauts plateaux ?',
            'rag_context': '',
            'confidence_level': 'none',
        })
        assert 'reply' in result
        assert len(result['reply']) > 10
        assert 'latency_ms' in result
        assert result['latency_ms'] > 0

    def test_generate_rejects_without_colab_url(self, monkeypatch):
        """Sans COLAB_LLM_URL, generate() doit retourner un message d'erreur propre."""
        import django
        if not os.environ.get('DJANGO_SETTINGS_MODULE'):
            os.environ['DJANGO_SETTINGS_MODULE'] = 'config.settings.development'
            django.setup()
        import chat.pipeline.llm as llm_module
        monkeypatch.setattr(llm_module, 'COLAB_LLM_URL', '')
        result = llm_module.generate({
            'enriched_text': 'test',
            'rag_context': '',
            'confidence_level': 'none',
        })
        assert 'reply' in result
        assert 'error' in result or 'injoignable' in result['reply'].lower() or 'défini' in result['reply'].lower()
