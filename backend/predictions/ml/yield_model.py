"""
Interface générique pour les modèles de prédiction de rendement.
Dispatch vers le modèle spécifique selon le type de culture.
"""
from .rice_model import predict as predict_rice


CROP_MODELS = {
    'rice': predict_rice,
}


def predict_yield(crop_type: str, features: dict) -> dict:
    """
    Dispatch la prédiction vers le bon modèle selon le type de culture.

    Args:
        crop_type : type de culture ('rice', 'maize', …)
        features  : dict de features (voir modèle spécifique)

    Returns:
        dict de prédiction ou erreur si culture non supportée
    """
    model_fn = CROP_MODELS.get(crop_type)
    if model_fn is None:
        return {
            'error': f"Modèle non disponible pour '{crop_type}'. "
                     f"Cultures supportées : {list(CROP_MODELS.keys())}",
            'predicted_yield_kg_ha': None,
        }
    return model_fn(features)
